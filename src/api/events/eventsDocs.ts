const tags = [
  {
    name: 'Events',
    description: 'Event management routes'
  }
]

const paths = {
  '/events': {
    get: {
      tags: ['Events'],
      description: 'List events',
      responses: {
        '200': {
          description: 'Successfully listed events'
        }
      }
    },
    post: {
      tags: ['Events'],
      description: 'Create a new event',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_event_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created event'
        }
      }
    }
  },
  '/events/{eventId}': {
    get: {
      tags: ['Events'],
      description: 'Get event details',
      parameters: [
        {
          in: 'path',
          name: 'eventId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved event'
        },
        '404': {
          description: 'Event not found'
        }
      }
    },
    put: {
      tags: ['Events'],
      description: 'Update event',
      parameters: [
        {
          in: 'path',
          name: 'eventId',
          type: 'string',
          required: true
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_event_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully updated event'
        }
      }
    },
    delete: {
      tags: ['Events'],
      description: 'Delete event',
      parameters: [
        {
          in: 'path',
          name: 'eventId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '204': {
          description: 'Successfully deleted event'
        }
      }
    }
  }
}

const definitions = {
  create_event_body: {
    example: {
      userId: '1e698a0b-4984-43f4-9c39-5a1c5b2e5cf0',
      title: 'Summer Festival',
      description: 'Annual summer event',
      startDate: '2025-07-01T10:00:00.000Z',
      endDate: '2025-07-01T18:00:00.000Z',
      location: 'Central Park'
    }
  },
  update_event_body: {
    example: {
      title: 'Updated name',
      location: 'Updated location'
    }
  }
}

export const eventsDocs = { tags, paths, definitions }
