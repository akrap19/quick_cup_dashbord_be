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
        'Get all service prices for all services, grouped by service, with buyPrices and rentPrices separated. Optionally filter by acquisition type (buy or rent). Services with acquisition type "both" will be included when filtering by either "buy" or "rent".',
      parameters: [
        {
          in: 'query',
          name: 'acquisitionType',
          schema: {
            type: 'string',
            enum: ['buy', 'rent']
          },
          required: false,
          description:
            'Filter services by acquisition type. If provided, returns services with matching acquisition type or "both".'
        }
      ],
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
  },
  '/services/service-locations': {
    get: {
      tags: ['Services'],
      description:
        'Get all service locations formatted as "service name - service location name". Returns an array of objects where each object contains the service location id and a formatted name in the format "Service Name - City".',
      responses: {
        '200': {
          description: 'Successfully retrieved all service locations',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_all_service_locations_response'
              }
            }
          }
        }
      }
    }
  },
  '/services/{serviceId}/calculate-price': {
    post: {
      tags: ['Services'],
      description:
        'Calculate service price based on service ID, product ID, and quantity. The calculation uses the service\'s priceCalculationUnit to determine the effective quantity: "piece" uses the quantity directly, "unit" divides quantity by product\'s quantityPerUnit, and "transportationUnit" divides units by product\'s unitsPerTransportationUnit (rounded up if over 1).',
      parameters: [
        {
          in: 'path',
          name: 'serviceId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Service ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/calculate_service_price_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Service price calculated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/calculate_service_price_response'
              }
            }
          }
        },
        '400': {
          description:
            'Bad request - missing required product fields for calculation'
        },
        '404': {
          description: 'Service or product not found, or no price tier found'
        }
      }
    }
  },
  '/services/{serviceId}/calculate-price-multiple': {
    post: {
      tags: ['Services'],
      description:
        'Calculate service price for multiple products. Calculates the effective quantity for each product based on the service\'s priceCalculationUnit, combines all calculated quantities, and then calculates the total price based on the combined quantity. For "transportationUnit", if the calculated quantity is over 1, it is rounded up (ceiling).',
      parameters: [
        {
          in: 'path',
          name: 'serviceId',
          required: true,
          schema: { type: 'string', format: 'uuid' },
          description: 'Service ID'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/calculate_service_price_multiple_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description:
            'Service price calculated successfully for multiple products',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/calculate_service_price_multiple_response'
              }
            }
          }
        },
        '400': {
          description:
            'Bad request - missing required product fields for calculation'
        },
        '404': {
          description: 'Service or product not found, or no price tier found'
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
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent', 'both'],
        nullable: true,
        description: 'Acquisition type: buy, rent, or both'
      },
      billingInterval: {
        type: 'string',
        enum: ['one_time', 'weekly', 'monthly'],
        nullable: true,
        description: 'Billing interval: one time, weekly, or monthly'
      },
      isDefaultServiceForBuy: {
        type: 'boolean',
        nullable: true,
        description: 'Whether this service is default for buy acquisition type'
      },
      isDefaultServiceForRent: {
        type: 'boolean',
        nullable: true,
        description: 'Whether this service is default for rent acquisition type'
      },
      inputTypeForBuy: {
        type: 'string',
        enum: ['before', 'after', 'both'],
        nullable: true,
        description: 'Input type for buy acquisition: before, after, or both'
      },
      inputTypeForRent: {
        type: 'string',
        enum: ['before', 'after', 'both'],
        nullable: true,
        description: 'Input type for rent acquisition: before, after, or both'
      },
      buyPrices: {
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
          'Array of buy price tiers based on quantity. Tiers must not overlap and should be ordered by minQuantity.'
      },
      rentPrices: {
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
          'Array of rent price tiers based on quantity. Tiers must not overlap and should be ordered by minQuantity.'
      }
    },
    example: {
      name: 'Family Counselling',
      description: 'Comprehensive support session for families.',
      priceCalculationUnit: 'piece',
      acquisitionType: 'both',
      billingInterval: 'monthly',
      isDefaultServiceForBuy: true,
      isDefaultServiceForRent: false,
      inputTypeForBuy: 'before',
      inputTypeForRent: 'after',
      buyPrices: [
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
      ],
      rentPrices: [
        {
          minQuantity: 1,
          maxQuantity: 10,
          price: 450.0
        },
        {
          minQuantity: 11,
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
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent', 'both'],
        nullable: true,
        description: 'Acquisition type: buy, rent, or both'
      },
      billingInterval: {
        type: 'string',
        enum: ['one_time', 'weekly', 'monthly'],
        nullable: true,
        description: 'Billing interval: one time, weekly, or monthly'
      },
      isDefaultServiceForBuy: {
        type: 'boolean',
        nullable: true,
        description: 'Whether this service is default for buy acquisition type'
      },
      isDefaultServiceForRent: {
        type: 'boolean',
        nullable: true,
        description: 'Whether this service is default for rent acquisition type'
      },
      inputTypeForBuy: {
        type: 'string',
        enum: ['before', 'after', 'both'],
        nullable: true,
        description: 'Input type for buy acquisition: before, after, or both'
      },
      inputTypeForRent: {
        type: 'string',
        enum: ['before', 'after', 'both'],
        nullable: true,
        description: 'Input type for rent acquisition: before, after, or both'
      },
      buyPrices: {
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
          "Array of buy price tiers. The system will compare these with existing buy prices: prices that match (same minQuantity, maxQuantity, and price) will be kept, prices that don't match any existing price will be added, and existing prices that don't match any provided price will be removed. If empty array is provided, all existing buy prices will be removed. If not provided, buy prices will remain unchanged."
      },
      rentPrices: {
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
          "Array of rent price tiers. The system will compare these with existing rent prices: prices that match (same minQuantity, maxQuantity, and price) will be kept, prices that don't match any existing price will be added, and existing prices that don't match any provided price will be removed. If empty array is provided, all existing rent prices will be removed. If not provided, rent prices will remain unchanged."
      }
    },
    example: {
      name: 'Family Counselling (Extended)',
      description: 'Extended counselling session including follow-up plan.',
      priceCalculationUnit: 'piece',
      buyPrices: [
        {
          minQuantity: 1,
          maxQuantity: 10,
          price: 550.0
        },
        {
          minQuantity: 11,
          price: 480.0
        }
      ],
      rentPrices: [
        {
          minQuantity: 1,
          price: 500.0
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
      buyPrices: [
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
      rentPrices: [
        {
          id: 'price-id-3',
          minQuantity: 1,
          maxQuantity: 10,
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
            buyPrices: [
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
            rentPrices: [
              {
                id: 'price-id-3',
                minQuantity: 1,
                maxQuantity: 10,
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
          buyPrices: [
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
          ],
          rentPrices: [
            {
              id: 'price-id-4',
              minQuantity: 1,
              maxQuantity: 100,
              price: 23.0,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ]
        }
      ],
      code: 200000,
      message: 'OK'
    }
  },
  calculate_service_price_body: {
    type: 'object',
    required: ['productId', 'quantity'],
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
        description: 'Product ID'
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        description: 'Quantity of products'
      },
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent'],
        description:
          "Acquisition type (buy or rent). If not provided, uses product's acquisitionType"
      }
    },
    example: {
      productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      quantity: 10,
      acquisitionType: 'buy'
    }
  },
  calculate_service_price_response: {
    type: 'object',
    example: {
      data: {
        serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        quantity: 10,
        calculatedQuantity: 2,
        priceCalculationUnit: 'unit',
        unitPrice: 450.0,
        totalPrice: 900.0,
        priceTier: {
          minQuantity: 1,
          maxQuantity: 10,
          price: 450.0
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  calculate_service_price_multiple_body: {
    type: 'object',
    required: ['products'],
    properties: {
      products: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'quantity'],
          properties: {
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID'
            },
            quantity: {
              type: 'integer',
              minimum: 1,
              description: 'Quantity of products'
            }
          }
        },
        description: 'Array of products with their quantities'
      },
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent'],
        description:
          "Acquisition type (buy or rent). If not provided, uses first product's acquisitionType"
      }
    },
    example: {
      products: [
        {
          productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          quantity: 10
        },
        {
          productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          quantity: 5
        }
      ],
      acquisitionType: 'buy'
    }
  },
  calculate_service_price_multiple_response: {
    type: 'object',
    example: {
      data: {
        serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        products: [
          {
            productId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
            quantity: 10,
            calculatedQuantity: 2
          },
          {
            productId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            quantity: 5,
            calculatedQuantity: 1
          }
        ],
        combinedCalculatedQuantity: 3,
        priceCalculationUnit: 'unit',
        unitPrice: 450.0,
        totalPrice: 1350.0,
        priceTier: {
          minQuantity: 1,
          maxQuantity: 10,
          price: 450.0
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_all_service_locations_response: {
    type: 'object',
    example: {
      data: [
        {
          id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          name: 'Delivery Service - New York'
        },
        {
          id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
          name: 'Delivery Service - Los Angeles'
        },
        {
          id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
          name: 'Storage Service - Chicago'
        },
        {
          id: 'd4e5f6a7-b8c9-0123-def0-234567890123',
          name: 'Family Counselling - Reykjavik'
        },
        {
          id: 'e5f6a7b8-c9d0-1234-ef01-345678901234',
          name: 'Family Counselling - Akureyri'
        }
      ],
      code: 200000,
      message: 'OK'
    }
  }
}

export const serviceDocs = { tags, paths, definitions }
