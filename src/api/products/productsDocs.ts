const tags = [
  {
    name: 'Products',
    description: 'Product management routes'
  }
]

const paths = {
  '/products': {
    get: {
      tags: ['Products'],
      description: 'List products with images and prices',
      responses: {
        '200': {
          description: 'Successfully listed products with images and prices'
        }
      }
    },
    post: {
      tags: ['Products'],
      description:
        'Create a new product. Can optionally include service prices for the product.',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_product_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created product with images and prices'
        }
      }
    }
  },
  '/products/{productId}': {
    get: {
      tags: ['Products'],
      description:
        'Get product details with images, prices, and service prices',
      parameters: [
        {
          in: 'path',
          name: 'productId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '200': {
          description:
            'Successfully retrieved product with images, prices, and service prices'
        },
        '404': {
          description: 'Product not found'
        }
      }
    },
    put: {
      tags: ['Products'],
      description:
        'Update product and manage images, prices, and service prices. Prices are provided as a complete array (like in create), and the system will automatically add new prices, remove prices that no longer match, and keep matching prices. Service prices can optionally be updated (replaces all existing service prices).',
      parameters: [
        {
          in: 'path',
          name: 'productId',
          type: 'string',
          required: true
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_product_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully updated product with images and prices'
        }
      }
    },
    delete: {
      tags: ['Products'],
      description: 'Delete product',
      parameters: [
        {
          in: 'path',
          name: 'productId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '204': {
          description: 'Successfully deleted product'
        }
      }
    }
  },
  '/products/prices': {
    get: {
      tags: ['Products'],
      description:
        'Get all product prices for all products, grouped by product. Can be filtered by acquisitionType.',
      parameters: [
        {
          in: 'query',
          name: 'acquisitionType',
          type: 'string',
          enum: ['buy', 'rent'],
          required: false,
          description: 'Filter products by acquisition type'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved all product prices',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_all_product_prices_response'
              }
            }
          }
        }
      }
    }
  },
  '/products/{productId}/service-prices': {
    get: {
      tags: ['Products'],
      description:
        'Get all service prices for a specific product. Returns product-specific service prices if available, otherwise returns default service prices.',
      parameters: [
        {
          in: 'path',
          name: 'productId',
          type: 'string',
          required: true,
          description: 'Product ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved product service prices',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_product_service_prices_response'
              }
            }
          }
        },
        '404': {
          description: 'Product not found',
          content: {
            schema: {
              $ref: '#/definitions/user_not_found_response'
            }
          }
        }
      }
    }
  }
}

