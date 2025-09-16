const tags = [
  {
    name: 'Template',
    description: 'Template related routes'
  }
]

const paths = {
  '/template': {
    post: {
      tags: ['Template'],
      description: 'Creates Template',
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
              $ref: '#/definitions/create_template_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created Template',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Template not found',
          content: {
            schema: {
              $ref: '#/definitions/template_not_found_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Template'],
      description: 'Get list of templates with pagination ',
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
        },
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'Search query'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got list of templates',
          content: {
            schema: {
              $ref: '#/definitions/get_templates_response'
            }
          }
        },
        '404': {
          description: 'Template not found',
          content: {
            schema: {
              $ref: '#/definitions/template_not_found_response'
            }
          }
        }
      }
    },
    put: {
      tags: ['Template'],
      description:
        'Edit template \n- Include templateAboutId/templateRoomId/templateStaffId to update, exclude to create',
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
              $ref: '#/definitions/edit_template_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited template',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Template not found',
          content: {
            schema: {
              $ref: '#/definitions/template_not_found_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Template'],
      description: 'Delete template ',
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
              $ref: '#/definitions/delete_template_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted template',
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
  '/template/{id}': {
    get: {
      tags: ['Template'],
      description: 'Get template',
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
          description: 'Admin ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got template',
          content: {
            schema: {
              $ref: '#/definitions/get_template_response'
            }
          }
        },
        '404': {
          description: 'Template not found',
          content: {
            schema: {
              $ref: '#/definitions/template_not_found_response'
            }
          }
        }
      }
    }
  },
  '/template/bulk': {
    delete: {
      tags: ['Template'],
      description: 'Bulk delete templates ',
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
              $ref: '#/definitions/bulk_delete_templates_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted templates',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
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
  '/template/available': {
    post: {
      tags: ['Template'],
      description: 'Check if name is available',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/name_available_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully checked if name is available',
          content: {
            schema: {
              $ref: '#/definitions/name_available_response'
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
  get_templates_response: {
    example: {
      data: {
        pagination: {
          count: 2,
          page: 1,
          limit: 10
        },
        templates: [
          {
            templateId: 'a9111037-0031-4824-8342-67d126479ad5',
            name: 'Barnahus template',
            isGeneral: true,
            status: 'Published',
            updated: '2024-03-26T23:53:06.462Z',
            hasCases: false,
            addedBy: 'John Doe'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_template_response: {
    example: {
      data: {
        template: {
          templateId: 'a9111037-0031-4824-8342-67d126479ad5',
          name: 'Test template',
          isGeneral: true,
          status: 'Published',
          updated: '2024-03-26T23:53:06.462Z',
          hasCases: false,
          addedBy: 'John Doe',
          abouts: [
            {
              templateAboutId: 'c87bd1c3-6d0b-45ad-835d-6c5068e7629d',
              aboutId: '409fb8d1-1b3e-4daf-bf69-93539ade0af9',
              includeDescription: true,
              includeImages: true,
              includeAudio: true
            }
          ],
          rooms: [
            {
              templateRoomId: '67723bdf-eb36-4f3a-9242-37f171636fcc',
              roomId: '13b76d35-162b-4083-9134-606f9ab51b11',
              includeDescription: true,
              includeImages: true,
              includeAudio: true,
              orderNumber: 1
            }
          ],
          staff: [
            {
              templateStaffId: '6d10d5c5-fe04-48a2-9d6f-f6283bbd0cff',
              staffId: '6d10d5c5-fe04-48a2-9d6f-f6283bbd0cff',
              includeName: true,
              includeDescription: true,
              includeImages: true
            }
          ]
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  template_not_found_response: {
    example: {
      data: null,
      code: 404003,
      message: 'Template not found'
    }
  },
  create_template_body: {
    example: {
      templateId: 'a9111037-0031-4824-8342-67d126479ad5',
      name: 'Barnahus template',
      isGeneral: true,
      password: '12345678',
      rooms: [
        {
          roomId: '13b76d35-162b-4083-9134-606f9ab51b11',
          includeAudio: true,
          includeDescription: true,
          includeImages: true,
          orderNumber: 1
        }
      ],
      abouts: [
        {
          aboutId: '409fb8d1-1b3e-4daf-bf69-93539ade0af9',
          includeAudio: true,
          includeDescription: true,
          includeImages: true
        }
      ],
      staff: [
        {
          staffId: 'a94acbfb-980d-4abc-b5c4-a6eeb67e7351',
          includeName: true,
          includeDescription: true,
          includeImages: true
        }
      ]
    }
  },
  edit_template_body: {
    example: {
      templateId: 'a9111037-0031-4824-8342-67d126479ad5',
      name: 'Test template',
      isGeneral: true,
      abouts: [
        {
          aboutId: '409fb8d1-1b3e-4daf-bf69-93539ade0af9',
          includeAudio: true,
          includeDescription: true,
          includeImages: true
        }
      ],
      rooms: [
        {
          templateRoomId: 'a9111037-0031-4824-8342-67d126479ad5',
          roomId: '13b76d35-162b-4083-9134-606f9ab51b11',
          includeAudio: true,
          includeDescription: true,
          includeImages: true,
          orderNumber: 1
        }
      ],
      staff: [
        {
          staffId: 'a94acbfb-980d-4abc-b5c4-a6eeb67e7351',
          includeName: true,
          includeDescription: true,
          includeImages: true
        }
      ],
      deleteAbouts: ['a94acbfb-980d-4abc-b5c4-a6eeb67e7351'],
      deleteRooms: ['13b76d35-162b-4083-9134-606f9ab51b11'],
      deleteStaff: ['a94acbfb-980d-4abc-b5c4-a6eeb67e7351']
    }
  },
  delete_template_body: {
    example: {
      templateId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_templates_body: {
    example: {
      templateIds: [
        '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        '18b1c7f9-cd03-42db-9761-78a06d2a240d'
      ]
    }
  },
  name_available_body: {
    example: {
      name: 'General template'
    }
  },
  name_available_response: {
    example: {
      data: { available: true },
      code: 200000,
      message: 'OK'
    }
  }
}

export const templateDocs = { tags, paths, definitions }
