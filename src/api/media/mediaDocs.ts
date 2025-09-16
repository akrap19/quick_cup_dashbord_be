const tags = [
  {
    name: 'Media',
    description: 'Media related routes'
  }
]

const paths = {
  '/media': {
    post: {
      tags: ['Media'],
      description: 'Upload media\n- type can be Image, Audio, or Video',
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
          name: 'type',
          type: 'string',
          required: true,
          description: 'Media type'
        }
      ],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                media: {
                  type: 'string',
                  format: 'binary',
                  description: 'Media file'
                }
              }
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully uploaded media',
          content: {
            schema: {
              $ref: '#/definitions/media_200_response'
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
        '404: 404002': {
          description: 'No file uploaded',
          content: {
            schema: {
              $ref: '#/definitions/file_not_found_response'
            }
          }
        },
        '415': {
          definitions: 'Unsupported media type',
          content: {
            schema: {
              $ref: '#/definitions/media_415_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Media'],
      description: 'Delete media section',
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
              $ref: '#/definitions/delete_media_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted media',
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
  }
}

const definitions = {
  media_200_response: {
    example: {
      data: {
        mediaId: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
      },
      code: 200000,
      message: 'OK'
    }
  },
  '400_failed_insert_response': {
    example: {
      data: null,
      code: 400005,
      message: 'Failed to insert'
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
  media_415_response: {
    example: {
      data: null,
      code: 415000,
      message: 'Wrong input type'
    }
  },
  delete_media_body: {
    example: {
      mediaId: '83d0de32-41a0-4474-b93b-78c8e96e31a6'
    }
  }
}

export const mediaDocs = { tags, paths, definitions }
