const tags = [
  {
    name: 'Languages',
    description: 'Language related routes'
  }
]

const paths = {
  '/language': {
    post: {
      tags: ['Languages'],
      description:
        'Creates language\n- code - optional, include if language can be found in supported languages',
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
              $ref: '#/definitions/create_language_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created language',
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
        },
        '400:400006': {
          description: 'Language is not translateable',
          content: {
            schema: {
              $ref: '#definitions/400_language_not_translateable_response'
            }
          }
        },
        '404': {
          description: 'Admin does not belong to any barnahus',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Languages'],
      description: 'Get list of languages with pagination',
      parameters: [
        {
          in: 'query',
          name: 'status',
          type: 'string',
          required: false,
          description: 'Language status (Draft, Published, Hidden)'
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
          description: 'Successfully got list of languages',
          content: {
            schema: {
              $ref: '#/definitions/get_languages_response'
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
    },
    put: {
      tags: ['Languages'],
      description:
        'Edit language\n - status can be changed to Published and Hidden',
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
              $ref: '#/definitions/edit_language_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited language',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Failed to edit language',
          content: {
            schema: {
              $ref: '#/definitions/400_failed_edit_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Languages'],
      description: 'Delete language ',
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
              $ref: '#/definitions/delete_language_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted language',
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
  '/language/{id}': {
    get: {
      tags: ['Languages'],
      description: 'Search supported languages',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
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
          description: 'Successfully got language',
          content: {
            schema: {
              $ref: '#/definitions/get_language_response'
            }
          }
        }
      }
    }
  },
  '/language/{id}/publishable': {
    get: {
      tags: ['Languages'],
      description: 'Check if language is publishable',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
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
          description: 'Got publishable status',
          content: {
            schema: {
              $ref: '#/definitions/get_language_publishable_response'
            }
          }
        }
      }
    }
  },
  '/language/search': {
    get: {
      tags: ['Languages'],
      description:
        'Get list of languages\n - to be used for content language dropdowns',
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
          description: 'Successfully got list of languages',
          content: {
            schema: {
              $ref: '#/definitions/get_languages_response'
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
  '/language/supported': {
    get: {
      tags: ['Languages'],
      description: 'Search supported languages',
      parameters: [
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'Language search query'
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
          description: 'Successfully got list of languages',
          content: {
            schema: {
              $ref: '#/definitions/search_languages_response'
            }
          }
        }
      }
    }
  },
  '/language/bulk': {
    delete: {
      tags: ['Languages'],
      description: 'Bulk delete languages',
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
              $ref: '#/definitions/bulk_delete_languages_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted language',
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
  '/language/publish': {
    post: {
      tags: ['Languages'],
      description: 'Publish language',
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
              $ref: '#/definitions/publish_language_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully published language',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '400': {
          description: 'Language not publishable',
          content: {
            schema: {
              $ref: '#/definitions/language_not_publishable_response'
            }
          }
        }
      }
    }
  },
  '/language/translate': {
    post: {
      tags: ['Languages'],
      description: 'Auto translate language',
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
              $ref: '#/definitions/auto_translate_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully auto translated language',
          content: {
            schema: {
              $ref: '#/definitions/auto_translate_response'
            }
          }
        }
      }
    }
  },
  '/language/translate/content': {
    post: {
      tags: ['Languages'],
      description: 'Translate content',
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
              $ref: '#/definitions/translate_content_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully translated content',
          content: {
            schema: {
              $ref: '#/definitions/translate_content_response'
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
  get_languages_response: {
    example: {
      data: {
        pagination: {
          count: 2,
          page: 1,
          limit: 10
        },
        languages: [
          {
            languageId: '230e78fe-1d94-4b34-a715-b6939bccf630',
            name: 'English',
            status: 'Draft',
            autoTranslate: false,
            translateable: true,
            isDefault: true,
            hasCases: true
          },
          {
            languageId: '628b424e-a27d-4014-9168-20e5ca6dd40d',
            name: 'Croatian',
            status: 'Published',
            autoTranslate: true,
            translateable: true,
            isDefault: true,
            hasCases: false
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_published_languages_response: {
    example: {
      data: {
        languages: [
          {
            languageId: '230e78fe-1d94-4b34-a715-b6939bccf630',
            name: 'English',
            status: 'Published',
            autoTranslate: false,
            translateable: true,
            isDefault: true
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  search_languages_response: {
    example: {
      data: {
        languages: [
          {
            code: 'bn',
            name: 'Bengali'
          },
          {
            code: 'en',
            name: 'English'
          },
          {
            code: 'hmn',
            name: 'Hmong'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_language_response: {
    example: {
      data: {
        language: {
          languageId: '6e2e27da-e31e-4eae-9740-949d22c9616c',
          name: 'English',
          status: 'Hidden',
          autoTranslate: true,
          translateable: true,
          isDefault: true,
          hasCases: false
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  create_language_body: {
    example: {
      code: 'en',
      name: 'English',
      autoTranslate: true
    }
  },
  edit_language_body: {
    example: {
      languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      name: 'English',
      autoTranslate: true,
      status: 'Draft'
    }
  },
  delete_language_body: {
    example: {
      languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_languages_body: {
    example: {
      languageIds: [
        '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        '18b1c7f9-cd03-42db-9761-78a06d2a240d'
      ]
    }
  },
  publish_language_body: {
    example: {
      languageId: '628b424e-a27d-4014-9168-20e5ca6dd40d'
    }
  },
  auto_translate_body: {
    example: {
      languageId: '628b424e-a27d-4014-9168-20e5ca6dd40d'
    }
  },
  translate_content_body: {
    example: {
      languageId: '628b424e-a27d-4014-9168-20e5ca6dd40d',
      content: 'bla'
    }
  },
  auto_translate_response: {
    example: {
      data: {
        abouts: [
          {
            aboutId: 'be1fdaf3-b062-4015-a0e2-11c72c6ecff4',
            title: 'Barreeffama',
            description: '<p>qormaata</p>',
            audio: null,
            aboutImages: [
              {
                aboutImageId: '119b9fc7-dbb3-472c-811f-01689b4463e8',
                mediaId: '5bf6d9d4-78c9-4127-a3f0-7e1af0783bbb',
                url: 'https://storage.googleapis.com/barnahus_dev/barnahus/d7fd29bb-a791-4d67-87e6-91f8c57afec7/image/add-admin24.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=barnahus-api%40barnahus.iam.gserviceaccount.com%2F20240722%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20240722T154708Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=4d66f4a62c45b448420154c913d625250fe8fed4cac2a583f7ad1084bc926901cb4e563777afb291ddd2e786c72d4635e35ff3034f3976f13eb8495ea6d3244929b50bd4e9a0777f413554cb873d3d3ebc34109cc3311da179441809d7f661b7ce8123ef0143674a643b62d6ceb2ac376b846b0fe79ab1d9d3b499d532aab3599726b2254ea55048148ac5260d2fa43ae474f539337858496bce7ec437dd2b30f34bd554eaae30f320e79f15efd88bd3fd4952f11f51b15d86e0495d3c6f26fa6d2168814642ee891bf668cf6650352527cb4c0ef5524ebdb08dc517eb8bfbbc4e3005a044e9f5168d348f528a70b57ad0080396b235a47a33aa52de3b3c361a'
              }
            ]
          }
        ],
        rooms: [
          {
            roomId: '89d1986b-4374-4d33-b5e2-59e5a0ac0765',
            title: 'kutaa qormaataa',
            description: 'qormaata',
            audio: null,
            roomImages: [
              {
                roomImageId: '6c236f54-eba0-49c5-9acf-aa60ef1c3597',
                mediaId: '5969a6fb-81d0-4aca-a3c0-6a8d12ab7d01',
                url: 'https://storage.googleapis.com/barnahus_dev/barnahus/d7fd29bb-a791-4d67-87e6-91f8c57afec7/image/add-practitioner55.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=barnahus-api%40barnahus.iam.gserviceaccount.com%2F20240722%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20240722T154708Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=0371c5387b390fcdcf3aa5f2dfe9f6d0ed7c2ed1bd378e1228b2fe4fd0221ce449274ec34119876793361c93303b8b8d5710c49ca843795274200752b9583f3f74a330313fa5450066973a7abcf24b0c3b68e3e6b25529152c7fe540193a34685e39d082ab0df9fb5e4cc551e0461dd7becc8e0c54bacb27bc0acd276bf558bc9fa6e0f491dad5d90f0c6b266c0e96f1c64bd1839f48ce44e95ff63a67e56bd2476f8d834fe2bad776ee21be973bc0b26e90c7bc5638c97efb11f4c32332c259f5c5bacae9880033e8c24e2ff667cc5b967f03a032ee59c7af6d5b93f0efb6b0733596d1c5a66e2d9da4d784b164edc6891ff3718af63d7d155e7082fe6f1d3f'
              }
            ]
          }
        ],
        staff: [
          {
            staffId: '6984b647-1e17-4ca5-a1c0-05caf1f5fb06',
            name: 'Matija Von Beruf',
            title: 'ssss jechuun ni danda’ama',
            description: '<p>qormaata</p>',
            staffImages: [
              {
                staffImageId: '598e78b7-ddbb-4482-a313-0680fe70d9e3',
                mediaId: 'fdb936bc-051f-423b-935e-a6aaf40a4dc0',
                url: 'https://storage.googleapis.com/barnahus_dev/barnahus/d7fd29bb-a791-4d67-87e6-91f8c57afec7/image/add-admin25.png?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=barnahus-api%40barnahus.iam.gserviceaccount.com%2F20240722%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20240722T154708Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=9d859f5b77813fb1a6a7b5ee838d03ade0ea36627fe6f4be9f509362a92948c11ae721436fb1a5e79770d01513625f91c9c8aed8d486236628f8e2abb68d24bdb8ac9df6d535122337173b1e985895aae0c693f8444a60cdc610507edafec6c1a475cc82db870f51663d63c8b18056ef25260dfe3d15bda1283ef07f1d55232b3012bd5619f01d4b4d63fff8969c8f813414020a8b70cb335206aeafa3ebdef43dfcd1526924690aeca586ce7fe2103205dd8d094bca45b59ffcc32b5631f4a2a218abbdfb002004d22a1f1f3aa8478954e5f04938127569ee55aa37d4096bc65f9a4a57455970f40b303b754939e1cedf8abdffd36d0a4a5b60ff1119bf4099'
              }
            ]
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  translate_content_response: {
    example: {
      data: {
        translation: 'Content translated'
      },
      code: 200000,
      message: 'OK'
    }
  },
  language_not_publishable_response: {
    example: {
      data: null,
      code: 400010,
      message: 'This language does not meet all requirements to be published'
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
  '400_failed_insert_response': {
    example: {
      data: null,
      code: 400005,
      message: 'Failed to insert'
    }
  },
  '400_language_not_translateable_response': {
    example: {
      data: null,
      code: 400006,
      message: 'This language is not translateable'
    }
  },
  '400_failed_edit_response': {
    example: {
      data: null,
      code: 400004,
      message: 'Failed to edit'
    }
  },
  barnahus_not_found_response: {
    example: {
      data: null,
      code: 404003,
      message: 'Barnahus not found'
    }
  },
  not_found_response: {
    example: {
      data: null,
      code: 404000,
      message: 'Resource not found'
    }
  },
  get_language_publishable_response: {
    example: {
      data: {
        publishable: true
      },
      code: 200000,
      message: 'OK'
    }
  }
}

export const languageDocs = { tags, paths, definitions }
