const tags = [
  {
    name: 'Content',
    description: 'Content related routes'
  }
]

const paths = {
  '/content': {
    get: {
      tags: ['Content'],
      description:
        'Get content for template creation\n- For template creation in dashboard',
      parameters: [
        {
          in: 'query',
          name: 'languageId',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Language id'
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
          description: 'Successfully got content for template',
          content: {
            schema: {
              $ref: '#/definitions/get_content_response'
            }
          }
        }
      }
    }
  },
  '/content/template': {
    get: {
      tags: ['Content'],
      description:
        'Get content for template creation\n- For template creation in dashboard',
      parameters: [
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
          description: 'Successfully got content for template',
          content: {
            schema: {
              $ref: '#/definitions/get_content_response'
            }
          }
        }
      }
    }
  },
  '/content/barnahus': {
    get: {
      tags: ['Content'],
      description:
        'Get a list of Barnahus IDs\n- To be used for the barnahus dropdown in the app',
      responses: {
        '200': {
          description: 'Successfully got barnahuses',
          content: {
            schema: {
              $ref: '#/definitions/get_barnahuses_response'
            }
          }
        },
        '404': {
          description: 'Barnahus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    }
  },
  '/content/barnahus/:locationCode': {
    get: {
      tags: ['Content'],
      description:
        'Get Barnahus content\n- For default barnahus content in app',
      parameters: [
        {
          in: 'path',
          name: 'locationCode',
          type: 'string',
          required: true,
          description: 'Barnahus location code'
        },
        {
          in: 'query',
          name: 'languageId',
          type: 'string',
          required: true,
          description: 'Content language id'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got Barnahus content',
          content: {
            schema: {
              $ref: '#/definitions/get_content_response'
            }
          }
        },
        '404': {
          description: 'Barnahus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    }
  },
  '/content/case': {
    get: {
      tags: ['Content'],
      description:
        'Get a list of case IDs\n- To be used for the case dropdown in the app',
      parameters: [
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
          description: 'Successfully got cases',
          content: {
            schema: {
              $ref: '#/definitions/get_cases_response'
            }
          }
        },
        '404': {
          description: 'Cases not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    },
    post: {
      tags: ['Content'],
      description:
        'Generate case content based on template ID\n- To be used at the end of the case content creation flow on the dashboard when using a template without editing',
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
              $ref: '#/definitions/generate_case_content_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully generated content',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Cases not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    }
  },
  '/content/case/custom': {
    get: {
      tags: ['Content'],
      description:
        'Get barnahus content by custom case ID\n- For custom case in mobile app',
      responses: {
        '200': {
          description: 'Successfully got barnahus content',
          content: {
            schema: {
              $ref: '#/definitions/get_content_response'
            }
          }
        },
        '404': {
          description: 'Cases not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    },
    post: {
      tags: ['Content'],
      description:
        'Generate custom case content \n- To be used at the end of the case content creation flow on the dashboard when customizing a case, from a template or from scratch',
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
              $ref: '#/definitions/generated_custom_case_content_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully generated content',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Cases not found',
          content: {
            schema: {
              $ref: '#/definitions/case_not_found_response'
            }
          }
        }
      }
    }
  },
  '/content/case/:id': {
    get: {
      tags: ['Content'],
      description:
        'Get barnahus content by case ID\n- For practitioner in mobile app',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: true,
          description: 'Case id'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got barnahus content',
          content: {
            schema: {
              $ref: '#/definitions/get_content_response'
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
  '/content/language/:locationCode': {
    get: {
      tags: ['Content'],
      description:
        'Get a list of languages\n- To be used for the language dropdown in the app',
      parameters: [
        {
          in: 'path',
          name: 'locationCode',
          type: 'string',
          required: true,
          description: 'Barnahus location code'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got barnahuses',
          content: {
            schema: {
              $ref: '#/definitions/get_languages_response'
            }
          }
        },
        '404': {
          description: 'Barnahus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    }
  },
  '/content/note': {
    get: {
      tags: ['Content'],
      description: 'Get barnahus notes',
      responses: {
        '200': {
          description: 'Successfully got notes',
          content: {
            schema: {
              $ref: '#/definitions/get_notes_response'
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
    post: {
      tags: ['Content'],
      description: 'Create note',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_note_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created note',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    },
    put: {
      tags: ['Content'],
      description: 'Edit note',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_note_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited note',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Content'],
      description: 'Delete notes',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_notes_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted notes',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/content/note/status': {
    get: {
      tags: ['Content'],
      description: 'Get can add note status',
      responses: {
        '200': {
          description: 'Successfully got can add note status',
          content: {
            schema: {
              $ref: '#/definitions/get_note_status_response'
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
  }
}

const definitions = {
  get_content_response: {
    example: {
      data: {
        abouts: [
          {
            aboutId: '409fb8d1-1b3e-4daf-bf69-93539ade0af9',
            orderNumber: 0,
            title: 'About bjarnahus',
            description: 'Bjornahus',
            audio: null,
            aboutImages: []
          }
        ],
        rooms: [
          {
            roomId: '13b76d35-162b-4083-9134-606f9ab51b11',
            orderNumber: 0,
            title: 'Waiting Room 2',
            description: null,
            audio: null,
            roomImages: []
          }
        ],
        staff: [
          {
            staffId: 'e0d90e5e-957d-4899-989a-b5a6f775009c',
            orderNumber: 0,
            title: 'Psychologist',
            description: 'Staff description',
            staffImages: []
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_barnahuses_response: {
    example: {
      barnahusIds: [
        {
          barnahusId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          locationCode: 'SW-ST-1'
        },
        {
          barnahusId: '18b1c7f9-cd03-42db-9761-78a06d2a240d',
          locationCode: 'CR-ZA-1'
        }
      ]
    }
  },
  get_note_status_response: {
    example: {
      canAddNotes: true
    }
  },
  barnahus_not_found_response: {
    example: {
      data: null,
      code: 404003,
      message: 'Barnahus not found'
    }
  },
  get_cases_response: {
    example: {
      casesData: [
        {
          caseId: '18b1c7f9-cd03-42db-9761-78a06d2a240d',
          customId: 'CASE-1234',
          language: 'Swedish'
        },
        {
          caseId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          customId: 'CASE-1235',
          language: 'English'
        }
      ]
    }
  },
  case_not_found_response: {
    example: {
      data: null,
      code: 404016,
      message: 'Case not found'
    }
  },
  generate_case_content_body: {
    example: {
      caseId: '13cc4836-a6ba-420f-a370-155ce99bfbbd',
      templateId: 'ec71450c-f445-4ab2-9fc9-f493f20aea7a',
      languageId: '5dbff6ae-6eda-4f49-b693-8d63465a7371'
    }
  },
  generated_custom_case_content_body: {
    example: {
      caseId: '13cc4836-a6ba-420f-a370-155ce99bfbbd',
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
      ],
      languageId: '5dbff6ae-6eda-4f49-b693-8d63465a7371'
    }
  },
  create_note_body: {
    example: {
      contentId: '13cc4836-a6ba-420f-a370-155ce99bfbbd',
      type: 'About',
      note: 'Note'
    }
  },
  edit_note_body: {
    example: {
      noteId: '13cc4836-a6ba-420f-a370-155ce99bfbbd',
      type: 'About',
      note: 'Note'
    }
  },
  delete_notes_body: {
    example: {
      customId: 'CASE-1234',
      aboutNotes: ['13cc4836-a6ba-420f-a370-155ce99bfbbd'],
      roomNotes: [],
      staffNotes: []
    }
  },
  get_notes_response: {
    example: {
      notes: [
        {
          noteId: '162df62c-955c-41b9-a182-d5823dda8e4f',
          contentId: 'a8ac7e55-017c-4e9c-b11d-17223b9c675e',
          title: 'About barnahus',
          note: 'Note',
          type: 'About',
          writtenAt: '2024-05-20T12:32:59.964Z'
        }
      ]
    }
  },
  get_languages_response: {
    example: {
      data: {
        languages: [
          {
            languageId: '5dbff6ae-6eda-4f49-b693-8d63465a7371',
            name: 'English'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  }
}

export const contentDocs = { tags, paths, definitions }
