const tags = [
  {
    name: 'Additional Costs',
    description: 'Additional costs management'
  }
]

const paths = {
  '/additional-costs': {
    get: {
      tags: ['Additional Costs'],
      description: 'List additional costs with pagination and filters',
      parameters: [
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          required: false,
          description: 'Search term for additional cost name'
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
          name: 'methodOfPayment',
          schema: { type: 'string', enum: ['before', 'after'] },
          required: false,
          description: 'Filter by method of payment'
        },
        {
          in: 'query',
          name: 'billingType',
          schema: { type: 'string', enum: ['by_piece', 'one_time'] },
          required: false,
          description: 'Filter by billing type'
        },
        {
          in: 'query',
          name: 'acquisitionType',
          schema: { type: 'string', enum: ['buy', 'rent'] },
          required: false,
          description: 'Filter by acquisition type'
        }
      ],
      responses: {
        '200': {
          description: 'Additional costs retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/list_additional_costs_response'
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Additional Costs'],
      description: 'Create a new additional cost',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_additional_cost_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Additional cost created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/additional_cost_response'
              }
            }
          }
        }
      }
    }
  },
  '/additional-costs/{additionalCostId}': {
    get: {
      tags: ['Additional Costs'],
      description: 'Get an additional cost by ID',
      parameters: [
        {
          in: 'path',
          name: 'additionalCostId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Additional cost retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/additional_cost_response'
              }
            }
          }
        },
        '404': {
          description: 'Additional cost not found'
        }
      }
    },
    put: {
      tags: ['Additional Costs'],
      description: 'Update an existing additional cost',
      parameters: [
        {
          in: 'path',
          name: 'additionalCostId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_additional_cost_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Additional cost updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/additional_cost_response'
              }
            }
          }
        },
        '404': {
          description: 'Additional cost not found'
        }
      }
    },
    delete: {
      tags: ['Additional Costs'],
      description: 'Delete an additional cost',
      parameters: [
        {
          in: 'path',
          name: 'additionalCostId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Additional cost deleted successfully'
        },
        '404': {
          description: 'Additional cost not found'
        }
      }
    }
  }
}

const definitions = {
  additional_cost: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      name: { type: 'string' },
      methodOfPayment: {
        type: 'string',
        enum: ['before', 'after']
      },
      billingType: {
        type: 'string',
        enum: ['by_piece', 'one_time']
      },
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent']
      },
      price: { type: 'number' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    },
    required: [
      'id',
      'name',
      'methodOfPayment',
      'billingType',
      'acquisitionType',
      'price',
      'createdAt',
      'updatedAt'
    ]
  },
  create_additional_cost_body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      methodOfPayment: {
        type: 'string',
        enum: ['before', 'after']
      },
      billingType: {
        type: 'string',
        enum: ['by_piece', 'one_time']
      },
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent']
      },
      price: { type: 'number', minimum: 0 }
    },
    required: ['name', 'methodOfPayment', 'billingType', 'acquisitionType', 'price']
  },
  update_additional_cost_body: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1, maxLength: 255 },
      methodOfPayment: {
        type: 'string',
        enum: ['before', 'after']
      },
      billingType: {
        type: 'string',
        enum: ['by_piece', 'one_time']
      },
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent']
      },
      price: { type: 'number', minimum: 0 }
    }
  },
  additional_cost_response: {
    type: 'object',
    properties: {
      code: { type: 'integer' },
      data: {
        $ref: '#/definitions/additional_cost'
      }
    }
  },
  list_additional_costs_response: {
    type: 'object',
    properties: {
      code: { type: 'integer' },
      data: {
        type: 'object',
        properties: {
          additionalCosts: {
            type: 'array',
            items: {
              $ref: '#/definitions/additional_cost'
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

export const additionalCostDocs = { tags, paths, definitions }

