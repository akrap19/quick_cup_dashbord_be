const tags = [
  {
    name: 'Product States',
    description: 'Product state management'
  }
]

const paths = {
  '/product-states': {
    get: {
      tags: ['Product States'],
      description: 'List product states with pagination and filters',
      parameters: [
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          required: false,
          description: 'Search term for product name or status'
        },
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1 },
          required: false,
          description: 'Pagination page'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100 },
          required: false,
          description: 'Results per page'
        },
        {
          in: 'query',
          name: 'status',
          schema: {
            type: 'string',
            enum: ['available', 'in_use', 'maintenance', 'reserved', 'damaged']
          },
          required: false,
          description: 'Filter by status'
        },
        {
          in: 'query',
          name: 'location',
          schema: { type: 'string', enum: ['service', 'user'] },
          required: false,
          description: 'Filter by location type'
        },
        {
          in: 'query',
          name: 'productId',
          schema: { type: 'string', format: 'uuid' },
          required: false,
          description: 'Filter by product ID'
        },
        {
          in: 'query',
          name: 'serviceId',
          schema: { type: 'string', format: 'uuid' },
          required: false,
          description: 'Filter by service ID'
        },
        {
          in: 'query',
          name: 'userId',
          schema: { type: 'string', format: 'uuid' },
          required: false,
          description: 'Filter by user ID'
        }
      ],
      responses: {
        '200': {
          description: 'Product states retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/list_product_states_response'
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Product States'],
      description: 'Create a new product state',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_product_state_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Product state created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/product_state_response'
              }
            }
          }
        }
      }
    }
  },
  '/product-states/{productStateId}': {
    get: {
      tags: ['Product States'],
      description: 'Get a product state by ID',
      parameters: [
        {
          in: 'path',
          name: 'productStateId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Product state retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/product_state_response'
              }
            }
          }
        },
        '404': {
          description: 'Product state not found'
        }
      }
    },
    put: {
      tags: ['Product States'],
      description: 'Update an existing product state',
      parameters: [
        {
          in: 'path',
          name: 'productStateId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_product_state_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Product state updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/product_state_response'
              }
            }
          }
        },
        '404': {
          description: 'Product state not found'
        }
      }
    },
    delete: {
      tags: ['Product States'],
      description: 'Delete a product state',
      parameters: [
        {
          in: 'path',
          name: 'productStateId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Product state deleted successfully'
        },
        '404': {
          description: 'Product state not found'
        }
      }
    }
  }
}

const definitions = {
  product_state: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      status: {
        type: 'string',
        enum: ['available', 'in_use', 'maintenance', 'reserved', 'damaged']
      },
      location: {
        type: 'string',
        enum: ['service', 'user']
      },
      productId: { type: 'string', format: 'uuid' },
      product: {
        type: 'object',
        description: 'Product details'
      },
      serviceId: { type: 'string', format: 'uuid', nullable: true },
      service: {
        type: 'object',
        nullable: true,
        description: 'Service details (when location is service)'
      },
      userId: { type: 'string', format: 'uuid', nullable: true },
      user: {
        type: 'object',
        nullable: true,
        description: 'User details (when location is user)'
      },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: [
      'id',
      'status',
      'location',
      'quantity',
      'productId',
      'createdAt',
      'updatedAt'
    ]
  },
  create_product_state_body: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['available', 'in_use', 'maintenance', 'reserved', 'damaged']
      },
      location: {
        type: 'string',
        enum: ['service', 'user']
      },
      quantity: {
        type: 'integer',
        minimum: 0,
        description: 'Quantity of products in this state'
      },
      productId: { type: 'string', format: 'uuid' },
      serviceId: {
        type: 'string',
        format: 'uuid',
        description: 'Required when location is "service"'
      },
      userId: {
        type: 'string',
        format: 'uuid',
        description: 'Required when location is "user"'
      }
    },
    required: ['status', 'location', 'quantity', 'productId']
  },
  update_product_state_body: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['available', 'in_use', 'maintenance', 'reserved', 'damaged']
      },
      location: {
        type: 'string',
        enum: ['service', 'user']
      },
      quantity: {
        type: 'integer',
        minimum: 0,
        description: 'Quantity of products in this state'
      },
      productId: { type: 'string', format: 'uuid' },
      serviceId: {
        type: 'string',
        format: 'uuid',
        description: 'Required when location is "service", must be null when location is "user"'
      },
      userId: {
        type: 'string',
        format: 'uuid',
        description: 'Required when location is "user", must be null when location is "service"'
      }
    }
  },
  product_state_response: {
    type: 'object',
    properties: {
      code: { type: 'integer' },
      data: {
        $ref: '#/definitions/product_state'
      }
    }
  },
  list_product_states_response: {
    type: 'object',
    properties: {
      code: { type: 'integer' },
      data: {
        type: 'object',
        properties: {
          productStates: {
            type: 'array',
            items: {
              $ref: '#/definitions/product_state'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              count: { type: 'integer' },
              page: { type: 'integer' },
              limit: { type: 'integer' }
            }
          }
        }
      }
    }
  }
}

export const productStateDocs = { tags, paths, definitions }

