const tags = [
  {
    name: 'Voice-over',
    description: 'Voice-over related endpoints'
  }
]

const paths = {
  '/voiceover/': {
    post: {
      tags: ['Voice-over'],
      description: 'Get URL for voice-over',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/get_voiceover_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully got voiceover URL',
          content: {
            schema: {
              $ref: '#/definitions/get_voiceover_response'
            }
          }
        }
      }
    }
  }
}

const definitions = {
  get_voiceover_body: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        example: 'age'
      },
      language: {
        type: 'string',
        example: 'en'
      }
    }
  },
  get_voiceover_response: {
    example: {
      data: { url: 'https://...' },
      code: 200000,
      message: 'OK'
    }
  }
}

export const voiceoverDocs = { tags, paths, definitions }
