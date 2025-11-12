const tags = [
  {
    name: 'Products',
    description: 'Product management routes'
  }
]

const paths = {
  '/products': {
    get: {
      tags: ['Products'],
      description: 'List products',
      responses: {
        '200': {
          description: 'Successfully listed products'
        }
      }
    },
    post: {
      tags: ['Products'],
      description: 'Create a new product',
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/create_product_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully created product'
        }
      }
    }
  },
  '/products/{productId}': {
    get: {
      tags: ['Products'],
      description: 'Get product details',
      parameters: [
        {
          in: 'path',
          name: 'productId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '200': {
          description: 'Successfully retrieved product'
        },
        '404': {
          description: 'Product not found'
        }
      }
    },
    put: {
      tags: ['Products'],
      description: 'Update product',
      parameters: [
        {
          in: 'path',
          name: 'productId',
          type: 'string',
          required: true
        }
      ],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/definitions/update_product_body'
            }
          }
        }
      },
      responses: {
        '200': {
          description: 'Successfully updated product'
        }
      }
    },
    delete: {
      tags: ['Products'],
      description: 'Delete product',
      parameters: [
        {
          in: 'path',
          name: 'productId',
          type: 'string',
          required: true
        }
      ],
      responses: {
        '204': {
          description: 'Successfully deleted product'
        }
      }
    }
  }
}

const definitions = {
  create_product_body: {
    example: {
      name: 'Sample Product',
      description: 'Sample description',
      acquisitionType: 'buy'
    }
  },
  update_product_body: {
    example: {
      name: 'Updated product name',
      description: 'Updated description',
      acquisitionType: 'rent'
    }
  }
}

export const productsDocs = { tags, paths, definitions }