const definitions = {
  create_product_body: {
    type: 'object',
    required: ['name', 'acquisitionType'],
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 128
      },
      size: {
        type: 'string',
        maxLength: 128,
        description: 'Product size'
      },
      unit: {
        type: 'string',
        maxLength: 128,
        description: 'Unit of measurement (e.g., "piece", "kg", "liter")'
      },
      quantityPerUnit: {
        type: 'integer',
        minimum: 0,
        description: 'Quantity per unit'
      },
      transportationUnit: {
        type: 'string',
        maxLength: 128,
        description: 'Transportation unit (e.g., "box", "pallet")'
      },
      unitsPerTransportationUnit: {
        type: 'integer',
        minimum: 0,
        description: 'Number of units per transportation unit'
      },
      description: {
        type: 'string',
        nullable: true
      },
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent']
      },
      imageIds: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid'
        },
        description:
          'Array of media/image IDs to associate with the product. Images must be uploaded first using the /media endpoint.'
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
                'Maximum quantity for this price tier. If null, this tier has no upper limit.'
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
      },
      servicePrices: {
        type: 'array',
        items: {
          type: 'object',
          required: ['serviceId', 'prices'],
          properties: {
            serviceId: {
              type: 'string',
              format: 'uuid',
              description: 'Service ID'
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
                      'Maximum quantity for this price tier. If null, this tier has no upper limit.'
                  },
                  price: {
                    type: 'number',
                    minimum: 0,
                    description: 'Price in EUR for this quantity range'
                  }
                }
              },
              description:
                'Array of price tiers for this service. Tiers must not overlap and should be ordered by minQuantity.'
            }
          }
        },
        description:
          'Array of service prices for the product. Can optionally include service prices when creating a product.'
      },
      productStates: {
        type: 'array',
        items: {
          type: 'object',
          required: ['status', 'location', 'quantity'],
          properties: {
            status: {
              type: 'string',
              enum: [
                'available',
                'in_use',
                'maintenance',
                'reserved',
                'damaged'
              ],
              description: 'Status of the product state'
            },
            location: {
              type: 'string',
              enum: ['service', 'user'],
              description: 'Location type of the product state'
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Quantity of products in this state'
            },
            serviceId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description:
                'Service ID (required when location is "service", must be null when location is "user")'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description:
                'User ID (required when location is "user", must be null when location is "service")'
            }
          }
        },
        description:
          'Array of product states. Each state represents where products are located (service or user) and their status.'
      }
    },
    example: {
      name: 'Sample Product',
      size: 'Large',
      unit: 'piece',
      quantityPerUnit: 1,
      transportationUnit: 'box',
      unitsPerTransportationUnit: 12,
      description: 'Sample description',
      acquisitionType: 'buy',
      imageIds: [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001'
      ],
      prices: [
        {
          minQuantity: 1,
          maxQuantity: 100,
          price: 1922.0
        },
        {
          minQuantity: 101,
          maxQuantity: 500,
          price: 1800.0
        },
        {
          minQuantity: 501,
          price: 1700.0
        }
      ],
      servicePrices: [
        {
          serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          prices: [
            {
              minQuantity: 1,
              maxQuantity: 10,
              price: 25.5
            },
            {
              minQuantity: 11,
              maxQuantity: null,
              price: 22.0
            }
          ]
        }
      ],
      productStates: [
        {
          status: 'available',
          location: 'service',
          quantity: 10,
          serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          userId: null
        },
        {
          status: 'in_use',
          location: 'user',
          quantity: 5,
          serviceId: null,
          userId: '123e4567-e89b-12d3-a456-426614174000'
        }
      ]
    }
  },
  update_product_body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 128
      },
      size: {
        type: 'string',
        maxLength: 128,
        description: 'Product size'
      },
      unit: {
        type: 'string',
        maxLength: 128,
        description: 'Unit of measurement (e.g., "piece", "kg", "liter")'
      },
      quantityPerUnit: {
        type: 'integer',
        minimum: 0,
        description: 'Quantity per unit'
      },
      transportationUnit: {
        type: 'string',
        maxLength: 128,
        description: 'Transportation unit (e.g., "box", "pallet")'
      },
      unitsPerTransportationUnit: {
        type: 'integer',
        minimum: 0,
        description: 'Number of units per transportation unit'
      },
      description: {
        type: 'string',
        nullable: true
      },
      acquisitionType: {
        type: 'string',
        enum: ['buy', 'rent']
      },
      imageIdsToAdd: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid'
        },
        description:
          'Array of media/image IDs to add to the product. Images must be uploaded first using the /media endpoint.'
      },
      imageIdsToRemove: {
        type: 'array',
        items: {
          type: 'string',
          format: 'uuid'
        },
        description: 'Array of media/image IDs to remove from the product.'
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
                'Maximum quantity for this price tier. If null, this tier has no upper limit.'
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
      },
      servicePrices: {
        type: 'array',
        items: {
          type: 'object',
          required: ['serviceId', 'prices'],
          properties: {
            serviceId: {
              type: 'string',
              format: 'uuid',
              description: 'Service ID'
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
                      'Maximum quantity for this price tier. If null, this tier has no upper limit.'
                  },
                  price: {
                    type: 'number',
                    minimum: 0,
                    description: 'Price in EUR for this quantity range'
                  }
                }
              },
              description:
                'Array of price tiers for this service. Tiers must not overlap and should be ordered by minQuantity.'
            }
          }
        },
        description:
          'Array of service prices for the product. Can optionally update service prices for the product (replaces all existing service prices).'
      },
      productStates: {
        type: 'array',
        items: {
          type: 'object',
          required: ['status', 'location', 'quantity'],
          properties: {
            status: {
              type: 'string',
              enum: [
                'available',
                'in_use',
                'maintenance',
                'reserved',
                'damaged'
              ],
              description: 'Status of the product state'
            },
            location: {
              type: 'string',
              enum: ['service', 'user'],
              description: 'Location type of the product state'
            },
            quantity: {
              type: 'integer',
              minimum: 0,
              description: 'Quantity of products in this state'
            },
            serviceId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description:
                'Service ID (required when location is "service", must be null when location is "user")'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description:
                'User ID (required when location is "user", must be null when location is "service")'
            }
          }
        },
        description:
          'Array of product states. Can optionally update product states (replaces all existing product states).'
      }
    },
    example: {
      name: 'Updated product name',
      size: 'Medium',
      unit: 'kg',
      quantityPerUnit: 1,
      transportationUnit: 'pallet',
      unitsPerTransportationUnit: 50,
      description: 'Updated description',
      acquisitionType: 'rent',
      imageIdsToAdd: [
        '123e4567-e89b-12d3-a456-426614174000',
        '123e4567-e89b-12d3-a456-426614174001'
      ],
      imageIdsToRemove: ['123e4567-e89b-12d3-a456-426614174002'],
      prices: [
        {
          minQuantity: 1,
          maxQuantity: 100,
          price: 1922.0
        },
        {
          minQuantity: 101,
          maxQuantity: 500,
          price: 1800.0
        },
        {
          minQuantity: 1000,
          price: 1500.0
        }
      ],
      servicePrices: [
        {
          serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          prices: [
            {
              minQuantity: 1,
              maxQuantity: 10,
              price: 25.5
            },
            {
              minQuantity: 11,
              maxQuantity: null,
              price: 22.0
            }
          ]
        }
      ],
      productStates: [
        {
          status: 'available',
          location: 'service',
          quantity: 15,
          serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          userId: null
        },
        {
          status: 'reserved',
          location: 'user',
          quantity: 3,
          serviceId: null,
          userId: '123e4567-e89b-12d3-a456-426614174000'
        }
      ]
    }
  },
  get_all_product_prices_response: {
    type: 'object',
    example: {
      data: [
        {
          productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          productName: 'Sample Product',
          acquisitionType: 'buy',
          prices: [
            {
              id: 'price-id-1',
              minQuantity: 1,
              maxQuantity: 100,
              price: 1922.0,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'price-id-2',
              minQuantity: 101,
              maxQuantity: 500,
              price: 1800.0,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'price-id-3',
              minQuantity: 501,
              maxQuantity: null,
              price: 1700.0,
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
  get_product_service_prices_response: {
    type: 'object',
    example: {
      data: [
        {
          serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          serviceName: 'Service Name',
          prices: [
            {
              id: 'price-id-1',
              minQuantity: 1,
              maxQuantity: 10,
              price: 25.5,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'price-id-2',
              minQuantity: 11,
              maxQuantity: null,
              price: 22.0,
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
  user_not_found_response: {
    example: {
      data: null,
      code: 404000,
      message: 'Not Found'
    }
  }
}

export const productsDocs = { tags, paths, definitions }
