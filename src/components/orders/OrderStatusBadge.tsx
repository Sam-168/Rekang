import type { OrderStatus } from '../../types/marketplace'

const labels: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  ready_for_collection: 'Ready for collection',
  completed: 'Completed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`order-status order-status--${status}`}>{labels[status]}</span>
}
