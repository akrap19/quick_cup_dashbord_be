const tags = [
  {
    name: 'Rooms',
    description: 'Room related routes'
  }
]

const paths = {
  '/room/translation': {
    post: {
      tags: ['Rooms'],
      description:
        'Creates room translation\n- if you exclude the roomId, a new room is created',
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
              $ref: '#/definitions/create_room_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created room',
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
      tags: ['Rooms'],
      description: 'Gets room translations for language',
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
          description: 'Successfully fetch room translation',
          content: {
            schema: {
              $ref: '#/definitions/get_room_translations_response'
            }
          }
        }
      }
    },
    put: {
      tags: ['Rooms'],
      description: 'Edits room',
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
              $ref: '#/definitions/edit_room_translation_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited room',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/room/translation/{id}': {
    get: {
      tags: ['Rooms'],
      description: 'Gets room translation',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: true,
          description: 'Room translation id'
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
          description: 'Successfully fetched room translation',
          content: {
            schema: {
              $ref: '#/definitions/get_room_translation_response'
            }
          }
        },
        '404': {
          description: 'Room translation not found',
          content: {
            schema: {
              $ref: '#/definitions/get_room_translation_404_response'
            }
          }
        }
      }
    }
  },
  '/room': {
    delete: {
      tags: ['Rooms'],
      description: 'Delete room ',
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
              $ref: '#/definitions/delete_room_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted room',
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
  '/room/translation/bulk': {
    post: {
      tags: ['Rooms'],
      description:
        'Bulk creates room translations\n- if you exclude the roomId, a new room is created',
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
              $ref: '#/definitions/bulk_create_room_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created rooms',
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
      tags: ['Rooms'],
      description: 'Bulk delete rooms ',
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
              $ref: '#/definitions/bulk_delete_rooms_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted rooms',
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
  '/room/translation/full': {
    post: {
      tags: ['Rooms'],
      description:
        'Creates full room translation\n- Must contain all language translations',
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
              $ref: '#/definitions/create_full_room_body'
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
          description: 'You must provide a translation for each language',
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
  create_room_body: {
    example: {
      roomId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      title: 'Waiting Room',
      description: '...',
      images: [],
      deletedImages: [],
      audioId: ''
    }
  },
  bulk_create_room_body: {
    example: {
      translations: [
        {
          roomId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          languageId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
          title: 'Waiting Room',
          description: '...',
          images: [],
          deletedImages: [],
          audioId: ''
        }
      ]
    }
  },
  create_full_room_body: {
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
  edit_room_translation_body: {
    example: {
      roomTranslationId: '8e6b8ea8-85d9-4488-b15a-17cc8e36917e',
      title: 'Waiting Room',
      description: 'Waiting Room description',
      audioId: '8e6b8ea8-85d9-4488-b15a-17cc8e36986b',
      images: [],
      deletedImages: []
    }
  },
  delete_room_body: {
    example: {
      roomId: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
    }
  },
  bulk_delete_rooms_body: {
    example: {
      roomIds: ['83d0de32-41a0-4474-b93b-78c8e96e31a6']
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
  get_room_translations_response: {
    example: {
      data: {
        pagination: {
          count: 1,
          page: 1,
          limit: 10
        },
        rooms: [
          {
            roomId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
            roomTranslationId: 'f7b364ff-baa2-45bb-90bc-8dcc47d54cde',
            name: 'Waiting Room',
            updated: '2024-02-29T09:39:08.203Z',
            status: 'Hidden'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_room_translation_response: {
    example: {
      data: {
        roomTranslation: {
          roomId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
          roomTranslationId: 'f7b364ff-baa2-45bb-90bc-8dcc47d54cde',
          title: 'Waiting Room',
          description: '...',
          audio: {
            id: '7797d9a6-a5ea-476f-93b7-2fc018ba3b5a',
            name: 'werdnabla104.mp3',
            url: 'https://storage.googleapis.com/barnahus_dev/barnahus/d7fd29bb-a791-4d67-87e6-91f8c57afec7/audio/werdnabla104.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=barnahus-api%40barnahus.iam.gserviceaccount.com%2F20240722%2Fauto%2Fstorage%2Fgoog4_request&X-Goog-Date=20240722T122456Z&X-Goog-Expires=3600&X-Goog-SignedHeaders=host&X-Goog-Signature=87592eb5c6317d8233344f7f8aa60a12d0d13fe2ca28fc7d4f896ccdedc004bcd039563334b815e0caa87af58d69bf5e077a5f4796a8637653057ed68200a5959cd33106f6d76d9e46f9abc21c31154dce03922b9a98b17d7d9c4f3dca07777b8156ffdcadc61eca9ace09929a10ba19da0db6af264f6909f752d1652608821736659e05958a46db9ed6a35c6224ad886ca8bdaa83161aad025d0aeaec02eae83262c3a2a628ea3f6c41d9fd3252fb1a40bf99679930d7d8e0a3617efc182f3230428ace85bc17e9182711233806de1a5ab4ed632f6b4ddfeebfa590793f96a5e9f02ec6e389fb2cef8d67f1221d714de7db527abeacc956b8081918a9bdffa6'
          },
          updated: '2024-02-29T10:56:14.000Z',
          status: 'Hidden',
          roomImages: [
            {
              roomImageId: '4c9ae48c-759d-4f21-9ba9-2e25e3b3e12f',
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
  get_room_translation_404_response: {
    example: {
      data: null,
      code: 404012,
      message: 'Room translation not found'
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

export const roomTranslationDocs = { tags, paths, definitions }
