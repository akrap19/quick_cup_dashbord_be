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
          description: 'Successfully listed orders',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/list_orders_response'
              }
            }
          }
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
          description:
            'Successfully retrieved order. The response includes serviceLocation information for each service, showing which service location (if any) the service is allocated to.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_order_response'
              }
            }
          }
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
          price: 15.0,
          serviceLocationId: 'uuid-here' // Optional: allocate service to a specific service location
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
      'Order number is automatically generated in format: qc-ddmmyy0000001. Each service in the services array can optionally include a serviceLocationId to allocate the service to a specific service location.'
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
      services: [
        {
          serviceId: 'uuid-here',
          quantity: 1,
          price: 15.0,
          serviceLocationId: 'uuid-here' // Optional: allocate service to a specific service location
        }
      ],
      additionalCosts: [
        {
          additionalCostId: 'uuid-here',
          price: 15.75,
          quantity: 1
        }
      ]
    },
    description:
      'Each service in the services array can optionally include a serviceLocationId to allocate the service to a specific service location.'
  },
  update_order_status_body: {
    example: {
      status: 'ACCEPTED'
    },
    description:
      'Valid status values: PENDING, ACCEPTED, DECLINED, PAYMENT_PENDING, PAYMENT_RECEIVED, IN_PRODUCTION, READY, IN_TRANSIT, COMPLETED. The response will include statusInfo with title, description, customerMessage, and adminMessage.'
  },
  list_orders_response: {
    example: {
      data: {
        orders: [
          {
            id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            orderNumber: 'qc-0101240000001',
            status: 'PENDING',
            totalAmount: 149.99,
            customerName: 'John Doe',
            notes: 'Deliver before noon',
            acquisitionType: 'buy',
            customerId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
            eventId: '55069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            location: '123 Main St',
            place: 'Downtown',
            street: 'Main Street',
            contactPerson: 'John Doe',
            contactPersonContact: 'john@example.com',
            placedAt: '2024-01-01T10:00:00.000Z',
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T10:00:00.000Z',
            statusInfo: {
              title: 'Pending',
              description: 'Order is pending review',
              customerMessage: 'Your order is being reviewed',
              adminMessage: 'Order requires review'
            },
            customer: {
              id: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com'
            },
            event: {
              id: '55069d61-3f62-4f3f-b8c4-10f3f26b4e51',
              name: 'Summer Event 2024',
              startDate: '2024-06-01T00:00:00.000Z',
              endDate: '2024-06-30T23:59:59.000Z'
            },
            products: [
              {
                id: '66069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                orderId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
                productId: '77069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                quantity: 2,
                price: 25.99,
                createdAt: '2024-01-01T10:00:00.000Z',
                updatedAt: '2024-01-01T10:00:00.000Z'
              }
            ],
            services: [
              {
                id: '88069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                orderId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
                serviceId: '99069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                quantity: 1,
                price: 15.0,
                serviceLocationId: 'aa069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                createdAt: '2024-01-01T10:00:00.000Z',
                updatedAt: '2024-01-01T10:00:00.000Z',
                serviceLocation: {
                  id: 'aa069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                  name: 'Main Office',
                  address: '123 Service St'
                }
              }
            ],
            additionalCosts: [
              {
                id: 'bb069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                orderId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
                additionalCostId: 'cc069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                price: 10.5,
                quantity: 2,
                createdAt: '2024-01-01T10:00:00.000Z',
                updatedAt: '2024-01-01T10:00:00.000Z',
                additionalCost: {
                  id: 'cc069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                  name: 'Delivery Fee',
                  billingType: 'by_piece'
                }
              }
            ]
          }
        ],
        pagination: {
          count: 1,
          page: 1,
          limit: 25
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_order_response: {
    example: {
      data: {
        id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        orderNumber: 'qc-0101240000001',
        status: 'PENDING',
        totalAmount: 149.99,
        customerName: 'John Doe',
        notes: 'Deliver before noon',
        acquisitionType: 'buy',
        customerId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
        eventId: '55069d61-3f62-4f3f-b8c4-10f3f26b4e51',
        location: '123 Main St',
        place: 'Downtown',
        street: 'Main Street',
        contactPerson: 'John Doe',
        contactPersonContact: 'john@example.com',
        placedAt: '2024-01-01T10:00:00.000Z',
        createdAt: '2024-01-01T10:00:00.000Z',
        updatedAt: '2024-01-01T10:00:00.000Z',
        statusInfo: {
          title: 'Pending',
          description: 'Order is pending review',
          customerMessage: 'Your order is being reviewed',
          adminMessage: 'Order requires review'
        },
        customer: {
          id: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890'
        },
        event: {
          id: '55069d61-3f62-4f3f-b8c4-10f3f26b4e51',
          name: 'Summer Event 2024',
          startDate: '2024-06-01T00:00:00.000Z',
          endDate: '2024-06-30T23:59:59.000Z'
        },
        products: [
          {
            id: '66069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            orderId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            productId: '77069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            quantity: 2,
            price: 25.99,
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T10:00:00.000Z',
            product: {
              id: '77069d61-3f62-4f3f-b8c4-10f3f26b4e51',
              name: 'Product Name',
              description: 'Product description',
              images: [
                {
                  id: 'dd069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                  mediaId: 'ee069d61-3f62-4f3f-b8c4-10f3f26b4e51',
                  name: 'product-image.jpg',
                  url: 'https://example.com/images/product-image.jpg',
                  createdAt: '2024-01-01T10:00:00.000Z'
                }
              ]
            }
          }
        ],
        services: [
          {
            id: '88069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            orderId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            serviceId: '99069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            quantity: 1,
            price: 15.0,
            serviceLocationId: 'aa069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T10:00:00.000Z',
            service: {
              id: '99069d61-3f62-4f3f-b8c4-10f3f26b4e51',
              name: 'Service Name',
              description: 'Service description'
            },
            serviceLocation: {
              id: 'aa069d61-3f62-4f3f-b8c4-10f3f26b4e51',
              name: 'Main Office',
              address: '123 Service St'
            }
          }
        ],
        additionalCosts: [
          {
            id: 'bb069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            orderId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            additionalCostId: 'cc069d61-3f62-4f3f-b8c4-10f3f26b4e51',
            price: 10.5,
            quantity: 2,
            createdAt: '2024-01-01T10:00:00.000Z',
            updatedAt: '2024-01-01T10:00:00.000Z',
            additionalCost: {
              id: 'cc069d61-3f62-4f3f-b8c4-10f3f26b4e51',
              name: 'Delivery Fee',
              billingType: 'by_piece'
            }
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  }
}

export const ordersDocs = { tags, paths, definitions }
