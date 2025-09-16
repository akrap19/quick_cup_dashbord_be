const tags = [
  {
    name: 'User Settings',
    description: 'User settings related routes'
  }
]

const paths = {
  '/user/settings': {
    get: {
      tags: ['User Settings'],
      description: 'Get user settings',
      parameters: [
        {
          in: 'header',
          name: 'X-Barnahus-ID',
          type: 'string',
          required: false,
          description: 'Barnahus ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got user settings',
          content: {
            schema: {
              $ref: '#/definitions/user_settings_response'
            }
          }
        }
      }
    }
  },
  '/user/personal': {
    put: {
      tags: ['User Settings'],
      description: 'Edit user personal settings',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_personal_settings_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited user personal settings',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/user/password': {
    put: {
      tags: ['User Settings'],
      description: 'Edit user password',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_password_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully changed user password',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/user/email': {
    put: {
      tags: ['User Settings'],
      description: 'Edit user email',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_user_email_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully submitted new email change',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/user/validateEmail/:uid': {
    get: {
      tags: ['User Settings'],
      description: 'Validate new user email',
      parameters: [
        {
          in: 'path',
          name: 'uid',
          type: 'string',
          required: true,
          description: 'Validation UID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully changed user email',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'User not found',
          content: {
            schema: {
              $ref: '#/definitions/user_not_found_response'
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
  user_settings_response: {
    example: {
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@email.com',
        newEmail: 'new@email.com',
        phoneNumber: null,
        locationCode: 'SW-ST-1',
        barnahusName: 'Barnahus'
      },
      code: 200000,
      message: 'OK'
    }
  },
  user_not_found_response: {
    example: {
      data: null,
      code: 404001,
      message: 'User not found'
    }
  },
  edit_personal_settings_body: {
    example: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '091442323'
    }
  },
  edit_password_body: {
    example: {
      oldPassword: 'password1',
      newPassword: 'password2'
    }
  },
  edit_user_email_body: {
    example: {
      email: 'test@email.com'
    }
  }
}

export const userDocs = { tags, paths, definitions }
