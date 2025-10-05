const tags = [
  {
    name: 'Services',
    description: 'Service related routes'
  }
]

const paths = {
  '/service': {
    post: {
      tags: ['Services'],
      description: 'Creates service or adds service role ',
      requestBody: {
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
          description: 'Successfully created service',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '409': {
          description: 'User already a service',
          content: {
            schema: {
              $ref: '#/definitions/409_role_exists_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Services'],
      description: 'Get list of services with pagination ',
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
          description: 'Successfully got list of services',
          content: {
            schema: {
              $ref: '#/definitions/get_services_response'
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
      tags: ['Services'],
      description: 'Edit service ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_service_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited service',
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
      tags: ['Services'],
      description: 'Delete service ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_service_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted service',
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
  '/service/{id}': {
    get: {
      tags: ['Services'],
      description: 'Get service',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: false,
          description: 'Service ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got service',
          content: {
            schema: {
              $ref: '#/definitions/get_service_response'
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
  '/service/bulk': {
    delete: {
      tags: ['Services'],
      description: 'Bulk delete service ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_services_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted services',
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
  create_service_body: {
    example: {
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: null
    }
  },
  get_services_response: {
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
  get_service_response: {
    example: {
      data: {
        service: {
          userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phoneNumber: null
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  edit_service_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '12345678'
    }
  },
  delete_service_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_services_body: {
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

export const serviceDocs = { tags, paths, definitions }
