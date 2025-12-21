export enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  IN_PRODUCTION = 'IN_PRODUCTION',
  READY = 'READY',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED'
}

export interface OrderStatusDescription {
  title: string
  description: string
  customerMessage: string
  adminMessage?: string
}

export const ORDER_STATUS_DESCRIPTIONS: Record<
  OrderStatus,
  OrderStatusDescription
> = {
  [OrderStatus.PENDING]: {
    title: 'Order Received',
    description: 'Your order has been received and is being reviewed.',
    customerMessage:
      'Your order has been received and is being reviewed. We will notify you once your order is processed.',
    adminMessage: 'New order received. Please review and process.'
  },
  [OrderStatus.ACCEPTED]: {
    title: 'Order Accepted',
    description:
      'Your order has been accepted. We are preparing the invoice and design template. We will contact you once everything is ready.',
    customerMessage:
      'Great news! Your order has been accepted. We are currently preparing your invoice and design template. We will contact you once everything is ready.',
    adminMessage:
      'Order has been accepted. Prepare invoice and design template.'
  },
  [OrderStatus.DECLINED]: {
    title: 'Order Declined',
    description:
      'Unfortunately, your order has been declined due to unavailability or other reasons.',
    customerMessage:
      'Unfortunately, your order has been declined. Please contact us for more information or to discuss alternative options.',
    adminMessage: 'Order has been declined.'
  },
  [OrderStatus.PAYMENT_PENDING]: {
    title: 'Invoice Sent - Awaiting Payment',
    description:
      'Your invoice and design template have been sent. Once we receive 50% advance payment, we will begin preparing your order.',
    customerMessage:
      'Your invoice and design template have been sent. Please complete the 50% advance payment to proceed with order preparation. Once payment is received, we will begin preparing your order.',
    adminMessage:
      'Advance payment invoice and design template sent to customer. Awaiting 50% advance payment.'
  },
  [OrderStatus.PAYMENT_RECEIVED]: {
    title: 'Payment Received',
    description:
      'We have received your payment. Your order will begin preparation shortly.',
    customerMessage:
      'Thank you! We have received your payment. Your order will begin preparation shortly.',
    adminMessage: 'Payment received. Begin order preparation.'
  },
  [OrderStatus.IN_PRODUCTION]: {
    title: 'Order in Production',
    description: 'Your order is being prepared and will be ready soon.',
    customerMessage:
      "Your order is currently being prepared and will be ready soon. We will notify you when it's complete.",
    adminMessage: 'Order is being prepared.'
  },
  [OrderStatus.READY]: {
    title: 'Order Ready',
    description: 'Your order is ready and will be shipped/picked up soon.',
    customerMessage:
      'Great news! Your order is ready and will be shipped or ready for pickup soon.',
    adminMessage: 'Order preparation complete. Ready for shipping/pickup.'
  },
  [OrderStatus.IN_TRANSIT]: {
    title: 'Order in Transit',
    description: 'Your order is on its way to you or ready for pickup.',
    customerMessage:
      "Your order is on its way! You can expect delivery soon, or it's ready for pickup at your convenience.",
    adminMessage: 'Order is out for delivery or ready for customer pickup.'
  },
  [OrderStatus.COMPLETED]: {
    title: 'Order Completed',
    description:
      'Your order has been completed. Final invoice has been sent. Thank you for your business!',
    customerMessage:
      'Your order has been completed successfully! The final invoice has been sent. Thank you for choosing Quick Cup!',
    adminMessage: 'Order completed successfully. Final invoice sent.'
  }
}

/**
 * Get status description by status string
 * Returns null if status doesn't match any enum value
 */
export function getStatusDescription(
  status: string
): OrderStatusDescription | null {
  if (status in ORDER_STATUS_DESCRIPTIONS) {
    return ORDER_STATUS_DESCRIPTIONS[status as OrderStatus]
  }
  return null
}
