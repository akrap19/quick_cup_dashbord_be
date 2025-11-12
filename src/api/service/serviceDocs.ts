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
      description: 'List services with pagination',
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
      description: 'Create a new service',
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
      description: 'Get a service by ID',
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
      description: 'Update an existing service',
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
  }
}

const definitions = {
  create_service_body: {
    type: 'object',
    example: {
      name: 'Family Counselling',
      description: 'Comprehensive support session for families.'
    }
  },
  update_service_body: {
    type: 'object',
    example: {
      name: 'Family Counselling (Extended)',
      description: 'Extended counselling session including follow-up plan.'
    }
  },
  service_response: {
    type: 'object',
    example: {
      id: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      name: 'Family Counselling',
      description: 'Comprehensive support session for families.',
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

export const serviceDocs = { tags, paths, definitions }
