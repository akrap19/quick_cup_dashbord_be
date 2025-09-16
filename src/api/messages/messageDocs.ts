const tags = [
  {
    name: 'Dynamic messages',
    description: 'Dynamic message related routes'
  }
]

const paths = {
  '/message/{slug}': {
    get: {
      tags: ['Dynamic messages'],
      description: 'Get message',
      parameters: [
        {
          in: 'path',
          name: 'slug',
          type: 'string',
          required: true,
          description: 'Dynamic message slug'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got dynamic message',
          content: {
            schema: {
              $ref: '#/definitions/get_dynamic_message_response'
            }
          }
        },
        '404': {
          description: 'Dynamic message not found',
          content: {
            schema: {
              $ref: '#/definitions/message_not_found_response'
            }
          }
        }
      }
    }
  }
}

const definitions = {
  get_dynamic_message_response: {
    example: {
      data: {
        slug: 'test',
        title: 'Test',
        message: 'Test message',
        redirectUrl: '/test',
        type: 'Success'
      },
      code: 200000,
      message: 'OK'
    }
  },
  message_not_found_response: {
    example: {
      data: null,
      code: 404008,
      message: 'Dynamic message not found'
    }
  }
}

export const messageDocs = { tags, paths, definitions }
