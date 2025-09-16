const tags = [
  {
    name: 'Case',
    description: 'Case related routes'
  }
]

const paths = {
  '/case': {
    post: {
      tags: ['Case'],
      description: 'Creates Case',
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
              $ref: '#/definitions/create_case_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created Case',
          content: {
            schema: {
              $ref: '#/definitions/create_case_response'
            }
          }
        },
        '404': {
          description: 'Case not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Case'],
      description: 'Get list of cases with pagination ',
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
        },
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got list of cases',
          content: {
            schema: {
              $ref: '#/definitions/get_cases_response'
            }
          }
        },
        '404': {
          description: 'Case not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    },
    put: {
      tags: ['Case'],
      description: 'Edit case ',
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
              $ref: '#/definitions/edit_case_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited case',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Barhanus not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Case'],
      description: 'Delete barnahus ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_case_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted case',
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
  '/case/{id}': {
    get: {
      tags: ['Case'],
      description: 'Get case',
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
          required: true,
          description: 'Case ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got case',
          content: {
            schema: {
              $ref: '#/definitions/get_case_response'
            }
          }
        },
        '404': {
          description: 'Case not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    }
  },
  '/case/bulk': {
    delete: {
      tags: ['Case'],
      description: 'Bulk delete cases ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_cases_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted cases',
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
  '/case/search': {
    get: {
      tags: ['Case'],
      description: 'Get list of case\n - to be used for content case dropdowns',
      parameters: [
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'search query'
        },
        {
          in: 'query',
          name: 'status',
          type: 'string',
          required: false,
          description: 'language status filter'
        },
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got list of case',
          content: {
            schema: {
              $ref: '#/definitions/get_search_case_response'
            }
          }
        },
        '404': {
          description: 'Language not found',
          content: {
            schema: {
              $ref: '#/definitions/not_found_response'
            }
          }
        }
      }
    }
  },
  '/case/password': {
    put: {
      tags: ['Case'],
      description: 'Change case password',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/change_case_password_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully changed case password',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Case not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    }
  },
  '/case/available': {
    post: {
      tags: ['Case'],
      description: 'Check if custom ID is available',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/custom_id_available_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully checked if case is available',
          content: {
            schema: {
              $ref: '#/definitions/custom_id_available_response'
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
  get_cases_response: {
    example: {
      data: {
        pagination: {
          count: 1,
          page: 1,
          limit: 10
        },
        cases: [
          {
            caseId: '13cc4836-a6ba-420f-a370-155ce99bfbbd',
            customId: 'BH-1-TEST-1',
            barnahus: 'Stockholm (SW-ST-1)',
            template: null,
            language: null,
            canAddNotes: false,
            status: 'Open',
            updatedAt: '2024-07-18T08:57:17.110Z'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_case_response: {
    example: {
      data: {
        case: {
          caseId: '13cc4836-a6ba-420f-a370-155ce99bfbbd',
          customId: 'BH-1-TEST-1',
          barnahusId: 'HR-KO-1',
          barnahusLocation: 'Korcula, Hrvatska',
          template: null,
          language: null,
          canAddNotes: false
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_search_case_response: {
    example: {
      data: [
        {
          caseId: '13cc4836-a6ba-420f-a370-155ce99bfbbd',
          customId: 'BH-1-TEST-1'
        }
      ],
      code: 200000,
      message: 'OK'
    }
  },
  case_not_found_response: {
    example: {
      data: null,
      code: 404016,
      message: 'Case not found'
    }
  },
  create_case_body: {
    example: {
      canAddNotes: true,
      customId: 'BE-STOCK-12345',
      password: '12345678'
    }
  },
  create_case_response: {
    example: {
      data: { caseId: '4c6272ce-6bfd-42d0-b25e-3c19c129be89' },
      code: 200000,
      message: 'OK'
    }
  },
  change_case_password_body: {
    example: {
      password: '12345678',
      newPassword: '87654321'
    }
  },
  edit_case_body: {
    example: {
      caseId: '4c6272ce-6bfd-42d0-b25e-3c19c129be89',
      customId: 'BE-STOCK-12346',
      canAddNotes: true,
      password: '12345678'
    }
  },
  bulk_delete_cases_body: {
    example: {
      caseIds: [
        '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        '18b1c7f9-cd03-42db-9761-78a06d2a240d'
      ]
    }
  },
  custom_id_available_body: {
    example: {
      customId: ''
    }
  },
  custom_id_available_response: {
    example: {
      data: { available: true },
      code: 200000,
      message: 'OK'
    }
  },
  delete_case_body: {
    example: {
      id: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
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
  }
}

export const caseDocs = { tags, paths, definitions }
