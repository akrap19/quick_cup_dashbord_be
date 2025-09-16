const tags = [
  {
    name: 'Auth',
    description: 'Authentication related routes'
  }
]

const paths = {
  '/auth/login': {
    post: {
      tags: ['Auth'],
      description: 'Login',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/auth_login_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully logged in',
          content: {
            schema: {
              $ref: '#/definitions/auth_login_response'
            }
          }
        },
        '404': {
          description:
            'Given email is not linked to a user or password is incorrect',
          content: {
            schema: {
              $ref: '#/definitions/auth_login_response_404'
            }
          }
        }
      }
    }
  },
  '/auth/mobile-login': {
    post: {
      tags: ['Auth'],
      description: 'Login for mobile APP',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/auth_mobile_login_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully logged in',
          content: {
            schema: {
              $ref: '#/definitions/auth_mobile_login_response'
            }
          }
        },
        '404': {
          description:
            'Given email is not linked to a user or password is incorrect',
          content: {
            schema: {
              $ref: '#/definitions/auth_login_response_404'
            }
          }
        }
      }
    }
  },
  '/auth/case/login': {
    post: {
      tags: ['Auth'],
      description: 'Case login for mobile APP',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/auth_case_login_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully logged in',
          content: {
            schema: {
              $ref: '#/definitions/auth_case_login_response'
            }
          }
        },
        '404': {
          description:
            'Given email is not linked to a user or password is incorrect',
          content: {
            schema: {
              $ref: '#/definitions/auth_login_response_404'
            }
          }
        }
      }
    }
  },
  '/auth/verify': {
    post: {
      tags: ['Auth'],
      description: 'Verify user and set password',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/auth_verify_user_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'User verified and logged in',
          content: {
            schema: {
              $ref: '#/definitions/auth_login_response'
            }
          }
        }
      }
    }
  },
  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      description: 'Refresh access token',
      responses: {
        '200': {
          description: 'Successfully refreshed access token',
          content: {
            schema: {
              $ref: '#/definitions/refresh_token_response'
            }
          }
        },
        '401:40101': {
          description: 'Invalid token',
          content: {
            schema: {
              $ref: '#/definitions/401_response'
            }
          }
        },
        '401:40102': {
          description: 'Expired token',
          content: {
            schema: {
              $ref: '#/definitions/auth_expired_token_response'
            }
          }
        }
      }
    }
  },
  '/auth/password/forgot': {
    post: {
      tags: ['Auth'],
      description: 'Send forgot password email',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/auth_forgot_password_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Email sent',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/auth/password/reset': {
    post: {
      tags: ['Auth'],
      description: 'Reset password',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/auth_reset_password_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Password reset',
          content: {
            schema: {
              $ref: '#/definitions/auth_login_response'
            }
          }
        }
      }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      description: 'Logout user',
      responses: {
        '200': {
          description: 'Successfully logged out user',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        }
      }
    }
  },
  '/auth/email': {
    get: {
      tags: ['Auth'],
      description: 'Get email',
      parameters: [
        {
          in: 'query',
          name: 'uid',
          type: 'string',
          required: true,
          description: 'Verification UID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully returned user email',
          content: {
            schema: {
              $ref: '#/definitions/auth_get_email_body'
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
        },
        '401': {
          description: 'Invalid uid',
          content: {
            schema: {
              $ref: '#/definitions/invalid_uid_response'
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
  auth_login_response: {
    example: {
      data: {
        user: {
          userId: '',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phoneNumber: null,
          roles: [
            {
              userRoleId: '94104c89-e04a-41b6-9902-e19c723c1354',
              name: 'Admin',
              barnahuses: [
                {
                  barnahusId: '74b21c19-61fd-4e4a-87ad-1cd9f1874671',
                  name: 'Test Barnahus',
                  location: 'Stockholm, Sweden'
                }
              ]
            }
          ],
          barnahusRoles: [
            {
              barnahusId: '74b21c19-61fd-4e4a-87ad-1cd9f1874671',
              name: 'Test Barnahus',
              location: 'Stockholm, Sweden',
              userRoles: [
                {
                  userRoleId: '94104c89-e04a-41b6-9902-e19c723c1354',
                  name: 'Admin'
                }
              ]
            }
          ]
        },
        accessToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcwOTczNDAzNH0.XIKDtSlSu4fMeeA0aT4rfipTTFTSoAbKKykQIUkp2vAFtb71PwLkQPrT3GkBpIZxWKwg2FWDeWfJuM3shUshjm2YV0MaLoIAbGbeRlXIwdlVEcSDykTriEMDJxBWL1Fo13YhGmJ0pnWJFwMztpwwXZ6RP1zSAYvTTj5l8TN8TdE4FH1XyTGjo-T1J2SnmA7_G4J1YueXafHvn9Nd863Ek3o2nMhvSOlL5d1dUsLLwaSL3AtdVYFFQ7gP4K31z_AstI0jFB_SXE0EikvEnnjc__we17A0j5u16p_r3nI5_aqRAan7UkGgw3nfGAz4qiXU9fjDfMfCgQRJkxTbCLHGQQ',
        refreshToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcxMDMzNzkzNH0.ash2Qt6Bvmco72hEe2_HVtONamC9UMkVG2KLjjOsXPKl2GPG8Jx8tgykcnBkjRTLO22uFyBqHxzIsxcYBvb-5fA3GIbfqzvnRxrL26SvP6n23-lL0q0aFLmka_iFjOjanZGUTCLTmVVhmnYtNrlqiRNJ3adXN3iN3kPiKdgydQXO9LOgtIA48fq2SyC4_foU2uCxtU1ZDHwXOkamN6G9RO-GlOE3Q9KTHEblnuPMlCOGPcScVEDW_l13MO2vPETdkfitUyxo2_iMSBtTqUHhq57gp07dnni6xnJjcL6miwnS-uo-Npa5qz3F64JH2q28LGoUZ4SoiSZQgriZD1Xg8w',
        accessTokenExpiresAt: '2024-03-06T14:07:14.922Z',
        refreshTokenExpiresAt: '2024-03-13T13:52:14.681Z'
      },
      code: 200000,
      message: 'OK'
    }
  },
  auth_mobile_login_response: {
    example: {
      data: {
        barnahusId: '74b21c19-61fd-4e4a-87ad-1cd9f1874671',
        accessToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcwOTczNDAzNH0.XIKDtSlSu4fMeeA0aT4rfipTTFTSoAbKKykQIUkp2vAFtb71PwLkQPrT3GkBpIZxWKwg2FWDeWfJuM3shUshjm2YV0MaLoIAbGbeRlXIwdlVEcSDykTriEMDJxBWL1Fo13YhGmJ0pnWJFwMztpwwXZ6RP1zSAYvTTj5l8TN8TdE4FH1XyTGjo-T1J2SnmA7_G4J1YueXafHvn9Nd863Ek3o2nMhvSOlL5d1dUsLLwaSL3AtdVYFFQ7gP4K31z_AstI0jFB_SXE0EikvEnnjc__we17A0j5u16p_r3nI5_aqRAan7UkGgw3nfGAz4qiXU9fjDfMfCgQRJkxTbCLHGQQ',
        refreshToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcxMDMzNzkzNH0.ash2Qt6Bvmco72hEe2_HVtONamC9UMkVG2KLjjOsXPKl2GPG8Jx8tgykcnBkjRTLO22uFyBqHxzIsxcYBvb-5fA3GIbfqzvnRxrL26SvP6n23-lL0q0aFLmka_iFjOjanZGUTCLTmVVhmnYtNrlqiRNJ3adXN3iN3kPiKdgydQXO9LOgtIA48fq2SyC4_foU2uCxtU1ZDHwXOkamN6G9RO-GlOE3Q9KTHEblnuPMlCOGPcScVEDW_l13MO2vPETdkfitUyxo2_iMSBtTqUHhq57gp07dnni6xnJjcL6miwnS-uo-Npa5qz3F64JH2q28LGoUZ4SoiSZQgriZD1Xg8w',
        accessTokenExpiresAt: '2024-03-06T14:07:14.922Z',
        refreshTokenExpiresAt: '2024-03-13T13:52:14.681Z'
      },
      code: 200000,
      message: 'OK'
    }
  },
  auth_case_login_response: {
    example: {
      data: {
        barnahusId: '74b21c19-61fd-4e4a-87ad-1cd9f1874671',
        accessToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcwOTczNDAzNH0.XIKDtSlSu4fMeeA0aT4rfipTTFTSoAbKKykQIUkp2vAFtb71PwLkQPrT3GkBpIZxWKwg2FWDeWfJuM3shUshjm2YV0MaLoIAbGbeRlXIwdlVEcSDykTriEMDJxBWL1Fo13YhGmJ0pnWJFwMztpwwXZ6RP1zSAYvTTj5l8TN8TdE4FH1XyTGjo-T1J2SnmA7_G4J1YueXafHvn9Nd863Ek3o2nMhvSOlL5d1dUsLLwaSL3AtdVYFFQ7gP4K31z_AstI0jFB_SXE0EikvEnnjc__we17A0j5u16p_r3nI5_aqRAan7UkGgw3nfGAz4qiXU9fjDfMfCgQRJkxTbCLHGQQ',
        refreshToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcxMDMzNzkzNH0.ash2Qt6Bvmco72hEe2_HVtONamC9UMkVG2KLjjOsXPKl2GPG8Jx8tgykcnBkjRTLO22uFyBqHxzIsxcYBvb-5fA3GIbfqzvnRxrL26SvP6n23-lL0q0aFLmka_iFjOjanZGUTCLTmVVhmnYtNrlqiRNJ3adXN3iN3kPiKdgydQXO9LOgtIA48fq2SyC4_foU2uCxtU1ZDHwXOkamN6G9RO-GlOE3Q9KTHEblnuPMlCOGPcScVEDW_l13MO2vPETdkfitUyxo2_iMSBtTqUHhq57gp07dnni6xnJjcL6miwnS-uo-Npa5qz3F64JH2q28LGoUZ4SoiSZQgriZD1Xg8w',
        accessTokenExpiresAt: '2024-03-06T14:07:14.922Z',
        refreshTokenExpiresAt: '2024-03-13T13:52:14.681Z',
        shouldChangePassword: true,
        canAddnotes: true
      },
      code: 200000,
      message: 'OK'
    }
  },
  auth_login_response_404: {
    example: {
      data: null,
      code: 400002,
      message: 'Wrong email or password'
    }
  },
  auth_verify_user_body: {
    example: {
      uid: '',
      password: '12345678'
    }
  },
  auth_get_email_body: {
    example: {
      data: 'test@email.com',
      code: 200000,
      message: 'OK'
    }
  },
  auth_login_body: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        example: 'john.doe@email.com'
      },
      password: {
        type: 'string',
        example: '*******'
      }
    },
    required: ['email', 'password']
  },
  auth_mobile_login_body: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        example: 'john.doe@email.com'
      },
      password: {
        type: 'string',
        example: '*******'
      },
      locationCode: {
        type: 'string',
        locationCode: 'SW-ST-1'
      }
    },
    required: ['email', 'password']
  },
  auth_case_login_body: {
    type: 'object',
    properties: {
      customId: {
        type: 'string',
        example: 'sosipujse'
      },
      password: {
        type: 'string',
        example: '*******'
      }
    },
    required: ['customId', 'password']
  },
  reset_case_password_body: {
    type: 'object',
    properties: {
      password: {
        type: 'string',
        example: '*******'
      },
      newPassword: {
        type: 'string',
        example: '*******'
      }
    },
    required: ['newPassword', 'password']
  },
  auth_expired_token_response: {
    example: {
      data: null,
      code: 401002,
      message: 'Session expired'
    }
  },
  refresh_token_response: {
    example: {
      data: {
        user: {
          userId: '',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          phoneNumber: null,
          roles: [
            {
              userRoleId: '94104c89-e04a-41b6-9902-e19c723c1354',
              name: 'Admin',
              barnahuses: [
                {
                  barnahusId: '74b21c19-61fd-4e4a-87ad-1cd9f1874671',
                  name: 'Test Barnahus',
                  location: 'Stockholm, Sweden'
                }
              ]
            }
          ],
          barnahusRoles: [
            {
              barnahusId: '74b21c19-61fd-4e4a-87ad-1cd9f1874671',
              name: 'Test Barnahus',
              location: 'Stockholm, Sweden',
              userRoles: [
                {
                  userRoleId: '94104c89-e04a-41b6-9902-e19c723c1354',
                  name: 'Admin'
                }
              ]
            }
          ]
        },
        accessToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcwOTczNDAzNH0.XIKDtSlSu4fMeeA0aT4rfipTTFTSoAbKKykQIUkp2vAFtb71PwLkQPrT3GkBpIZxWKwg2FWDeWfJuM3shUshjm2YV0MaLoIAbGbeRlXIwdlVEcSDykTriEMDJxBWL1Fo13YhGmJ0pnWJFwMztpwwXZ6RP1zSAYvTTj5l8TN8TdE4FH1XyTGjo-T1J2SnmA7_G4J1YueXafHvn9Nd863Ek3o2nMhvSOlL5d1dUsLLwaSL3AtdVYFFQ7gP4K31z_AstI0jFB_SXE0EikvEnnjc__we17A0j5u16p_r3nI5_aqRAan7UkGgw3nfGAz4qiXU9fjDfMfCgQRJkxTbCLHGQQ',
        refreshToken:
          'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwYTE1MmMyNS04YjY3LTQ1NWUtYTA2Yi03OTNlYTBjOTcwZjQiLCJpYXQiOjE3MDk3MzMxMzQsImV4cCI6MTcxMDMzNzkzNH0.ash2Qt6Bvmco72hEe2_HVtONamC9UMkVG2KLjjOsXPKl2GPG8Jx8tgykcnBkjRTLO22uFyBqHxzIsxcYBvb-5fA3GIbfqzvnRxrL26SvP6n23-lL0q0aFLmka_iFjOjanZGUTCLTmVVhmnYtNrlqiRNJ3adXN3iN3kPiKdgydQXO9LOgtIA48fq2SyC4_foU2uCxtU1ZDHwXOkamN6G9RO-GlOE3Q9KTHEblnuPMlCOGPcScVEDW_l13MO2vPETdkfitUyxo2_iMSBtTqUHhq57gp07dnni6xnJjcL6miwnS-uo-Npa5qz3F64JH2q28LGoUZ4SoiSZQgriZD1Xg8w',
        accessTokenExpiresAt: '2024-03-06T14:07:14.922Z',
        refreshTokenExpiresAt: '2024-03-13T13:52:14.681Z'
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
  invalid_uid_response: {
    example: {
      data: null,
      code: 401004,
      message: 'Invalid or expired UID'
    }
  },
  auth_forgot_password_body: {
    example: {
      email: 'john.doe@email.com'
    }
  },
  auth_reset_password_body: {
    example: {
      uid: '',
      password: '12345678'
    }
  }
}

export const authDocs = { tags, paths, definitions }
