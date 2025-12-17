const tags = [
  {
    name: 'Clients',
    description: 'Client related routes'
  }
]

const paths = {
  '/client': {
    post: {
      tags: ['Clients'],
      description: 'Creates client or adds client role. Can optionally include product prices for the client.',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_client_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created client',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '409': {
          description: 'User already a client',
          content: {
            schema: {
              $ref: '#/definitions/409_role_exists_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Clients'],
      description: 'Get list of clients with pagination ',
      parameters: [
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'Search query'
        },
        {
          in: 'query',
          name: 'page',
          type: 'number',
          required: true,
          description: 'Pagination page'
        },
        {
          in: 'query',
          name: 'limit',
          type: 'number',
          required: true,
          description: 'Pagination limit'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got list of clients',
          content: {
            schema: {
              $ref: '#/definitions/get_clients_response'
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            schema: {
              $ref: '#/definitions/user_not_found_response'
            }
          }
        }
      }
    },
    put: {
      tags: ['Clients'],
      description: 'Edit client. Can optionally update product prices for the client (replaces all existing prices).',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_client_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited client',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            schema: {
              $ref: '#/definitions/user_not_found_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Clients'],
      description: 'Delete client ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_client_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted client',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '403': {
          description: 'Forbidden',
          content: {
            schema: {
              $ref: '#/definitions/forbidden_response'
            }
          }
        },
        '410': {
          description: 'Gone',
          content: {
            schema: {
              $ref: '#/definitions/gone_response'
            }
          }
        }
      }
    }
  },
  '/client/{id}': {
    get: {
      tags: ['Clients'],
      description: 'Get client with product prices',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: false,
          description: 'Client ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got client with product prices',
          content: {
            schema: {
              $ref: '#/definitions/get_client_response'
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            schema: {
              $ref: '#/definitions/user_not_found_response'
            }
          }
        }
      }
    }
  },
  '/client/{clientId}/product-prices': {
    get: {
      tags: ['Clients'],
      description: 'Get all product prices for a specific client',
      parameters: [
        {
          in: 'path',
          name: 'clientId',
          type: 'string',
          required: true,
          description: 'Client ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved client product prices',
          content: {
            schema: {
              $ref: '#/definitions/get_client_product_prices_response'
            }
          }
        },
        '404': {
          description: 'Client not found',
          content: {
            schema: {
              $ref: '#/definitions/user_not_found_response'
            }
          }
        }
      }
    }
  },
  '/client/bulk': {
    delete: {
      tags: ['Clients'],
      description: 'Bulk delete client ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_clients_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted clients',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '403': {
          description: 'Forbidden',
          content: {
            schema: {
              $ref: '#/definitions/forbidden_response'
            }
          }
        },
        '410': {
          description: 'Gone',
          content: {
            schema: {
              $ref: '#/definitions/gone_response'
            }
          }
        }
      }
    }
  }
}

const definitions = {
  '200_response': {
    example: {
      data: null,
      code: 200000,
      message: 'OK'
    }
  },
  create_client_body: {
    example: {
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: null,
      location: '123 Main St, Anytown, USA',
      productPrices: [
        {
          productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          prices: [
            {
              minQuantity: 1,
              maxQuantity: 10,
              price: 25.50
            },
            {
              minQuantity: 11,
              maxQuantity: null,
              price: 22.00
            }
          ]
        }
      ]
    }
  },
  get_clients_response: {
    example: {
      data: {
        pagination: {
          count: 2,
          page: 1,
          limit: 10
        },
        users: [
          {
            userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
            name: 'John Doe'
          },
          {
            userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e52',
            name: 'Mark Doe'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_client_response: {
    example: {
      data: {
        userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@email.com',
        phoneNumber: null,
        location: '123 Main St, Anytown, USA',
        status: 'Active',
        assignedBy: 'John Doe',
        productPrices: [
          {
            productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            productName: 'Product Name',
            prices: [
              {
                id: 'price-id-1',
                minQuantity: 1,
                maxQuantity: 10,
                price: 25.50,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z'
              }
            ]
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  edit_client_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '12345678',
      location: '123 Main St, Anytown, USA',
      productPrices: [
        {
          productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          prices: [
            {
              minQuantity: 1,
              maxQuantity: 10,
              price: 25.50
            },
            {
              minQuantity: 11,
              maxQuantity: null,
              price: 22.00
            }
          ]
        }
      ]
    }
  },
  get_client_product_prices_response: {
    example: {
      data: [
        {
          productId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          productName: 'Product Name',
          prices: [
            {
              id: 'price-id-1',
              minQuantity: 1,
              maxQuantity: 10,
              price: 25.50,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            },
            {
              id: 'price-id-2',
              minQuantity: 11,
              maxQuantity: null,
              price: 22.00,
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
  delete_client_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_clients_body: {
    example: {
      userIds: [
        '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        '18b1c7f9-cd03-42db-9761-78a06d2a240d'
      ]
    }
  },
  forbidden_response: {
    example: {
      data: null,
      code: 403000,
      message: 'Forbidden'
    }
  },
  gone_response: {
    example: {
      data: null,
      code: 410000,
      message: 'Resource already deleted'
    }
  },
  '409_role_exists_response': {
    example: {
      data: null,
      code: 409001,
      message: 'User already assigned this role'
    }
  }
}

export const clientDocs = { tags, paths, definitions }
