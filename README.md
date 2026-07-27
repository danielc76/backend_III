# ShipNow API - Base

API base para el ejercicio de refactorizacion a arquitectura por capas.
En esta etapa se realizó la reorganización de la API aplicando una arquitectura profesional separando responsabilidades entre Routes, Controllers, Services y Repositories.

- Router decide "a quién llamar".
- Controller maneja HTTP.
- Service Reglas de negocio, por ejemplo decide qué está permitido.
- Repository sabe guardar y buscar.
- Model define cómo son los datos.


## Instalacion

```bash
npm install
npm run dev
```

## Endpoints

| Metodo | Ruta                    | Descripcion              |
|--------|-------------------------|--------------------------|
| GET    | /api/users              | Listar usuarios          |
| GET    | /api/users/:uid         | Obtener usuario por ID   |
| POST   | /api/users              | Crear usuario            |
| DELETE | /api/users/:uid         | Eliminar usuario         |
| GET    | /api/products           | Listar productos         |
| GET    | /api/products/:pid      | Obtener producto por ID  |
| POST   | /api/products           | Crear producto           |
| PUT    | /api/products/:pid      | Actualizar producto      |
| DELETE | /api/products/:pid      | Eliminar producto        |
| GET    | /api/orders             | Listar pedidos           |
| GET    | /api/orders/:oid        | Obtener pedido por ID    |
| POST   | /api/orders             | Crear pedido             |
| PATCH  | /api/orders/:oid/status | Actualizar estado pedido |
| DELETE | /api/orders/:oid        | Eliminar pedido          |
| GET    | /api/deliveries         | Listar entregas          |
| GET    | /api/deliveries/:did    | Obtener entrega por ID   |
| POST   | /api/deliveries         | Crear entrega            |
| PATCH  | /api/deliveries/:did/status | Actualizar estado entrega |
| DELETE | /api/deliveries/:did    | Eliminar entrega         |


## Mocking

La API incorpora un módulo de generación de datos simulados utilizando Faker.

Endpoints disponibles:

GET /api/mocks/users
Genera usuarios ficticios sin persistirlos.

GET /api/mocks/orders
Genera pedidos ficticios respetando relaciones con usuarios.

GET /api/mocks/deliveries
Genera entregas ficticias relacionadas con pedidos y repartidores.

POST /api/mocks/generate
Genera usuarios, repartidores, pedidos y entregas de prueba y los almacena en MongoDB.


============================================================
ARQUITECTURA POR CAPAS - SHIPNOW API
============================================================

La aplicación está organizada en capas para separar responsabilidades
y evitar que una parte del sistema conozca detalles innecesarios de otra.

Flujo general:

Router
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Model
   ↓
MongoDB


------------------------------------------------------------
ROUTER
------------------------------------------------------------

Responsabilidad:
Define las rutas disponibles de la API y conecta cada endpoint
con el método correspondiente del Controller.

No contiene lógica de negocio ni acceso a datos.

Ejemplo:
POST /api/users → usersController.createUser


------------------------------------------------------------
CONTROLLER
------------------------------------------------------------

Responsabilidad:
Es la puerta de entrada HTTP. Ni el Router ni el Service debería saber manejar HTTP.

Se encarga de:
- Recibir req y res.
- Obtener parámetros del request.
- Llamar al Service correspondiente.
- Devolver la respuesta HTTP al cliente.

------------------------------------------------------------
SERVICE
------------------------------------------------------------

Responsabilidad:
Contiene la lógica de negocio de la aplicación.

Se encarga de:
- Validaciones de negocio.
- Aplicar reglas del sistema.
- Coordinar operaciones entre entidades.
- Llamar a los Repository necesarios.

Ejemplo:
Antes de crear una orden puede validar que el usuario exista
o que los datos sean correctos.

No debe manejar directamente HTTP ni consultas MongoDB.


------------------------------------------------------------
REPOSITORY
------------------------------------------------------------

Responsabilidad:
Es la única capa que conoce MongoDB y Mongoose.

Se encarga de:
- Buscar datos.
- Crear registros.
- Actualizar registros.
- Eliminar registros.

Su objetivo es encapsular el acceso a datos para que el resto
de la aplicación no dependa de la implementación de la base.


------------------------------------------------------------
MODEL
------------------------------------------------------------

Responsabilidad:
Define la estructura de los documentos en MongoDB.

Contiene:
- Campos.
- Tipos de datos.
- Validaciones del esquema.
- Relaciones mediante referencias.

No contiene lógica de negocio.


------------------------------------------------------------
EJEMPLO DE FLUJO

Cuando llega:

POST /api/users

1) Router recibe la petición y llama al Controller.

2) Controller obtiene los datos enviados y llama al Service.

3) Service aplica reglas de negocio y llama al Repository.

4) Repository utiliza el Model para guardar en MongoDB.

5) MongoDB devuelve el resultado.

6) La respuesta vuelve por las capas hasta llegar al cliente.


============================================================
OBJETIVO DE ESTA SEPARACIÓN

Cada capa tiene una única responsabilidad.
Esto permite:
- Código más fácil de mantener.
- Mejor organización.
- Menor acoplamiento.
- Poder cambiar la base de datos sin modificar la lógica
  de negocio.
============================================================
