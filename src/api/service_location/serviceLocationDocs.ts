const tags = [
  {
    name: 'Service Locations',
    description: 'Service location management - physical locations where services are provided'
  }
]

const paths = {
  '/service-locations': {
    get: {
      tags: ['Service Locations'],
      description: 'List service locations with pagination',
      parameters: [
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          required: false,
          description: 'Search term for city, address, or email'
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
          description: 'Service locations retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/list_service_locations_response'
              }
            }
          }
        }
      }
    },
    post: {
      tags: ['Service Locations'],
      description: 'Create a new service location. This will also create a user account with SERVICE role and send an invitation email.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_service_location_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Service location created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/service_location_response'
              }
            }
          }
        },
        '404': {
          description: 'Service not found'
        }
      }
    }
  },
  '/service-locations/{serviceLocationId}': {
    get: {
      tags: ['Service Locations'],
      description: 'Get a service location by ID',
      parameters: [
        {
          in: 'path',
          name: 'serviceLocationId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '200': {
          description: 'Service location retrieved successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/service_location_response'
              }
            }
          }
        },
        '404': {
          description: 'Service location not found'
        }
      }
    },
    put: {
      tags: ['Service Locations'],
      description: 'Update an existing service location',
      parameters: [
        {
          in: 'path',
          name: 'serviceLocationId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_service_location_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Service location updated successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/service_location_response'
              }
            }
          }
        },
        '404': {
          description: 'Service location or service not found'
        }
      }
    },
    delete: {
      tags: ['Service Locations'],
      description: 'Delete a service location',
      parameters: [
        {
          in: 'path',
          name: 'serviceLocationId',
          required: true,
          schema: { type: 'string', format: 'uuid' }
        }
      ],
      responses: {
        '204': {
          description: 'Service location deleted successfully'
        },
        '404': {
          description: 'Service location not found'
        }
      }
    }
  }
}

const definitions = {
  create_service_location_body: {
    type: 'object',
    required: ['city', 'address', 'email', 'serviceId'],
    properties: {
      city: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        example: 'New York'
      },
      address: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        example: '123 Main Street, Suite 100'
      },
      phone: {
        type: 'string',
        nullable: true,
        example: '+1-555-123-4567'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'location@example.com'
      },
      serviceId: {
        type: 'string',
        format: 'uuid',
        example: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
      }
    },
    example: {
      city: 'New York',
      address: '123 Main Street, Suite 100',
      phone: '+1-555-123-4567',
      email: 'location@example.com',
      serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
    }
  },
  update_service_location_body: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        example: 'New York'
      },
      address: {
        type: 'string',
        minLength: 1,
        maxLength: 255,
        example: '123 Main Street, Suite 200'
      },
      phone: {
        type: 'string',
        nullable: true,
        example: '+1-555-123-4567'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'location@example.com'
      },
      serviceId: {
        type: 'string',
        format: 'uuid',
        example: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
      }
    },
    example: {
      city: 'New York',
      address: '123 Main Street, Suite 200',
      phone: '+1-555-123-4567',
      email: 'location@example.com',
      serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
    }
  },
  service_location_response: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
      },
      city: {
        type: 'string',
        example: 'New York'
      },
      address: {
        type: 'string',
        example: '123 Main Street, Suite 100'
      },
      phone: {
        type: 'string',
        nullable: true,
        example: '+1-555-123-4567'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'location@example.com'
      },
      userId: {
        type: 'string',
        format: 'uuid',
        example: '83d0de32-41a0-4474-b93b-78c8e96e31a7'
      },
      serviceId: {
        type: 'string',
        format: 'uuid',
        example: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
      },
      createdAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      },
      updatedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-01-01T00:00:00.000Z'
      }
    },
    example: {
      id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      city: 'New York',
      address: '123 Main Street, Suite 100',
      phone: '+1-555-123-4567',
      email: 'location@example.com',
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a7',
      serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  },
  list_service_locations_response: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        properties: {
          serviceLocations: {
            type: 'array',
            items: {
              $ref: '#/definitions/service_location_response'
            }
          },
          pagination: {
            type: 'object',
            properties: {
              count: {
                type: 'integer',
                example: 10
              },
              page: {
                type: 'integer',
                example: 1
              },
              limit: {
                type: 'integer',
                example: 25
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
    },
    example: {
      data: {
        serviceLocations: [
          {
            id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
            city: 'New York',
            address: '123 Main Street, Suite 100',
            phone: '+1-555-123-4567',
            email: 'location@example.com',
            userId: '83d0de32-41a0-4474-b93b-78c8e96e31a7',
            serviceId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
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
  }
}

export const serviceLocationDocs = { tags, paths, definitions }

