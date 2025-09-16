const tags = [
  {
    name: 'Staff',
    description: 'Staff related routes'
  }
]

const paths = {
  '/staff/translation': {
    post: {
      tags: ['Staff'],
      description:
        'Creates staff translation\n- if you exclude the staffId, a new staff is created\n- name must be included when creating a nw staff',
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
              $ref: '#/definitions/create_staff_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created staff',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '400': {
          description: 'Failed to insert',
          content: {
            schema: {
              $ref: '#/definitions/400_failed_insert_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Staff'],
      description: 'Gets staff translations for language',
      parameters: [
        {
          in: 'query',
          name: 'languageId',
          type: 'string',
          required: true,
          description: 'Language id'
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
          description: 'Successfully fetch staff translation',
          content: {
            schema: {
              $ref: '#/definitions/get_staff_translations_response'
            }
          }
        }
      }
    },
    put: {
      tags: ['Staff'],
      description: 'Edits staff',
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
              $ref: '#/definitions/edit_staff_translation_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited staff',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/staff/translation/{id}': {
    get: {
      tags: ['Staff'],
      description: 'Gets staff translation',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: true,
          description: 'Staff translation id'
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
          description: 'Successfully fetched staff translation',
          content: {
            schema: {
              $ref: '#/definitions/get_staff_translation_response'
            }
          }
        },
        '404': {
          description: 'Staff translation not found',
          content: {
            schema: {
              $ref: '#/definitions/get_staff_translation_404_response'
            }
          }
        }
      }
    }
  },
  '/staff': {
    delete: {
      tags: ['Staff'],
      description: 'Delete staff ',
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
              $ref: '#/definitions/delete_staff_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted staff',
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
  '/staff/translation/bulk': {
    post: {
      tags: ['Staff'],
      description:
        'Bulk creates staff translations\n- if you exclude the staffId, a new staff is created\n- name must be included when creating a nw staff',
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
              $ref: '#/definitions/bulk_create_staff_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created staff',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '400': {
          description: 'Failed to insert',
          content: {
            schema: {
              $ref: '#/definitions/400_failed_insert_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Staff'],
      description: 'Bulk delete staff ',
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
              $ref: '#/definitions/bulk_delete_staff_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted staff',
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
  '/staff/translation/full': {
    post: {
      tags: ['Staff'],
      description:
        'Creates full staff translation\n- Must contain all language translations',
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
              $ref: '#/definitions/create_full_staff_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created full room section',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '400': {
          description: 'You must provide a translation for all languages',
          content: {
            schema: {
              $ref: '#/definitions/full_translation_400_response'
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
  '401_response': {
    example: {
      data: null,
      code: 401001,
      message: 'Invalid token'
    }
  },
  not_found_response: {
    example: {
      data: null,
      code: 404000,
      message: 'Resource not found'
    }
  },
  create_staff_body: {
    example: {
      staffId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      name: 'Jane Doe',
      title: 'Psychologist',
      description: '...',
      images: [],
      deletedImages: []
    }
  },
  bulk_create_staff_body: {
    example: {
      translations: [
        {
          staffId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          name: 'Jane Doe',
          title: 'Psychologist',
          description: '...',
          images: [],
          deletedImates: []
        }
      ]
    }
  },
  create_full_staff_body: {
    example: {
      name: 'Jane Doe',
      translations: [
        {
          languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          title: 'About Barnahus',
          description: '...'
        }
      ],
      images: [],
      deletedImages: []
    }
  },
  edit_staff_translation_body: {
    example: {
      staffTranslationId: '8e6b8ea8-85d9-4488-b15a-17cc8e36917e',
      name: 'Jane Doe',
      title: 'Psychologist',
      description: 'Staff description',
      images: [],
      deletedImages: []
    }
  },
  delete_staff_body: {
    example: {
      staffId: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
    }
  },
  bulk_delete_staff_body: {
    example: {
      staffIds: ['83d0de32-41a0-4474-b93b-78c8e96e31a6']
    }
  },
  file_not_found_response: {
    example: {
      data: {
        data: null,
        code: 404002,
        message: 'File not found'
      }
    }
  },
  get_staff_translations_response: {
    example: {
      data: {
        pagination: {
          count: 1,
          page: 1,
          limit: 10
        },
        staff: [
          {
            staffId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
            staffTranslationId: 'f7b364ff-baa2-45bb-90bc-8dcc47d54cde',
            name: 'Jane Doe',
            updated: '2024-02-29T09:39:08.203Z',
            status: 'Hidden'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_staff_translation_response: {
    example: {
      data: {
        staffTranslation: {
          staffId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
          staffTranslationId: 'f7b364ff-baa2-45bb-90bc-8dcc47d54cde',
          name: 'Jane Doe',
          title: 'Psychologist',
          updated: '2024-02-29T10:56:14.000Z',
          status: 'Hidden',
          staffImages: [
            {
              staffImageId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
              mediaId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
              url: 'https://storage.googleapis.com/barnahus_dev/barnahus/1d311f79-3482-4e11-884a-63973d8bc46b/image/Capture.PNG?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=barnahus-api%40barnahus.iam.gserviceaccount.com%2F20240229%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20240229T120316Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=05ed1837d1f242e49c60820096853f95324af2ce292d144c100d73edf6e862ebf769df6bbe94f9d8e6ff4c39da82ddd24b0944cb56a0b2525f9a33cfcbec7d2f04045328b49db6238998e7679a6e13cbe1be7ef9447b370d141f7f297c35c6aa575932dd0f72d612b48c32d89bfae8aa3e64cef78e469604142f533531e639e45df756fe4f09f6340ba7a612401133badb40bd1c5523597d4ef9ee1a5c0db367a54910c127236dc91d24523486578535039f5b34b33040524e1ccd4ae607be8ea2b957e38de23d72e3b2d93394737e9f7370b7754b5c3c5ccb405cc8e5897af3230e63c112c77e6c438b779c93749da719c0443489e7a721f1129f7c96b73e57'
            }
          ]
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_staff_translation_404_response: {
    example: {
      data: null,
      code: 404017,
      message: 'Staff translation not found'
    }
  },
  full_translation_400_response: {
    example: {
      data: null,
      code: 400009,
      message: 'All languages required'
    }
  }
}

export const staffTranslationDocs = { tags, paths, definitions }
