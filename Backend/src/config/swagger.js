const swaggerSpec = {
    openapi: '3.0.3',
    info: {
      title: 'API Gestión CTM',
      version: '1.0.0',
      description: 'API del Centro Tecnológico del Mueble.',
      contact: { name: 'CTM' },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido del endpoint /auth/login',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['code', 'message'],
          properties: {
            code: { type: 'string', description: 'Código de error estandarizado' },
            message: { type: 'string', description: 'Mensaje de error legible' },
            details: {
              type: 'object',
              nullable: true,
              additionalProperties: true,
              description: 'Detalle adicional opcional del error'
            },
          },
          example: {
            code: 'BAD_REQUEST',
            message: 'Solicitud inválida',
            details: {
              field: 'cuit'
            }
          },
        },
        BusinessAddress: {
          type: 'object',
          properties: {
            id: { type: 'string', nullable: true },
            address: { type: 'string' },
            location: { type: 'string' },
            district: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string', nullable: true },
                  },
                },
                { type: 'null' },
              ],
            },
            origin: { type: 'string', enum: ['PUBLIC', 'CLIENT', 'LABORATORY'] },
          },
          example: {
            id: 'f3ee8d8d-2f29-4fcb-b44e-9e9c3c4be071',
            address: 'Av. Siempre Viva 742',
            location: 'Capital Federal',
            district: { id: 'AR-C', name: 'Ciudad Autónoma de Buenos Aires' },
            origin: 'PUBLIC',
          },
        },
        BusinessResponse: {
          type: 'object',
          properties: {
            cuit: { type: 'string' },
            name: { type: 'string' },
            source: { type: 'string', enum: ['MANUAL', 'PADRON'] },
            addresses: {
              type: 'array',
              items: { $ref: '#/components/schemas/BusinessAddress' },
            },
          },
          example: {
            cuit: '30712345678',
            name: 'MUEBLES DEL SUR SA',
            source: 'MANUAL',
            addresses: [],
          },
        },
        ClientResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            cuit: { type: 'string' },
            name: { type: 'string' },
            representative: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                dni: { type: 'string', nullable: true },
              },
            },
            contact: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                dni: { type: 'string', nullable: true },
                mail: { type: 'string', nullable: true },
                phone: { type: 'string', nullable: true },
              },
            },
            address: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'string' },
                address: { type: 'string' },
                location: { type: 'string' },
                district: {
                  type: 'object',
                  nullable: true,
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string', nullable: true },
                  },
                },
                origin: { type: 'string', enum: ['PUBLIC', 'CLIENT', 'LABORATORY'] },
              },
            },
            origin: { type: 'string', enum: ['CLIENT', 'LABORATORY'] },
            user: { type: 'string', nullable: true },
            billing: {
              type: 'object',
              nullable: true,
              properties: {
                cuit: { type: 'string', nullable: true },
                address: { type: 'string', nullable: true },
                location: { type: 'string', nullable: true },
                province: { type: 'string', nullable: true },
                paysIva: { type: 'boolean', nullable: true },
              },
            },
          },
          example: {
            id: 'c7cc82f8-e868-4336-a4a4-9ce44f051243',
            cuit: '30712345678',
            name: 'MUEBLES DEL SUR SA',
            representative: { id: '9f2a7be2-a7d6-4dbf-8712-58f9122d8ab4', name: 'Juan Perez', dni: '30111222' },
            contact: { id: '669d79f4-f2ae-4f5c-b7f9-034de12ec7a6', name: 'Maria Gomez', dni: '28999111', mail: 'maria@ctm.com', phone: '1144556677' },
            address: {
              id: 'f3ee8d8d-2f29-4fcb-b44e-9e9c3c4be071',
              address: 'Av. Siempre Viva 742',
              location: 'Capital Federal',
              district: { id: 'AR-C', name: 'Ciudad Autónoma de Buenos Aires' },
              origin: 'PUBLIC',
            },
            origin: 'CLIENT',
            user: '1d3f4e58-e7ae-4fc6-9b56-d0d6027efe6b',
            billing: null,
          },
        },
        PersonResponse: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            dni: { type: 'string', nullable: true },
            address: { type: 'string', nullable: true },
            phone: {
              type: 'object',
              properties: {
                country_code: { type: 'string', nullable: true },
                phone: { type: 'string', nullable: true },
              },
            },
            mail: { type: 'string', nullable: true },
            location: { type: 'string', nullable: true },
            district: {
              type: 'object',
              nullable: true,
              properties: { id: { type: 'string' }, name: { type: 'string', nullable: true } },
            },
            country: {
              type: 'object',
              nullable: true,
              properties: { id: { type: 'string' }, name: { type: 'string', nullable: true } },
            },
            userId: { type: 'string', nullable: true },
            user: { type: 'string', nullable: true },
            origin: { type: 'string', nullable: true },
            isThirdParty: { type: 'boolean', nullable: true },
          },
          example: {
            id: '9f2a7be2-a7d6-4dbf-8712-58f9122d8ab4',
            name: 'Juan Perez',
            dni: '30111222',
            address: 'Calle 123',
            phone: { country_code: '+54', phone: '1144556677' },
            mail: 'juan@ctm.com',
            location: 'Rosario',
            district: { id: 'AR-S', name: 'Santa Fe' },
            country: { id: 'AR', name: 'Argentina' },
            userId: '1d3f4e58-e7ae-4fc6-9b56-d0d6027efe6b',
            user: '1d3f4e58-e7ae-4fc6-9b56-d0d6027efe6b',
            origin: 'CLIENT',
            isThirdParty: false,
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['mail', 'password'],
          properties: {
            mail: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
          },
          example: {
            mail: 'laboratorio@ctmueble.com.ar',
            password: 'Secret123!',
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['mail', 'password'],
          properties: {
            mail: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            data: { type: 'object' },
          },
          example: {
            mail: 'nuevo.usuario@ctmueble.com.ar',
            password: 'Secret123!',
            data: {
              name: 'Nuevo Usuario',
              profile: 'CLIENT',
            },
          },
        },
        CreateClientRequest: {
          type: 'object',
          required: ['cuit', 'address', 'representative'],
          properties: {
            cuit: { type: 'string' },
            address: { oneOf: [{ type: 'string' }, { type: 'object' }] },
            representative: { type: 'string' },
            contact: { oneOf: [{ type: 'string' }, { type: 'object' }] },
          },
          example: {
            cuit: '30712345678',
            address: 'f3ee8d8d-2f29-4fcb-b44e-9e9c3c4be071',
            representative: '9f2a7be2-a7d6-4dbf-8712-58f9122d8ab4',
            contact: '669d79f4-f2ae-4f5c-b7f9-034de12ec7a6',
          },
        },
        UpdateClientRequest: {
          type: 'object',
          properties: {
            cuit: { type: 'string' },
            address: { type: 'object' },
            representative: { type: 'string' },
            contact: { type: 'string' },
          },
          example: {
            cuit: '30712345678',
            address: {
              id: 'f3ee8d8d-2f29-4fcb-b44e-9e9c3c4be071',
              address: 'Av. Siempre Viva 742',
              location: 'Capital Federal',
              district: 'AR-C',
            },
            representative: '9f2a7be2-a7d6-4dbf-8712-58f9122d8ab4',
            contact: '669d79f4-f2ae-4f5c-b7f9-034de12ec7a6',
          },
        },
        CreateEssayRequest: {
          type: 'object',
          required: ['client', 'essay', 'elements'],
          properties: {
            client: { type: 'string' },
            contact: { type: 'string' },
            essay: { type: 'string' },
            observations: { type: 'string' },
            elements: {
              type: 'object',
              required: ['templateId', 'date'],
              properties: {
                templateId: { type: 'string', format: 'uuid', description: 'ID de la plantilla de elemento' },
                id: { type: 'string', format: 'uuid', description: 'Alias de templateId' },
                date: { type: 'string', format: 'date' },
                batch_number: { type: 'string' },
              },
            },
            billing: {
              type: 'object',
              properties: {
                cuit: { type: 'string' },
                address: { type: 'string' },
                amount: { type: 'number' },
                pays_iva: { type: 'boolean' },
              },
            },
          },
          example: {
            client: 'c7cc82f8-e868-4336-a4a4-9ce44f051243',
            contact: '669d79f4-f2ae-4f5c-b7f9-034de12ec7a6',
            essay: 'f8f21cc4-9270-4e4b-a9bc-3089f8f2ccdf',
            observations: 'Ensayo prioritario',
            elements: {
              templateId: 'a8050605-2af6-4984-a7ce-ce8dfa4feca6',
              date: '2026-04-28',
              batch_number: 'L-2026-04',
            },
            billing: {
              cuit: '30712345678',
              address: 'Av. Siempre Viva 742',
              amount: 125000,
              pays_iva: true,
            },
          },
        },
        SetTermsRequest: {
          type: 'object',
          required: ['days_to_do', 'price', 'samples_conservation_days'],
          properties: {
            days_to_do: { type: 'number', minimum: 1 },
            price: { type: 'number', minimum: 0 },
            samples_conservation_days: { type: 'number', minimum: 1 },
          },
          example: {
            days_to_do: 15,
            price: 125000,
            samples_conservation_days: 30,
          },
        },
        GenerateContractRequest: {
          type: 'object',
          required: ['id', 'days_to_do', 'price', 'samples_conservation_days'],
          properties: {
            id: { type: 'string', description: 'ID del ensayo' },
            days_to_do: { type: 'number', minimum: 1 },
            price: { type: 'number', minimum: 0 },
            samples_conservation_days: { type: 'number', minimum: 1 },
          },
          example: {
            id: 'f8f21cc4-9270-4e4b-a9bc-3089f8f2ccdf',
            days_to_do: 15,
            price: 125000,
            samples_conservation_days: 30,
          },
        },
        LoadSamplesRequest: {
          type: 'object',
          required: ['samples'],
          properties: {
            dimensions: {
              type: 'object',
              properties: {
                width: { type: 'number' },
                large: { type: 'number' },
                height: { type: 'number' },
              },
            },
            samples: {
              type: 'array',
              items: {
                type: 'object',
                required: ['correlative'],
                properties: {
                  correlative: { type: 'number' },
                  countersample: { type: 'boolean' },
                  accepted: { type: 'boolean' },
                  internal_conditioning: { type: 'boolean' },
                  observations: { type: 'string' },
                },
              },
            },
          },
          example: {
            dimensions: {
              width: 10,
              large: 20,
              height: 2,
            },
            samples: [
              {
                correlative: 1,
                countersample: false,
                accepted: true,
                internal_conditioning: false,
                observations: 'Muestra sin novedad',
              },
            ],
          },
        },
        LoadSampleResultsRequest: {
          type: 'object',
          properties: {
            samples: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id'],
                properties: {
                  id: { type: 'string' },
                  result: { type: 'number', nullable: true },
                },
              },
            },
          },
          example: {
            samples: [
              {
                id: '0e0a8c0e-f9f1-4eb3-87de-8ecf8fb72740',
                result: 18.5,
              },
            ],
          },
        },
        CreatePersonRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            dni: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            mail: { type: 'string' },
            countryCode: { type: 'string' },
            location: { type: 'string' },
            districtId: { type: 'string' },
            countryId: { type: 'string' },
          },
          example: {
            name: 'Juan Perez',
            dni: '30111222',
            address: 'Calle 123',
            phone: '1144556677',
            mail: 'juan@ctm.com',
            countryCode: '+54',
            location: 'Rosario',
            districtId: 'AR-S',
            countryId: 'AR',
          },
        },
        AddAddressRequest: {
          type: 'object',
          required: ['address', 'location', 'province'],
          properties: {
            address: { type: 'string' },
            location: { type: 'string' },
            province: { type: 'string' },
            district: { type: 'string', nullable: true },
          },
          example: {
            address: 'Av. Siempre Viva 742',
            location: 'Capital Federal',
            province: '02',
            district: null,
          },
        },
        UpdateAddressRequest: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            location: { type: 'string' },
            province: { type: 'string' },
            district: { type: 'string' },
          },
          example: {
            address: 'Av. Siempre Viva 742 Piso 2',
            location: 'Capital Federal',
            province: '02',
            district: 'AR-C',
          },
        },
        CreateManualBusinessRequest: {
          type: 'object',
          required: ['cuit', 'name'],
          properties: {
            cuit: { type: 'string', description: 'CUIT de la empresa' },
            name: { type: 'string', description: 'Nombre de la empresa' },
          },
          example: {
            cuit: '30712345678',
            name: 'MUEBLES DEL SUR SA',
          },
        },
        AddEnvRequest: {
          type: 'object',
          required: ['id', 'label', 'type', 'value'],
          properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            type: { type: 'string' },
            value: { type: 'string' },
          },
          example: {
            id: 'MAX_UPLOAD_SIZE',
            label: 'Tamaño máximo de carga',
            type: 'number',
            value: '10485760',
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación y registro' },
      { name: 'Users', description: 'Gestión de usuarios' },
      { name: 'Clients', description: 'Gestión de clientes' },
      { name: 'Essays', description: 'Gestión de ensayos' },
      { name: 'Business', description: 'Gestión de empresas' },
      { name: 'Persons', description: 'Gestión de personas' },
      { name: 'Env', description: 'Variables de entorno' },
      { name: 'Types', description: 'Tipos y catálogos' },
      { name: 'Samples', description: 'Órdenes de trabajo y muestras' },
    ],
    paths: {
      // ========== AUTH (sin JWT) ==========
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Registrar usuario',
          requestBody: {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } },
            },
          },
          responses: {
            201: { description: 'Usuario creado' },
            500: {
              description: 'Error del servidor',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Error' } },
              },
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Iniciar sesión',
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
                examples: {
                  laboratory: {
                    summary: 'Login laboratorio',
                    value: {
                      mail: 'laboratorio@ctmueble.com.ar',
                      password: 'Secret123!',
                    },
                  },
                  client: {
                    summary: 'Login cliente',
                    value: {
                      mail: 'cliente@empresa.com',
                      password: 'Secret123!',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login correcto, retorna accessToken y refreshToken' },
            401: { description: 'Contraseña incorrecta' },
            404: { description: 'Usuario no encontrado' },
          },
        },
      },
      '/auth/logout': {
        post: {
          tags: ['Auth'],
          summary: 'Cerrar sesión',
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { token: { type: 'string' } } },
                example: { token: 'refresh-or-access-token' },
              },
            },
          },
          responses: { 200: { description: 'Logout correcto' } },
        },
      },
      '/auth/refresh_token': {
        post: {
          tags: ['Auth'],
          summary: 'Refrescar token',
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { token: { type: 'string' } } },
                example: { token: 'refresh-token-value' },
              },
            },
          },
          responses: { 200: { description: 'Token refrescado' } },
        },
      },
      // ========== USERS (JWT) ==========
      '/users/get': {
        get: {
          tags: ['Users'],
          summary: 'Obtener usuario actual',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Datos del usuario' } },
        },
      },
      '/users/get_data': {
        get: {
          tags: ['Users'],
          summary: 'Obtener datos del cliente',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Datos del cliente' } },
        },
      },
      '/users/update_data': {
        put: {
          tags: ['Users'],
          summary: 'Actualizar datos del cliente',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object' },
                example: {
                  name: 'Usuario Actualizado',
                  phone: '1144556677',
                  address: 'Calle 123',
                },
              },
            },
          },
          responses: { 200: { description: 'Datos actualizados' } },
        },
      },
      '/users/switch_profile': {
        put: {
          tags: ['Users'],
          summary: 'Cambiar perfil',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', required: ['profile'], properties: { profile: { type: 'string' } } },
                example: { profile: 'LABORATORY' },
              },
            },
          },
          responses: { 200: { description: 'Perfil cambiado' } },
        },
      },
      '/users/fetch_user_laboratories': {
        get: {
          tags: ['Users'],
          summary: 'Obtener laboratorios del usuario',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de laboratorios' } },
        },
      },
      '/users/switch_laboratory': {
        put: {
          tags: ['Users'],
          summary: 'Cambiar laboratorio',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', required: ['laboratory'], properties: { laboratory: { type: 'string' } } },
                example: { laboratory: 'f2b7b581-7459-41fe-83bc-dbd154722f8d' },
              },
            },
          },
          responses: { 200: { description: 'Laboratorio cambiado' } },
        },
      },
      // ========== CLIENTS (JWT) ==========
      '/clients/fetch': {
        get: {
          tags: ['Clients'],
          summary: 'Listar todos los clientes',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de clientes',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/ClientResponse' } },
                },
              },
            },
            500: { description: 'Error al listar clientes', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/clients/get': {
        get: {
          tags: ['Clients'],
          summary: 'Obtener cliente por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Cliente', content: { 'application/json': { schema: { $ref: '#/components/schemas/ClientResponse' } } } },
            500: { description: 'Error al obtener cliente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/clients/search': {
        get: {
          tags: ['Clients'],
          summary: 'Buscar clientes',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'name', in: 'query', schema: { type: 'string' } },
            { name: 'cuit', in: 'query', schema: { type: 'string' } },
            { name: 'mail', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: {
              description: 'Clientes encontrados',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/ClientResponse' } } } },
            },
            500: { description: 'Error en búsqueda', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/clients/search-by-business': {
        get: {
          tags: ['Clients'],
          summary: 'Buscar clientes por empresa',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
          responses: { 200: { description: 'Empresas encontradas' } },
        },
      },
      '/clients/create': {
        post: {
          tags: ['Clients'],
          summary: 'Crear cliente',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateClientRequest' },
                examples: {
                  withIds: {
                    summary: 'Crear cliente con IDs existentes',
                    value: {
                      cuit: '30712345678',
                      address: 'f3ee8d8d-2f29-4fcb-b44e-9e9c3c4be071',
                      representative: '9f2a7be2-a7d6-4dbf-8712-58f9122d8ab4',
                      contact: '669d79f4-f2ae-4f5c-b7f9-034de12ec7a6',
                    },
                  },
                  withObjects: {
                    summary: 'Crear cliente con datos nuevos',
                    value: {
                      cuit: '30712345678',
                      address: {
                        address: 'Av. Siempre Viva 742',
                        location: 'Capital Federal',
                        district: 'AR-C',
                      },
                      representative: {
                        name: 'Juan Perez',
                        dni: '30111222',
                      },
                      contact: {
                        name: 'Maria Gomez',
                        mail: 'maria@ctm.com',
                        phone: '1144556677',
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Cliente creado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ClientResponse' } } } },
            500: {
              description: 'Error de validación o creación',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  examples: {
                    invalidData: { value: { code: 'BAD_REQUEST', message: 'Datos de cliente inválidos' } },
                    businessMissing: { value: { code: 'NOT_FOUND', message: 'Empresa no encontrada' } },
                  },
                },
              },
            },
          },
        },
      },
      '/clients/get-or-create-for-essay': {
        post: {
          tags: ['Clients'],
          summary: 'Obtener o crear cliente para ensayo',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object' },
                example: {
                  cuit: '30712345678',
                  representative: { name: 'Juan Perez', dni: '30111222' },
                  contact: { name: 'Maria Gomez', mail: 'maria@ctm.com' },
                  address: { address: 'Av. Siempre Viva 742', location: 'Capital Federal', district: 'AR-C' },
                },
              },
            },
          },
          responses: { 200: { description: 'Cliente' } },
        },
      },
      '/clients/update/{id}': {
        put: {
          tags: ['Clients'],
          summary: 'Actualizar cliente',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateClientRequest' } } },
          },
          responses: {
            200: { description: 'Cliente actualizado', content: { 'application/json': { schema: { $ref: '#/components/schemas/ClientResponse' } } } },
            500: { description: 'Error al actualizar cliente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/clients/padron/{cuit}': {
        get: {
          tags: ['Clients'],
          summary: 'Obtener datos del padrón AFIP por CUIT',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'cuit', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Datos del padrón' }, 404: { description: 'Cliente no encontrado' } },
        },
      },
      // ========== ESSAYS (JWT) ==========
      '/essays/get': {
        get: {
          tags: ['Essays'],
          summary: 'Obtener ensayo por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Ensayo' } },
        },
      },
      '/essays/fetch': {
        get: {
          tags: ['Essays'],
          summary: 'Listar todos los ensayos',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de ensayos' } },
        },
      },
      '/essays/create': {
        post: {
          tags: ['Essays'],
          summary: 'Crear ensayo',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEssayRequest' } } },
          },
          responses: { 200: { description: 'Ensayo creado' } },
        },
      },
      '/essays/download-document': {
        get: {
          tags: ['Essays'],
          summary: 'Descargar documento del ensayo',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Archivo PDF' } },
        },
      },
      '/essays/procedure/actions': {
        post: {
          tags: ['Essays'],
          summary: 'Acciones de procedimiento (ACCEPT, REJECT, CREATE_CONTRACT)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['action'],
                  properties: {
                    action: { type: 'string', enum: ['ACCEPT', 'REJECT', 'CREATE_CONTRACT'] },
                  },
                },
              },
            },
          },
          responses: { 200: { description: 'Ensayo actualizado' } },
        },
      },
      '/essays/generate-contract': {
        post: {
          tags: ['Essays'],
          summary: 'Establecer términos y generar contrato',
          description: 'Establece los términos del ensayo (días de realización, precio, días de conservación de muestras) y genera el documento del contrato en una sola operación.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/GenerateContractRequest' } },
            },
          },
          responses: { 200: { description: 'Documento del contrato generado' } },
        },
      },
      '/essays/get-types': {
        get: {
          tags: ['Essays'],
          summary: 'Obtener tipos de ensayo',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tipos de ensayo' } },
        },
      },
      '/samples/fetch': {
        get: {
          tags: ['Samples'],
          summary: 'Listar órdenes de trabajo',
          description: 'Solo accesible por perfil LABORATORY.',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de órdenes de trabajo' } },
        },
      },
      '/samples/get': {
        get: {
          tags: ['Samples'],
          summary: 'Obtener orden de trabajo por ID',
          description: 'Solo accesible por perfil LABORATORY.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' }, description: 'UUID de la orden' }],
          responses: {
            200: { description: 'Orden de trabajo' },
            404: { description: 'Orden no encontrada' },
          },
        },
      },
      '/samples/receive-samples': {
        post: {
          tags: ['Samples'],
          summary: 'Recepción de muestras (unificado)',
          description: 'Si accepted=true: genera orden (código yyyymmdd+letra), registra muestras por cantidad y pasa el ensayo a IN_WORK. Si accepted=false: cancela el ensayo (no se crea orden ni muestras). Solo LABORATORY.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['essayId', 'accepted'],
                  properties: {
                    essayId: { type: 'string', description: 'UUID del ensayo' },
                    accepted: { type: 'boolean', description: 'Si las muestras fueron aceptadas' },
                    dimensions: {
                      type: 'object',
                      properties: { width: { type: 'number' }, height: { type: 'number' }, thickness: { type: 'number' }, large: { type: 'number' } }
                    },
                    internal_conditioning: { type: 'boolean' },
                    observations: { type: 'string' },
                    samples_count: { type: 'integer', minimum: 0, description: 'Cantidad de muestras recibidas' },
                    countersamples_count: { type: 'integer', minimum: 0, description: 'Cantidad de contramuestras recibidas' }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Si accepted: { cancelled: false, workOrder, samples }. Si no aceptadas: { cancelled: true, essay }'
            }
          },
        },
      },
      '/samples/{id}/samples': {
        get: {
          tags: ['Samples'],
          summary: 'Obtener muestras de la orden',
          description: 'Solo LABORATORY.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'UUID de la orden' }],
          responses: { 200: { description: 'Lista de muestras' } },
        },
      },
      '/samples/{id}/close-and-emit-report': {
        post: {
          tags: ['Samples'],
          summary: 'Cerrar orden y emitir informe',
          description: 'Solo LABORATORY.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'UUID de la orden' }],
          responses: { 200: { description: 'Documento del informe' } },
        },
      },
      '/samples/{id}/audit-logs': {
        get: {
          tags: ['Samples'],
          summary: 'Historial de auditoría de la orden',
          description: 'Solo LABORATORY.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'UUID de la orden' }],
          responses: { 200: { description: 'Lista de eventos de auditoría' } },
        },
      },
      '/essays/samples/load': {
        post: {
          tags: ['Essays'],
          summary: 'Cargar muestras',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoadSamplesRequest' } } },
          },
          responses: { 200: { description: 'Muestras cargadas' } },
        },
      },
      '/essays/samples/get': {
        get: {
          tags: ['Essays'],
          summary: 'Obtener muestras del ensayo',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Lista de muestras' } },
        },
      },
      '/essays/samples/load-result': {
        post: {
          tags: ['Essays'],
          summary: 'Cargar resultado de muestras',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoadSampleResultsRequest' } } },
          },
          responses: { 200: { description: 'Resultados cargados' } },
        },
      },
      '/essays/audit-logs': {
        get: {
          tags: ['Essays'],
          summary: 'Obtener logs de auditoría del ensayo',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Logs de auditoría' } },
        },
      },
      '/essays/emit-report': {
        post: {
          tags: ['Essays'],
          summary: 'Emitir reporte del ensayo',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', properties: { id: { type: 'string' } } },
              },
            },
          },
          responses: { 200: { description: 'Reporte emitido' } },
        },
      },
      // ========== BUSINESS (JWT) ==========
      '/bussiness/get/': {
        get: {
          tags: ['Business'],
          summary: 'Obtener empresa por CUIT',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'cuit', in: 'query', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Empresa encontrada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BusinessResponse' },
                  example: {
                    cuit: '30712345678',
                    name: 'MUEBLES DEL SUR SA',
                    source: 'PADRON',
                    addresses: [
                      {
                        id: 'f3ee8d8d-2f29-4fcb-b44e-9e9c3c4be071',
                        address: 'Av. Siempre Viva 742',
                        location: 'Capital Federal',
                        district: { id: 'AR-C', name: 'Ciudad Autónoma de Buenos Aires' },
                        origin: 'PUBLIC',
                      },
                    ],
                  },
                },
              },
            },
            500: {
              description: 'Error al obtener empresa',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Error' } },
              },
            },
          },
        },
      },
      '/bussiness/manual/': {
        post: {
          tags: ['Business'],
          summary: 'Crear empresa manual',
          description: 'Crea una empresa manualmente con CUIT y nombre cuando no existe en padrón o se requiere alta manual.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateManualBusinessRequest' },
                examples: {
                  simple: {
                    summary: 'Alta manual básica',
                    value: {
                      cuit: '30712345678',
                      name: 'MUEBLES DEL SUR SA',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Empresa creada manualmente',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BusinessResponse' },
                  example: {
                    cuit: '30712345678',
                    name: 'MUEBLES DEL SUR SA',
                    source: 'MANUAL',
                    addresses: [],
                  },
                },
              },
            },
            500: {
              description: 'Error de validación o creación',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  examples: {
                    missingFields: { value: { code: 'BAD_REQUEST', message: 'CUIT y nombre son obligatorios para crear una empresa manualmente.' } },
                    alreadyExists: { value: { code: 'CONFLICT', message: 'La empresa ya existe.' } },
                  },
                },
              },
            },
          },
        },
      },
      '/bussiness/sync/': {
        post: {
          tags: ['Business'],
          summary: 'Sincronizar empresa por CUIT',
          description: 'Obtiene datos actualizados del padrón para el CUIT y actualiza la empresa existente.',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'cuit', in: 'query', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Empresa sincronizada',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/BusinessResponse' },
                  example: {
                    cuit: '30712345678',
                    name: 'MUEBLES DEL SUR SA',
                    source: 'PADRON',
                    addresses: [
                      {
                        id: 'f3ee8d8d-2f29-4fcb-b44e-9e9c3c4be071',
                        address: 'Av. Siempre Viva 742',
                        location: 'Capital Federal',
                        district: { id: 'AR-C', name: 'Ciudad Autónoma de Buenos Aires' },
                        origin: 'PUBLIC',
                      },
                    ],
                  },
                },
              },
            },
            500: {
              description: 'Error de sincronización',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  examples: {
                    notFound: { value: { code: 'NOT_FOUND', message: 'Empresa no encontrada' } },
                    padronMissing: { value: { code: 'NOT_FOUND', message: 'No se encontraron datos actualizados para el CUIT.' } },
                    invalidType: { value: { code: 'BAD_REQUEST', message: 'El CUIT no corresponde a una persona jurídica.' } },
                  },
                },
              },
            },
          },
        },
      },
      '/bussiness/padron/': {
        get: {
          tags: ['Business'],
          summary: 'Obtener padrón AFIP por CUIT',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'cuit', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Datos del padrón' } },
        },
      },
      '/bussiness/addresses/': {
        get: {
          tags: ['Business'],
          summary: 'Obtener direcciones de la empresa',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'cuit', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Lista de direcciones' } },
        },
        post: {
          tags: ['Business'],
          summary: 'Agregar dirección',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'cuit', in: 'query', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AddAddressRequest' } } },
          },
          responses: { 200: { description: 'Dirección agregada' } },
        },
        put: {
          tags: ['Business'],
          summary: 'Actualizar dirección',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateAddressRequest' } } },
          },
          responses: { 200: { description: 'Dirección actualizada' } },
        },
        delete: {
          tags: ['Business'],
          summary: 'Eliminar dirección',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Dirección eliminada' } },
        },
      },
      '/bussiness/representatives/': {
        get: {
          tags: ['Business'],
          summary: 'Obtener representantes',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de representantes' } },
        },
        post: {
          tags: ['Business'],
          summary: 'Agregar representante',
          security: [{ bearerAuth: [] }],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Representante agregado' } },
        },
      },
      '/bussiness/representatives/{id}': {
        put: {
          tags: ['Business'],
          summary: 'Actualizar representante',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
          responses: { 200: { description: 'Representante actualizado' } },
        },
        delete: {
          tags: ['Business'],
          summary: 'Eliminar representante',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Representante eliminado' } },
        },
      },
      '/bussiness/for-essay/': {
        get: {
          tags: ['Business'],
          summary: 'Obtener empresa para ensayo',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'cuit', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Empresa' } },
        },
      },
      // ========== PERSONS (JWT) ==========
      '/persons/get/': {
        get: {
          tags: ['Persons'],
          summary: 'Obtener persona por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Persona', content: { 'application/json': { schema: { $ref: '#/components/schemas/PersonResponse' } } } },
            500: { description: 'Error al obtener persona', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/persons/fetch/': {
        get: {
          tags: ['Persons'],
          summary: 'Listar todas las personas',
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: 'Lista de personas',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PersonResponse' } } } },
            },
            500: { description: 'Error al listar personas', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/persons/search-available/': {
        get: {
          tags: ['Persons'],
          summary: 'Buscar personas disponibles',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Personas encontradas',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PersonResponse' } } } },
            },
            500: { description: 'Error en búsqueda', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/persons/by-client/{clientId}': {
        get: {
          tags: ['Persons'],
          summary: 'Obtener personas por cliente',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'clientId', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: {
              description: 'Lista de personas por cliente',
              content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/PersonResponse' } } } },
            },
            500: { description: 'Error al obtener personas del cliente', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/persons/create/': {
        post: {
          tags: ['Persons'],
          summary: 'Crear persona',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreatePersonRequest' },
                examples: {
                  representative: {
                    summary: 'Representante',
                    value: {
                      name: 'Juan Perez',
                      dni: '30111222',
                      mail: 'juan@ctm.com',
                      phone: '1144556677',
                      countryCode: '+54',
                    },
                  },
                  contact: {
                    summary: 'Contacto completo',
                    value: {
                      name: 'Maria Gomez',
                      dni: '28999111',
                      address: 'Calle 456',
                      location: 'Rosario',
                      districtId: 'AR-S',
                      countryId: 'AR',
                      mail: 'maria@ctm.com',
                      phone: '3415566778',
                      countryCode: '+54',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Persona creada', content: { 'application/json': { schema: { $ref: '#/components/schemas/PersonResponse' } } } },
            500: { description: 'Error de validación o creación', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          },
        },
      },
      '/persons/update/': {
        put: {
          tags: ['Persons'],
          summary: 'Actualizar persona',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id', 'data'],
                  properties: {
                    id: { type: 'string' },
                    data: { $ref: '#/components/schemas/CreatePersonRequest' },
                  },
                },
                examples: {
                  basicUpdate: {
                    summary: 'Actualizar mail y telefono',
                    value: {
                      id: '9f2a7be2-a7d6-4dbf-8712-58f9122d8ab4',
                      data: {
                        name: 'Juan Perez',
                        mail: 'juan.actualizado@ctm.com',
                        phone: '1144556600',
                        countryCode: '+54',
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Persona actualizada', content: { 'application/json': { schema: { $ref: '#/components/schemas/PersonResponse' } } } },
            500: {
              description: 'Error de validación o actualización',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' },
                  examples: {
                    missingData: { value: { code: 'BAD_REQUEST', message: 'Datos no válidos' } },
                    missingId: { value: { code: 'BAD_REQUEST', message: 'ID de persona no indicado' } },
                  },
                },
              },
            },
          },
        },
      },
      '/persons/link/': {
        post: {
          tags: ['Persons'],
          summary: 'Vincular persona a cliente',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    personId: { type: 'string' },
                    clientId: { type: 'string' },
                  },
                },
                example: {
                  personId: '9f2a7be2-a7d6-4dbf-8712-58f9122d8ab4',
                  clientId: 'c7cc82f8-e868-4336-a4a4-9ce44f051243',
                },
              },
            },
          },
          responses: { 200: { description: 'Vinculación exitosa' } },
        },
      },
      // ========== ENV (JWT) ==========
      '/env/fetch': {
        get: {
          tags: ['Env'],
          summary: 'Listar variables de entorno',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'mode', in: 'query', schema: { type: 'string' } }],
          responses: { 200: { description: 'Lista de variables' } },
        },
      },
      '/env/get': {
        get: {
          tags: ['Env'],
          summary: 'Obtener variable por ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Variable' } },
        },
      },
      '/env/update': {
        put: {
          tags: ['Env'],
          summary: 'Actualizar variable',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: { type: 'object', required: ['value'], properties: { value: { type: 'string' } } },
                example: { value: '20971520' },
              },
            },
          },
          responses: { 200: { description: 'Variable actualizada' } },
        },
      },
      '/env/add': {
        post: {
          tags: ['Env'],
          summary: 'Agregar variable',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AddEnvRequest' } } },
          },
          responses: { 200: { description: 'Variable agregada' } },
        },
      },
      '/env/delete': {
        delete: {
          tags: ['Env'],
          summary: 'Eliminar variable',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { 200: { description: 'Variable eliminada' } },
        },
      },
      // ========== TYPES (JWT) ==========
      '/types/essays': {
        get: {
          tags: ['Types'],
          summary: 'Obtener tipos de ensayo',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Tipos de ensayo' } },
        },
      },
      '/types/countries': {
        get: {
          tags: ['Types'],
          summary: 'Obtener países',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de países' } },
        },
      },
      '/types/districts': {
        get: {
          tags: ['Types'],
          summary: 'Obtener distritos',
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: 'Lista de distritos' } },
        },
      },
    },
};

module.exports = swaggerSpec;
