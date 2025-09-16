const tags = [
  {
    name: 'About Section',
    description: 'About sections related routes'
  }
]

const paths = {
  '/about/translation': {
    post: {
      tags: ['About Section'],
      description:
        'Creates about translation\n- if you exclude the aboutId, a new about section is created',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_about_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created about section translation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/200_response'
              }
            }
          }
        },
        '400': {
          description: 'Failed to insert',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/400_failed_insert_response'
              }
            }
          }
        }
      }
    },
    get: {
      tags: ['About Section'],
      description: 'Gets about translations for language',
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
          in: 'query',
          name: 'page',
          schema: {
            type: 'number'
          },
          required: true,
          description: 'Pagination page'
        },
        {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'number'
          },
          required: true,
          description: 'Pagination limit'
        },
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Barnahus ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully fetched about translations',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_about_translations_response'
              }
            }
          }
        }
      }
    },
    put: {
      tags: ['About Section'],
      description: 'Edits about translation',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_about_translation_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited about translation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/200_response'
              }
            }
          }
        }
      }
    }
  },
  '/about/translation/{id}': {
    get: {
      tags: ['About Section'],
      description: 'Gets about translation',
      parameters: [
        {
          in: 'path',
          name: 'id',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'About translation id'
        },
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Barnahus ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully fetched about translation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_about_translation_response'
              }
            }
          }
        },
        '404': {
          description: 'About translation not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/get_about_translation_404_response'
              }
            }
          }
        }
      }
    }
  },
  '/about': {
    delete: {
      tags: ['About Section'],
      description: 'Delete about section',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_about_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted about',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/200_response'
              }
            }
          }
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/forbidden_response'
              }
            }
          }
        },
        '410': {
          description: 'Gone',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/gone_response'
              }
            }
          }
        }
      }
    }
  },
  '/about/translation/bulk': {
    post: {
      tags: ['About Section'],
      description:
        'Bulk creates about translations\n- if you exclude the aboutId, a new about section is created',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_create_about_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created about section translations',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/200_response'
              }
            }
          }
        },
        '400': {
          description: 'Failed to insert',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/400_failed_insert_response'
              }
            }
          }
        }
      }
    },
    delete: {
      tags: ['About Section'],
      description: 'Bulk delete about sections',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          schema: {
            type: 'string'
          },
          required: true,
          description: 'Barnahus ID'
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_abouts_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted abouts',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/200_response'
              }
            }
          }
        },
        '410': {
          description: 'Gone',
          content: {
            'application/json': {
              schema: {
                $ref: '#/definitions/gone_response'
              }
            }
          }
        }
      }
    }
  },
  '/about/translation/full': {
    post: {
      tags: ['About Section'],
      description:
        'Creates full about translation\n- Must contain all language translations',
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
              $ref: '#/definitions/create_full_about_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created full about section',
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
  create_about_body: {
    example: {
      aboutId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      title: 'About Barnahus',
      description: '...',
      images: [],
      deletedImages: [],
      audioId: ''
    }
  },
  bulk_create_about_body: {
    example: {
      translations: [
        {
          aboutId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          title: 'About Barnahus',
          description: '...',
          images: [],
          deletedImages: [],
          audioId: ''
        }
      ]
    }
  },
  create_full_about_body: {
    example: {
      translations: [
        {
          languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          title: 'About Barnahus',
          description: '...',
          audioId: ''
        }
      ],
      images: [],
      deletedImages: []
    }
  },
  edit_about_translation_body: {
    example: {
      aboutTranslationId: '8e6b8ea8-85d9-4488-b15a-17cc8e36917e',
      title: 'About Barnahus',
      description: 'About Barnahus description',
      audioId: '8e6b8ea8-85d9-4488-b15a-17cc8e36986b',
      images: [],
      deletedImages: []
    }
  },
  delete_about_body: {
    example: {
      aboutId: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
    }
  },
  bulk_delete_abouts_body: {
    example: {
      aboutIds: ['83d0de32-41a0-4474-b93b-78c8e96e31a6']
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
  get_about_translations_response: {
    example: {
      data: {
        pagination: {
          count: 1,
          page: 1,
          limit: 10
        },
        abouts: [
          {
            aboutId: '409fb8d1-1b3e-4daf-bf69-93539ade0af9',
            aboutTranslationId: '0827e007-5144-421d-82a7-58b571f436ed',
            name: 'About bjarnahus',
            updated: '2024-03-01T15:43:16.000Z',
            status: 'Draft'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_about_translation_response: {
    example: {
      data: {
        aboutTranslation: {
          aboutId: '409fb8d1-1b3e-4daf-bf69-93539ade0af9',
          aboutTranslationId: '0827e007-5144-421d-82a7-58b571f436ed',
          title: 'About bjarnahus',
          description: 'Bjornahus',
          audio: {
            id: 'b8efd038-463b-4ef2-860b-e22dc3403246',
            name: 'werdnabla105.mp3',
            url: 'https://storage.googleapis.com/barnahus_dev/barnahus/d7fd29bb-a791-4d67-87e6-91f8c57afec7/audio/werdnabla105.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=barnahus-api%40barnahus.iam.gserviceaccount.com%2F20240722%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20240722T123938Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=1480b06e3c96c06af0482e529e29cfafcb89f0afb8da4e6fae20d0da738dc7482da6202aa75af6f7bc50663a01ecf25cf179acb8942d65ff41b5bc9ce11974555408de2ffdee34c71ab813c66a65ba83cd99683ff3086cc569c79ec33e908bf4cac310f7b7b751bba3a43a013615a3365ad7564f06b6c01fbaa10bfa39e0d77512f49e80def97949c742ca0e4b8ed2eae3a601d654a00eb4db4fbb3a8d191db595af938d2dacd0a8959b4203f47a633956366ede8c2bab9157b650381d0d2d9ae5ebdd8e14edba34fe7de1864a836c6f34a1c1a165034caab06ba03844207952aad99b876ba9dfa7c9b403060df343d872e02ad3fdf1ddf2529e8a350784b1be'
          },
          updated: '2024-03-01T15:43:16.000Z',
          status: 'Draft',
          aboutImages: [
            {
              aboutImageId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
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
  get_about_translation_404_response: {
    example: {
      data: null,
      code: 404014,
      message: 'About translation not found'
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

export const aboutTranslationDocs = { tags, paths, definitions }
