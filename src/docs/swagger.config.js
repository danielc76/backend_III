import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',

    info: {
      title: 'ShipNow API',
      version: '1.0.0',
      description: 'Documentación interactiva de la API de ShipNow para gestión de usuarios, pedidos, entregas, mocks y logging.'
    },

    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Servidor local'
      }
    ],

    tags: [
      {
        name: 'Users',
        description: 'Gestión de usuarios'
      },
      {
        name: 'Orders',
        description: 'Gestión de pedidos'
      },
      {
        name: 'Deliveries',
        description: 'Gestión de entregas'
      },
      {
        name: 'Mocks',
        description: 'Generación de datos simulados'
      },
      {
        name: 'Logger',
        description: 'Herramientas internas para validar el sistema de logging'
      }
    ]
  },

  apis: [
    './src/docs/**/*.yaml'
  ]
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);