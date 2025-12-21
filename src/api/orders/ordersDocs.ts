const tags = [
  {
    name: 'Orders',
    description: 'Order management routes'
  }
]

const paths = {
  '/orders': {
    get: {
      tags: ['Orders'],
      description: 'List orders',
      responses: {
        '200': {
          description: 'Successfully listed orders'
        }
      }
    },
    post: {
      tags: ['Orders'],
      description: 'Create a new order',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_order_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created order'
        }
      }
    }
  },
  '/orders/{orderId}': {
    get: {
      tags: ['Orders'],
      description: 'Get order details',
      parameters: [
        {
          in: 'path',
          name: 'orderId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved order'
        },
        '404': {
          description: 'Order not found'
        }
      }
    },
    put: {
      tags: ['Orders'],
      description: 'Update order',
      parameters: [
        {
          in: 'path',
          name: 'orderId',
          type: 'string',
          required: true
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_order_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully updated order'
        }
      }
    },
    delete: {
      tags: ['Orders'],
      description: 'Delete order',
      parameters: [
        {
          in: 'path',
          name: 'orderId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '204': {
          description: 'Successfully deleted order'
        }
      }
    }
  },
  '/orders/{orderId}/status': {
    patch: {
      tags: ['Orders'],
      description: 'Update order status',
      parameters: [
        {
          in: 'path',
          name: 'orderId',
          type: 'string',
          required: true
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_order_status_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully updated order status'
        },
        '404': {
          description: 'Order not found'
        }
      }
    }
  }
}

const definitions = {
  create_order_body: {
    example: {
      totalAmount: 49.99,
      notes: 'Deliver before noon',
      acquisitionType: 'buy',
      customerId: 'uuid-here',
      eventId: 'uuid-here',
      location: '123 Main St',
      place: 'Downtown',
      street: 'Main Street',
      contactPerson: 'John Doe',
      contactPersonContact: 'john@example.com',
      products: [
        {
          productId: 'uuid-here',
          quantity: 2,
          price: 25.99
        }
      ],
      services: [
        {
          serviceId: 'uuid-here',
          quantity: 1,
          price: 15.0
        }
      ],
      additionalCosts: [
        {
          additionalCostId: 'uuid-here',
          price: 10.5,
          quantity: 2
        }
      ]
    },
    description:
      'Order number is automatically generated in format: qc-ddmmyy0000001'
  },
  update_order_body: {
    example: {
      status: 'Completed',
      totalAmount: 59.99,
      acquisitionType: 'rent',
      location: '456 Oak Ave',
      place: 'Uptown',
      street: 'Oak Avenue',
      products: [
        {
          productId: 'uuid-here',
          quantity: 3,
          price: 20.0
        }
      ],
      additionalCosts: [
        {
          additionalCostId: 'uuid-here',
          price: 15.75,
          quantity: 1
        }
      ]
    }
  },
  update_order_status_body: {
    example: {
      status: 'ACCEPTED'
    },
    description:
      'Valid status values: PENDING, ACCEPTED, DECLINED, PAYMENT_PENDING, PAYMENT_RECEIVED, IN_PRODUCTION, READY, IN_TRANSIT, COMPLETED. The response will include statusInfo with title, description, customerMessage, and adminMessage.'
  }
}

export const ordersDocs = { tags, paths, definitions }
