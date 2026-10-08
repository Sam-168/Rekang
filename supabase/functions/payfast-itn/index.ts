import { createClient } from 'npm:@supabase/supabase-js@2'
import { parameterString, signature, validationUrl } from '../_shared/payfast.ts'

function textResponse(body: string, status = 200) {
  return new Response(body, { status, headers: { 'Content-Type': 'text/plain' } })
}

async function validSource(request: Request) {
  const sourceIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  if (!sourceIp) return false
  const hosts = ['sandbox.payfast.co.za']
  const resolved = (await Promise.all(hosts.map(async (host) => {
    try { return await Deno.resolveDns(host, 'A') } catch { return [] }
  }))).flat()
  return resolved.includes(sourceIp)
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return textResponse('Method not allowed', 405)
  try {
    const rawBody = await request.text()
    const posted = new URLSearchParams(rawBody)
    const passphrase = Deno.env.get('PAYFAST_PASSPHRASE') ?? ''
    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID')
    if (!merchantId || posted.get('merchant_id') !== merchantId) return textResponse('Invalid merchant', 400)
    if (posted.get('signature') !== signature(posted.entries(), passphrase)) return textResponse('Invalid signature', 400)
    if (!(await validSource(request))) return textResponse('Invalid source', 400)

    const validationBody = parameterString(posted.entries(), '')
    const validation = await fetch(validationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: validationBody,
    })
    if ((await validation.text()).trim() !== 'VALID') return textResponse('Invalid payment data', 400)

    const orderId = posted.get('m_payment_id')
    const providerReference = posted.get('pf_payment_id')
    const paymentStatus = posted.get('payment_status')
    const amountGross = posted.get('amount_gross')
    if (!orderId || !providerReference || !amountGross) return textResponse('Missing payment fields', 400)
    if (paymentStatus !== 'COMPLETE') return textResponse('OK')

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false },
    })
    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, total, status, payment_gateway, payment_reference')
      .eq('id', orderId)
      .maybeSingle()
    if (orderError || !order || order.payment_gateway !== 'payfast') return textResponse('Order not found', 404)
    if (Number(order.total).toFixed(2) !== Number(amountGross).toFixed(2)) return textResponse('Amount mismatch', 400)
    if (order.status === 'paid' && order.payment_reference === providerReference) return textResponse('OK')
    if (order.status !== 'pending_payment') return textResponse('Order cannot be paid', 409)

    const { error: updateError } = await admin
      .from('orders')
      .update({ status: 'paid', payment_reference: providerReference })
      .eq('id', order.id)
      .eq('status', 'pending_payment')
    if (updateError) throw updateError
    return textResponse('OK')
  } catch (error) {
    console.error(error)
    return textResponse('Payment notification failed', 500)
  }
})
