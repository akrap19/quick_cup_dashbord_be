const tags = [
  {
    name: 'Master Admins',
    description: 'Master admin related routes'
  }
]

const paths = {
  '/master-admin': {
    post: {
      tags: ['Master Admins'],
      description: 'Creates master admin or adds master admin role ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_master_admin_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created master admin',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '409': {
          description: 'User already a master admin',
          content: {
            schema: {
              $ref: '#/definitions/409_role_exists_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Master Admins'],
      description: 'Get list of master admins with pagination ',
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
          name: 'location',
          type: 'string',
          required: false,
          description: 'Location'
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
          description: 'Successfully got list of master admins',
          content: {
            schema: {
              $ref: '#/definitions/get_master_admins_response'
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
      tags: ['Master Admins'],
      description: 'Edit master admin ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_master_admin_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited master admin',
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
      tags: ['Master Admins'],
      description: 'Delete master admin ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_master_admin_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted master admin',
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
  '/master-admin/{id}': {
    get: {
      tags: ['Master Admins'],
      description: 'Get master admin',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: false,
          description: 'Master admin ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got master admin',
          content: {
            schema: {
              $ref: '#/definitions/get_master_admin_response'
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
  '/master-admin/bulk': {
    delete: {
      tags: ['Master Admins'],
      description: 'Bulk delete master admin ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_master_admins_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted master admins',
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
  create_master_admin_body: {
    example: {
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: null
    }
  },
  get_master_admins_response: {
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
            name: 'John Doe',
            phoneNumber: null
          },
          {
            userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e52',
            name: 'Mark Doe',
            phoneNumber: null
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_master_admin_response: {
    example: {
      data: {
        masterAdmin: {
          userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phoneNumber: null,
          locations: null
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  edit_master_admin_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '12345678'
    }
  },
  delete_master_admin_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_master_admins_body: {
    example: {
      userIds: [
        '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        '18b1c7f9-cd03-42db-9761-78a06d2a240d'
      ]
    }
  },
  user_not_found_response: {
    example: {
      data: null,
      code: 404001,
      message: 'User not found'
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

export const masterAdminDocs = { tags, paths, definitions }
