const tags = [
  {
    name: 'Admins',
    description: 'Admin related routes'
  }
]

const paths = {
  '/admin': {
    post: {
      tags: ['Admins'],
      description: 'Creates admin or adds admin role ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_admin_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created admin',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '409': {
          description: 'User already a admin',
          content: {
            schema: {
              $ref: '#/definitions/409_role_exists_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Admins'],
      description: 'Get list of admins with pagination ',
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
          description: 'Successfully got list of admins',
          content: {
            schema: {
              $ref: '#/definitions/get_admins_response'
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
      tags: ['Admins'],
      description: 'Edit admin ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_admin_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited admin',
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
      tags: ['Admins'],
      description: 'Delete admin ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_admin_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted admin',
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
  '/admin/{id}': {
    get: {
      tags: ['Admins'],
      description: 'Get admin',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: false,
          description: 'Admin ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got admin',
          content: {
            schema: {
              $ref: '#/definitions/get_admin_response'
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
  '/admin/bulk': {
    delete: {
      tags: ['Admins'],
      description: 'Bulk delete admin ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_admins_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted admins',
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
  create_admin_body: {
    example: {
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: null,
      status: 'Active'
    }
  },
  get_admins_response: {
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
  get_admin_response: {
    example: {
      data: {
        admin: {
          userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phoneNumber: null,
          status: 'Active'
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  edit_admin_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '12345678'
    }
  },
  delete_admin_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_admins_body: {
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

export const adminDocs = { tags, paths, definitions }
