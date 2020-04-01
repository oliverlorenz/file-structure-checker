export default {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    FsResource: {
      properties: {
        children: {
          items: {
            $ref: '#/definitions/FsResource',
          },
          type: 'array',
        },
        generateChildren: {
          items: {
            $ref: '#/definitions/FsResource',
          },
          type: 'array',
        },
        list: {
          type: 'string',
        },
        name: {
          type: 'string',
        },
        type: {
          $ref: '#/definitions/FsResourceType',
        },
      },
      type: 'object',
    },
    FsResourceType: {
      enum: [
        'directory',
        'file',
      ],
      type: 'string',
    },
  },
  properties: {
    structure: {
      $ref: '#/definitions/FsResource',
    },
    vars: {
      additionalProperties: true,
      properties: {
      },
      type: 'object',
    },
  },
  type: 'object',
};
