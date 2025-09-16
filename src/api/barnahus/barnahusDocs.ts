const tags = [
  {
    name: 'Barnahus',
    description: 'Barnahus related routes'
  }
]

const paths = {
  '/barnahus': {
    post: {
      tags: ['Barnahus'],
      description: 'Creates Barnahus',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_barnahus_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created Barnahus',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Barnahus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    },
    get: {
      tags: ['Barnahus'],
      description: 'Get list of barnahuses with pagination ',
      parameters: [
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'Search query'
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
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got list of barnahuses',
          content: {
            schema: {
              $ref: '#/definitions/get_barnahuses_response'
            }
          }
        },
        '404': {
          description: 'Barnahus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    },
    put: {
      tags: ['Barnahus'],
      description: 'Edit barnahus ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/edit_barnahus_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully edited barnahus',
          content: {
            schema: {
              $ref: '#/definitions/200_response'
            }
          }
        },
        '404': {
          description: 'Barhanus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    },
    delete: {
      tags: ['Barnahus'],
      description: 'Delete barnahus ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/delete_barnahus_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted barnahus',
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
  '/barnahus/{id}': {
    get: {
      tags: ['Barnahus'],
      description: 'Get barnahus',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got barnahus',
          content: {
            schema: {
              $ref: '#/definitions/get_barnahus_response'
            }
          }
        },
        '404': {
          description: 'Barnahus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    }
  },
  '/barnahus/assignable': {
    get: {
      tags: ['Barnahus'],
      description: 'Get list of assignable barnahuses',
      parameters: [
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'Search query'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got list of assignable barnahuses',
          content: {
            schema: {
              $ref: '#/definitions/get_barnahuses_response'
            }
          }
        },
        '404': {
          description: 'Barnahus not found',
          content: {
            schema: {
              $ref: '#/definitions/barnahus_not_found_response'
            }
          }
        }
      }
    }
  },
  '/barnahus/bulk': {
    delete: {
      tags: ['Barnahus'],
      description: 'Bulk delete barnahuses ',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/bulk_delete_barnahuses_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully deleted barnahuses',
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
  '/barnahus/locations/search': {
    get: {
      tags: ['Barnahus'],
      description: 'Search for locations of barnahus',
      parameters: [
        {
          in: 'query',
          name: 'search',
          type: 'string',
          required: false,
          description: 'Search query'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got search results',
          content: {
            schema: {
              $ref: '#/definitions/get_barnahus_locations_response'
            }
          }
        }
      }
    }
  },
  '/barnahus/locations': {
    get: {
      tags: ['Barnahus'],
      description: 'Get list of Barnahus locations',
      responses: {
        '200': {
          description: 'Successfully got Barnahus locations',
          content: {
            schema: {
              $ref: '#/definitions/get_barnahus_locations_response'
            }
          }
        }
      }
    }
  },
  '/barnahus/{id}/translations': {
    get: {
      tags: ['Barnahus'],
      description: 'Get all translations under one Barnahus',
      parameters: [
        {
          in: 'path',
          name: 'id',
          type: 'string',
          required: true,
          description: 'Barnahus ID'
        }
      ],
      responses: {
        '200': {
          description: 'Successfully got all Barnahus translations',
          content: {
            schema: {
              $ref: '#/definitions/get_barnahus_translations_response'
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
  get_barnahuses_response: {
    example: {
      data: {
        pagination: {
          count: 2,
          page: 1,
          limit: 10
        },
        barnahuses: [
          {
            barnahusId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e51',
            name: 'House1',
            location: 'Stockholm, Sweden',
            locationCode: 'SW-ST-1',
            admin: 'John Doe'
          },
          {
            barnahusId: '43969d61-3f62-4f3f-b8c4-10f3f26b4e52',
            name: 'House2',
            location: 'Stockholm, Sweden',
            locationCode: 'SW-ST-2',
            admin: null
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_barnahus_response: {
    example: {
      data: {
        barnahus: {
          barnahusId: '1d311f79-3482-4e11-884a-63973d8bc46b',
          name: 'Test Barnahus',
          location: 'Stockholm, Sweden',
          locationCode: 'SW-ST-1',
          admin: 'John Doe',
          adminId: 'b693bd27-373d-4209-b842-07996c11808a'
        }
      },
      code: 200000,
      message: 'OK'
    }
  },
  barnahus_not_found_response: {
    example: {
      data: null,
      code: 404003,
      message: 'Barnahus not found'
    }
  },
  create_barnahus_body: {
    example: {
      name: 'Test Barnahus',
      location: 'Stockholm, Sweden',
      userId: null
    }
  },
  edit_barnahus_body: {
    example: {
      barnahusId: '83d0de32-41a0-4474-b93b-78c8e96e31a6',
      name: 'House1',
      location: 'Stockholm, Sweden',
      adminId: '83d0de32-41a0-4474-b93b-78c8e96e31a7'
    }
  },
  delete_barnahus_body: {
    example: {
      barnahusId: '83d0de32-41a0-4474-b93b-78c8e96e31a8'
    }
  },
  bulk_delete_barnahuses_body: {
    example: {
      barnahusIds: [
        '83d0de32-41a0-4474-b93b-78c8e96e31a6',
        '18b1c7f9-cd03-42db-9761-78a06d2a240d'
      ]
    }
  },
  search_barnahus_locations_response: {
    example: {
      data: {
        locations: [
          {
            id: 'ChIJOwg_06VPwokRYv534QaPC8g',
            name: 'New York, NY, USA',
            locationCode: 'NY-NE-1'
          },
          {
            id: 'ChIJ7VpAR1vYyVIR7hmQAX91ntk',
            name: 'New York Mills, MN, USA'
          },
          {
            id: 'ChIJ3QemtQBB2YkRpnQYzjMsqtA',
            name: 'New York Mills, NY, USA'
          },
          {
            id: 'ChIJkV9X3TxzeEgRQRJHDh1FqGk',
            name: 'New York, Lincoln, UK'
          },
          {
            id: 'ChIJ92VwtALW30ARhh8Dz3ZWKFo',
            name: 'Niu-York, Donetsk Oblast, Ukraine'
          }
        ]
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_barnahus_locations_response: {
    example: {
      data: {
        locations: ['Stockholm, Sweden']
      },
      code: 200000,
      message: 'OK'
    }
  },
  get_barnahus_translations_response: {
    example: {
      data: {
        roomData: {
          rooms: [],
          pagination: {
            count: 0,
            page: 1,
            limit: 1000
          }
        },
        staffData: {
          staff: [],
          pagination: {
            count: 0,
            page: 1,
            limit: 1000
          }
        },
        aboutData: {
          abouts: [],
          pagination: {
            count: 0,
            page: 1,
            limit: 1000
          }
        }
      },
      code: 200000,
      message: 'OK'
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
  }
}

export const barnahusDocs = { tags, paths, definitions }
