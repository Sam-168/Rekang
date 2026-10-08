import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders, jsonResponse, optionsResponse } from '../_shared/cors.ts'
import { processUrl } from '../_shared/payfast.ts'

type CheckoutRequest = { orderId?: string }

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return optionsResponse()
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed.' }, 405)

  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) return jsonResponse({ error: 'Sign in again to continue.' }, 401)

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const merchantId = Deno.env.get('PAYFAST_MERCHANT_ID')
    const merchantKey = Deno.env.get('PAYFAST_MERCHANT_KEY')
    const appUrl = (Deno.env.get('APP_URL') ?? '').replace(/\/$/, '')
    if (!merchantId || !merchantKey || !appUrl) {
      return jsonResponse({ error: 'PayFast is not configured yet.' }, 503)
    }

    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    })
    const { data: authData, error: authError } = await client.auth.getUser()
    if (authError || !authData.user) return jsonResponse({ error: 'Sign in again to continue.' }, 401)

    const { orderId } = await request.json() as CheckoutRequest
    if (!orderId) return jsonResponse({ error: 'Order ID is required.' }, 400)
    const { data: order, error: orderError } = await client
      .from('orders')
      .select('id, reference, buyer_id, total, status, payment_gateway')
      .eq('id', orderId)
      .maybeSingle()
    if (orderError || !order) return jsonResponse({ error: 'Order not found.' }, 404)
    if (order.buyer_id !== authData.user.id) return jsonResponse({ error: 'This order does not belong to you.' }, 403)
    if (order.status !== 'pending_payment') return jsonResponse({ error: 'This order is not awaiting payment.' }, 409)
    if (order.payment_gateway !== 'payfast') return jsonResponse({ error: 'This order does not use PayFast.' }, 409)

    const fullName = String(authData.user.user_metadata?.full_name ?? '').trim()
    const [firstName = '', ...surnameParts] = fullName.split(/\s+/)
    const fields: Record<string, string> = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${appUrl}/orders/${order.id}?payment=return`,
      cancel_url: `${appUrl}/orders/${order.id}?payment=cancelled`,
      notify_url: `${supabaseUrl}/functions/v1/payfast-itn`,
      name_first: firstName,
      name_last: surnameParts.join(' '),
      email_address: authData.user.email ?? '',
      m_payment_id: order.id,
      amount: Number(order.total).toFixed(2),
      item_name: `Rekang ${order.reference}`,
    }
    return jsonResponse({ processUrl, fields }, 200)
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: 'Payment checkout could not be started.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
