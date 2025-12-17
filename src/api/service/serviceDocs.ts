const tags = [
  {
    name: 'Services',
    description: 'Service catalogue management'
  }
]

const paths = {
  '/services': {
    get: {
      tags: ['Services'],
      description: 'List services with pagination and prices',
      parameters: [
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          required: false,
          description: 'Search term for service name or description'
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
        }
      ],
      responses: {
        '200': {
          description: 'Services retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/list_services_response'
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Services'],
      description: 'Create a new service with prices',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_service_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Service created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/service_response'
              }
            }
          }
        }
      }
    }
  },
  '/services/{serviceId}': {
    get: {
      tags: ['Services'],
      description: 'Get a service by ID with prices',
      parameters: [
        {
          in: 'path',
          name: 'serviceId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Service retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/service_response'
              }
            }
          }
        },
        '404': {
          description: 'Service not found'
        }
      }
    },
    put: {
      tags: ['Services'],
      description:
        'Update an existing service and manage prices. Prices are provided as a complete array (like in create), and the system will automatically add new prices, remove prices that no longer match, and keep matching prices.',
      parameters: [
        {
          in: 'path',
          name: 'serviceId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_service_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Service updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/service_response'
              }
            }
          }
        },
        '404': {
          description: 'Service not found'
        }
      }
    },
    delete: {
      tags: ['Services'],
      description: 'Delete a service',
      parameters: [
        {
          in: 'path',
          name: 'serviceId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '204': {
          description: 'Service deleted successfully'
        },
        '404': {
          description: 'Service not found'
        }
      }
    }
  },
  '/services/prices': {
    get: {
      tags: ['Services'],
      description:
        'Get all service prices for all services, grouped by service.',
      responses: {
        '200': {
          description: 'Successfully retrieved all service prices',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_all_service_prices_response'
              }
            }
          }
        }
      }
    }
  }
}

const definitions = {
  create_service_body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 128
      },
      description: {
        type: 'string',
        nullable: true
      },
      priceCalculationUnit: {
        type: 'string',
        enum: ['piece', 'unit', 'transportationUnit'],
        nullable: true,
        description: 'Unit used for price calculation'
      },
      prices: {
        type: 'array',
        items: {
          type: 'object',
          required: ['minQuantity', 'price'],
          properties: {
            minQuantity: {
              type: 'integer',
              minimum: 1,
              description: 'Minimum quantity for this price tier'
            },
            maxQuantity: {
              type: 'integer',
              minimum: 1,
              nullable: true,
              description:
                'Maximum quantity for this price tier. If null, this tier has no upper limit. Must be >= minQuantity if provided.'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Price in EUR for this quantity range'
            }
          }
        },
        description:
          'Array of price tiers based on quantity. Tiers must not overlap and should be ordered by minQuantity.'
      }
    },
    example: {
      name: 'Family Counselling',
      description: 'Comprehensive support session for families.',
      priceCalculationUnit: 'piece',
      prices: [
        {
          minQuantity: 1,
          maxQuantity: 10,
          price: 500.0
        },
        {
          minQuantity: 11,
          maxQuantity: 50,
          price: 450.0
        },
        {
          minQuantity: 51,
          price: 400.0
        }
      ]
    }
  },
  update_service_body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 128
      },
      description: {
        type: 'string',
        nullable: true
      },
      priceCalculationUnit: {
        type: 'string',
        enum: ['piece', 'unit', 'transportationUnit'],
        nullable: true,
        description: 'Unit used for price calculation'
      },
      prices: {
        type: 'array',
        items: {
          type: 'object',
          required: ['minQuantity', 'price'],
          properties: {
            minQuantity: {
              type: 'integer',
              minimum: 1,
              description: 'Minimum quantity for this price tier'
            },
            maxQuantity: {
              type: 'integer',
              minimum: 1,
              nullable: true,
              description:
                'Maximum quantity for this price tier. If null, this tier has no upper limit. Must be >= minQuantity if provided.'
            },
            price: {
              type: 'number',
              minimum: 0,
              description: 'Price in EUR for this quantity range'
            }
          }
        },
        description:
          "Array of price tiers. The system will compare these with existing prices: prices that match (same minQuantity, maxQuantity, and price) will be kept, prices that don't match any existing price will be added, and existing prices that don't match any provided price will be removed. If empty array is provided, all existing prices will be removed."
      }
    },
    example: {
      name: 'Family Counselling (Extended)',
      description: 'Extended counselling session including follow-up plan.',
      priceCalculationUnit: 'piece',
      prices: [
        {
          minQuantity: 1,
          maxQuantity: 10,
          price: 550.0
        },
        {
          minQuantity: 11,
          price: 480.0
        }
      ]
    }
  },
  service_response: {
    type: 'object',
    example: {
      id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      name: 'Family Counselling',
      description: 'Comprehensive support session for families.',
      priceCalculationUnit: 'piece',
      prices: [
        {
          id: 'price-id-1',
          minQuantity: 1,
          maxQuantity: 10,
          price: 500.0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'price-id-2',
          minQuantity: 11,
          maxQuantity: 50,
          price: 450.0,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  },
  list_services_response: {
    type: 'object',
    example: {
      data: {
        services: [
          {
            id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            name: 'Family Counselling',
            description: 'Comprehensive support session for families.',
            priceCalculationUnit: 'piece',
            locations: 'Reykjavik, Akureyri',
            prices: [
              {
                id: 'price-id-1',
                minQuantity: 1,
                maxQuantity: 10,
                price: 500.0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
              },
              {
                id: 'price-id-2',
                minQuantity: 11,
                maxQuantity: 50,
                price: 450.0,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
              }
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
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
  get_all_service_prices_response: {
    type: 'object',
    example: {
      data: [
        {
          serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          serviceName: 'Sample Service',
          priceCalculationUnit: 'piece',
          prices: [
            {
              id: 'price-id-1',
              minQuantity: 1,
              maxQuantity: 100,
              price: 25.5,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'price-id-2',
              minQuantity: 101,
              maxQuantity: 500,
              price: 22.0,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'price-id-3',
              minQuantity: 501,
              maxQuantity: null,
              price: 20.0,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ]
        }
      ],
      code: 200000,
      message: 'OK'
    }
  }
}

export const serviceDocs = { tags, paths, definitions }
