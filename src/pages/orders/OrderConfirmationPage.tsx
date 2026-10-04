import { Check } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export function OrderConfirmationPage() {
  const { orderId } = useParams()
  return (
    <main className="confirmation-page">
      <span className="confirmation-mark"><Check size={31} /></span>
      <p className="eyebrow">Payment successful · sandbox</p>
      <h1>You’re all set.</h1>
      <p>Your test payment was successful. Your order is ready to arrange collection.</p>
      <dl><div><dt>Order number</dt><dd>{orderId}</dd></div><div><dt>Payment</dt><dd>Sandbox · no real money</dd></div><div><dt>Next step</dt><dd>Arrange campus collection</dd></div></dl>
      <div className="confirmation-actions"><Link className="button button--primary" to={`/orders/${orderId}`}>View order</Link><Link className="button button--secondary" to="/home">Continue shopping</Link></div>
    </main>
  )
}
