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
  }
}

const definitions = {
  create_order_body: {
    example: {
      orderNumber: 'ORD-1001',
      status: 'Pending',
      totalAmount: 49.99,
      customerName: 'Jane Doe',
      notes: 'Deliver before noon'
    }
  },
  update_order_body: {
    example: {
      status: 'Completed',
      totalAmount: 59.99
    }
  }
}

export const ordersDocs = { tags, paths, definitions }
