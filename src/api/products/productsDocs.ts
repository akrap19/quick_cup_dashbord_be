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
        'Create a new product. Can optionally include service prices and a design template for the product.',
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
  '/products/my-products': {
    get: {
      tags: ['Products'],
      description:
        "Get all products owned by the currently logged-in client user. Returns products where ownedBy field matches the user ID. Only accessible to users with CLIENT role. Optionally, you can provide a userid query parameter to override the logged-in user's ID and get products for a specific user.",
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'query',
          name: 'page',
          type: 'integer',
          minimum: 1,
          required: false,
          description: 'Page number for pagination'
        },
        {
          in: 'query',
          name: 'limit',
          type: 'integer',
          minimum: 1,
          maximum: 100,
          required: false,
          description: 'Number of items per page'
        },
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'Search term to filter products by name'
        },
        {
          in: 'query',
          name: 'userid',
          type: 'string',
          format: 'uuid',
          required: false,
          description:
            "Optional user ID to override the logged-in user's ID. If provided, returns products owned by this user instead of the authenticated user."
        }
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved products owned by the client',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      products: {
                        type: 'array',
                        items: {
                          $ref: '#/definitions/product'
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          count: {
                            type: 'integer',
                            description:
                              'Total number of unique products owned by the client'
                          },
                          page: {
                            type: 'integer',
                            description: 'Current page number'
                          },
                          limit: {
                            type: 'integer',
                            description: 'Number of items per page'
                          }
                        }
                      }
                    }
                  },
                  code: {
                    type: 'integer',
                    example: 200000
                  },
                  message: {
                    type: 'string',
                    example: 'OK'
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized - User not authenticated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/user_not_found_response'
              }
            }
          }
        },
        '403': {
          description: 'Forbidden - Client role required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/user_not_found_response'
              }
            }
          }
        }
      }
    }
  },
  '/products/{productId}': {
    get: {
      tags: ['Products'],
      description:
        'Get product details with images, prices, service prices, and design template',
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
            'Successfully retrieved product with images, prices, service prices, and design template'
        },
        '404': {
          description: 'Product not found'
        }
      }
    },
    put: {
      tags: ['Products'],
      description:
        'Update product and manage images, prices, service prices, and design template. Prices are provided as a complete array (like in create), and the system will automatically add new prices, remove prices that no longer match, and keep matching prices. Service prices can optionally be updated (replaces all existing service prices). Design template can be updated or removed by setting designTemplateId to null.',
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
  '/products/{productId}/design-template': {
    get: {
      tags: ['Products'],
      description:
        'Download the design template file for a product. Available to all authenticated users.',
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
          description: 'Successfully downloaded design template file',
          content: {
            'application/octet-stream': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          },
          headers: {
            'Content-Type': {
              schema: {
                type: 'string'
              },
              description: 'MIME type of the file'
            },
            'Content-Disposition': {
              schema: {
                type: 'string'
              },
              description: 'Attachment filename'
            }
          }
        },
        '404': {
          description: 'Product not found or design template not available',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/user_not_found_response'
              }
            }
          }
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
  },
  '/products/calculate-price': {
    post: {
      tags: ['Products'],
      description:
        'Calculate the total price for a product based on quantity and user. First checks client-specific product prices, then falls back to default product prices. Finds the unit price that matches the quantity range (e.g., if quantity is 800 and prices are defined as 1-500: 1.4, 501-1000: 1.3, it uses 1.3) and returns the total price (unit price * quantity).',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/calculate_product_price_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully calculated product price',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/calculate_product_price_response'
              }
            }
          }
        },
        '404': {
          description:
            'Product not found or no price tier matches the quantity',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/user_not_found_response'
              }
            }
          }
        }
      }
    }
  },
  '/products/bulk-update-product-states': {
    post: {
      tags: ['Products'],
      description:
        'Bulk update product states for multiple products at once. This endpoint is restricted to service users only. For each product, all existing product states are deleted and replaced with the new product states provided. The endpoint validates all product states before making any changes, ensuring data integrity. Returns detailed results for each product update, including success status and any errors encountered.',
      security: [
        {
          bearerAuth: []
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_update_product_states_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description:
            'Bulk update completed. Check individual product results for success/failure status.',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/bulk_update_product_states_response'
              }
            }
          }
        },
        '400': {
          description: 'Invalid input - validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/user_not_found_response'
              }
            }
          }
        },
        '403': {
          description: 'Forbidden - Service user role required',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/user_not_found_response'
              }
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
      designTemplateId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description:
          'Media ID of the design template file. The template must be uploaded first using the /media endpoint. Set to null to remove the design template.'
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
            serviceLocationId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description:
                'Service Location ID (required when location is "service", must be null when location is "user")'
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
      designTemplateId: '123e4567-e89b-12d3-a456-426614174002',
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
          serviceLocationId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          userId: null
        },
        {
          status: 'in_use',
          location: 'user',
          quantity: 5,
          serviceLocationId: null,
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
      designTemplateId: {
        type: 'string',
        format: 'uuid',
        nullable: true,
        description:
          'Media ID of the design template file. The template must be uploaded first using the /media endpoint. Set to null to remove the design template.'
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
            serviceLocationId: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              description:
                'Service Location ID (required when location is "service", must be null when location is "user")'
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
      designTemplateId: '123e4567-e89b-12d3-a456-426614174003',
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
          serviceLocationId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          userId: null
        },
        {
          status: 'reserved',
          location: 'user',
          quantity: 3,
          serviceLocationId: null,
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
  },
  calculate_product_price_body: {
    type: 'object',
    required: ['productId', 'quantity', 'userId'],
    properties: {
      productId: {
        type: 'string',
        format: 'uuid',
        description: 'Product ID'
      },
      quantity: {
        type: 'integer',
        minimum: 1,
        description: 'Quantity of products to calculate price for'
      },
      userId: {
        type: 'string',
        format: 'uuid',
        description: 'User ID (client ID) to check for client-specific prices'
      }
    },
    example: {
      productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      quantity: 800,
      userId: '123e4567-e89b-12d3-a456-426614174000'
    }
  },
  calculate_product_price_response: {
    type: 'object',
    example: {
      data: {
        productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        quantity: 800,
        unitPrice: 1.3,
        totalPrice: 1040.0,
        priceSource: 'client'
      },
      code: 200000,
      message: 'OK'
    }
  },
  bulk_update_product_states_body: {
    type: 'object',
    required: ['updates'],
    properties: {
      updates: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['productId', 'productStates'],
          properties: {
            productId: {
              type: 'string',
              format: 'uuid',
              description: 'Product ID to update'
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
                  serviceLocationId: {
                    type: 'string',
                    format: 'uuid',
                    nullable: true,
                    description:
                      'Service Location ID (required when location is "service", must be null when location is "user")'
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
                'Array of product states for this product. All existing product states will be deleted and replaced with these new states.'
            }
          }
        },
        description:
          'Array of product updates. Each update contains a productId and the new productStates array.'
      }
    },
    example: {
      updates: [
        {
          productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          productStates: [
            {
              status: 'available',
              location: 'service',
              quantity: 10,
              serviceLocationId: '123e4567-e89b-12d3-a456-426614174000',
              userId: null
            },
            {
              status: 'in_use',
              location: 'user',
              quantity: 5,
              serviceLocationId: null,
              userId: '123e4567-e89b-12d3-a456-426614174001'
            }
          ]
        },
        {
          productId: '93d0de32-41a0-4474-b93b-78c8e96e31a7',
          productStates: [
            {
              status: 'maintenance',
              location: 'service',
              quantity: 2,
              serviceLocationId: '123e4567-e89b-12d3-a456-426614174000',
              userId: null
            }
          ]
        }
      ]
    }
  },
  bulk_update_product_states_response: {
    type: 'object',
    example: {
      data: {
        updatedProducts: [
          {
            productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            success: true,
            product: {
              id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
              name: 'Sample Product',
              productStates: [
                {
                  id: 'state-id-1',
                  status: 'available',
                  location: 'service',
                  quantity: 10,
                  serviceLocationId: '123e4567-e89b-12d3-a456-426614174000',
                  userId: null,
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z'
                },
                {
                  id: 'state-id-2',
                  status: 'in_use',
                  location: 'user',
                  quantity: 5,
                  serviceLocationId: null,
                  userId: '123e4567-e89b-12d3-a456-426614174001',
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z'
                }
              ]
            }
          },
          {
            productId: '93d0de32-41a0-4474-b93b-78c8e96e31a7',
            success: false,
            error: 'Product not found or deleted'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  }
}

export const productsDocs = { tags, paths, definitions }
