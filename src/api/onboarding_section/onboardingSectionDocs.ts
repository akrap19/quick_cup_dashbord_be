const tags = [
  {
    name: 'Onboarding Sections',
    description: 'Onboarding section related routes'
  }
]

const paths = {
  '/onboarding': {
    post: {
      tags: ['Onboarding Sections'],
      description: 'Create onboarding section',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_onboarding_section_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted onboarding section',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '409': {
          description: '',
          content: {
            schema: {
              $ref: '#/definitions/create_onboarding_section_409_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Onboarding Sections'],
      description: 'Get onboarding sections',
      responses: {
        '200': {
          description: 'Successfully fetched onboarding sections',
          content: {
            schema: {
              $ref: '#/definitions/get_onboarding_sections_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Onboarding Sections'],
      description: 'Delete onboarding sections',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_onboarding_section_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted onboarding section',
          content: {
            schema: {
              $ref: '#/definitions/delete_onboarding_sections_response'
            }
          }
        },
        '404': {
          description: 'Onboarding section not found',
          content: {
            schema: {
              $ref: '#/definitions/onboarding_section_not_found'
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
  create_onboarding_section_body: {
    example: {
      onboardingSection: 'About Barnahus'
    }
  },
  delete_onboarding_section_body: {
    example: {
      onboardingSection: 'About Barnahus'
    }
  },
  create_onboarding_section_409_response: {
    example: {
      data: null,
      code: 409002,
      message: 'This onboarding section has already been added'
    }
  },
  get_onboarding_sections_response: {
    example: {
      data: {
        onboardingSections: ['About Barnahus']
      },
      code: 200000,
      message: 'OK'
    }
  },
  delete_onboarding_sections_response: {
    example: {
      data: {},
      code: 200000,
      message: 'OK'
    }
  },
  onboarding_section_not_found: {
    example: {
      data: null,
      code: 404003,
      message: 'Onboarding section not found'
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

export const onboardingSectionDocs = { tags, paths, definitions }
