const tags = [
  {
    name: 'Practitioners',
    description: 'Practitioner related routes'
  }
]

const paths = {
  '/practitioner': {
    post: {
      tags: ['Practitioners'],
      description: 'Creates practitioner or adds practitioner role ',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_practitioner_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created practitioner',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '409': {
          description: 'User already a practitioner',
          content: {
            schema: {
              $ref: '#/definitions/409_role_exists_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Practitioners'],
      description: 'Get list of practitioners with pagination ',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        },
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
          description: 'Successfully got list of practitioners',
          content: {
            schema: {
              $ref: '#/definitions/get_practitioners_response'
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
      tags: ['Practitioners'],
      description: 'Edit practitioner ',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_practitioner_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited practitioner',
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
      tags: ['Practitioners'],
      description: 'Delete practitioner ',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_practitioner_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted practitioner',
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
  '/practitioner/{id}': {
    get: {
      tags: ['Practitioners'],
      description: 'Get practitioner',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        },
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: false,
          description: 'Practitioner ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got practitioner',
          content: {
            schema: {
              $ref: '#/definitions/get_practitioner_response'
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
  '/practitioner/bulk': {
    delete: {
      tags: ['Practitioners'],
      description: 'Bulk delete practitioner ',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_practitioners_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted practitioners',
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
  create_practitioner_body: {
    example: {
      email: 'john.doe@email.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: null,
      userProfession: 'psychologist'
    }
  },
  get_practitioners_response: {
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
            location: null,
            userProfession: 'psychologist'
          },
          {
            userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e52',
            name: 'Mark Doe',
            location: 'Stockholm, Sweden',
            userProfession: 'psychologist'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_practitioner_response: {
    example: {
      data: {
        practitioner: {
          userId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phoneNumber: null,
          userProfession: 'psychologist',
          location: null,
          locationCode: null
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  edit_practitioner_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '12345678',
      userProfession: 'psychologist'
    }
  },
  delete_practitioner_body: {
    example: {
      userId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_practitioners_body: {
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

export const practitionerDocs = { tags, paths, definitions }
