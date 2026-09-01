# ShipNow API

ShipNow es una **API REST para la gestión de pedidos y entregas**, desarrollada con **Node.js, Express y MongoDB mediante Mongoose**. El sistema permite gestionar usuarios, pedidos y entregas, incluyendo la asignación de repartidores, el seguimiento de los estados y la carga de documentos y comprobantes con Multer.

El proyecto fue reorganizado aplicando una **arquitectura por capas**, separando responsabilidades entre **Routes, Controllers, Services, Repositories y Models**.

## Resumen para entender el proyecto

El flujo general de la aplicación es:

**Cliente / Postman → Router → Controller → Service → Repository → Model → MongoDB**

Para recordarlo fácilmente:

* **Router** → decide a quién llamar.
* **Controller** → maneja HTTP.
* **Service** → decide qué está permitido hacer y aplica las reglas de negocio.
* **Repository** → sabe buscar, guardar, actualizar y eliminar datos.
* **Model** → define cómo se estructuran los datos en MongoDB.

La idea importante es que **la arquitectura por capas no consiste solamente en separar archivos en carpetas, sino en separar responsabilidades**:

* Controller ≠ lógica de negocio.
* Service ≠ MongoDB.
* Repository ≠ reglas de negocio.
* Model ≠ lógica de la aplicación.
* Router ≠ procesamiento de la petición.

Esta separación permite mantener el código más ordenado, reducir el acoplamiento y facilitar el mantenimiento.

Además, se centralizaron las **constantes del dominio y los códigos de error**, y se incorporó generación de **datos de prueba mediante Faker**.

---

# Instalación

```bash
npm install
npm run dev
```

El proyecto utiliza variables de entorno para la configuración. El archivo `.env` no debe subirse al repositorio.

Una vez iniciado el servidor:

* API: `http://localhost:8080`
* Swagger UI: `http://localhost:8080/api/docs`

---

# Documentación de la API con Swagger

ShipNow utiliza **Swagger / OpenAPI** para documentar y probar de forma interactiva los endpoints de la API.

Con el servidor en ejecución, la documentación está disponible en:

http://localhost:8080/api/docs

Desde Swagger UI se pueden consultar las rutas disponibles, visualizar los parámetros y cuerpos esperados, revisar las posibles respuestas y ejecutar peticiones directamente contra la API mediante **Try it out**.

## Módulos documentados

La documentación está organizada por los principales módulos de ShipNow:

* **Users** → gestión de usuarios.
* **Orders** → gestión de pedidos.
* **Deliveries** → gestión de entregas.
* **Mocks** → generación de datos simulados y carga de datos de prueba.
* **Logger** → endpoint interno para validar los niveles del sistema de logging.

## Schemas reutilizables

La documentación utiliza schemas de OpenAPI para representar las principales estructuras utilizadas por la API:

* `User`
* `Order`
* `OrderItem`
* `Delivery`
* `FileMetadata`
* `ErrorResponse`
* `SuccessResponse`

Estos schemas permiten reutilizar las mismas definiciones en diferentes endpoints y mantener la documentación consistente.

## Respuestas de error

Swagger también documenta las respuestas de error manejadas por la API, entre ellas:

* Datos obligatorios faltantes.
* Usuario, pedido o entrega inexistente.
* Operaciones no permitidas.
* Estados de pedidos o entregas inválidos.
* Archivos faltantes, no permitidos o demasiado grandes.
* Campos y tipos de documento inválidos.
* Cantidades inválidas para la generación de mocks.
* Errores internos del servidor.

Las respuestas utilizan el manejo centralizado de errores implementado en ShipNow.

Ejemplo:

{
  "status": "error",
  "error": "USER_NOT_FOUND",
  "message": "Usuario no encontrado"
}

## Cómo probar la API desde Swagger

1. Ejecutar el proyecto con `npm run dev`.
2. Abrir `http://localhost:8080/api/docs`.
3. Seleccionar uno de los endpoints.
4. Presionar **Try it out**.
5. Completar los parámetros o el body cuando corresponda.
6. Presionar **Execute**.
7. Revisar el código HTTP y la respuesta obtenida.

Los endpoints de creación, modificación y eliminación realizan operaciones reales sobre la base de datos configurada para el proyecto.

El endpoint del módulo **Logger** se utiliza únicamente como herramienta de validación del sistema de logging y no representa una funcionalidad de negocio.

---

# Arquitectura por capas

## Router

Define las rutas disponibles y conecta cada endpoint con el Controller correspondiente.

No contiene lógica de negocio ni acceso a MongoDB.

Por ejemplo:

`POST /api/users` → `usersController.createUser`

En otras palabras:

> El Router responde: "¿a quién llamo cuando llega esta petición?"

---

## Controller

Es la **puerta de entrada HTTP**.

Se encarga de:

* Recibir `req`, `res` y `next`.
* Obtener parámetros de la URL.
* Obtener datos del `body`.
* Llamar al Service.
* Devolver la respuesta HTTP.
* Pasar errores al middleware global mediante `next(error)`.

Por ejemplo:

`POST /api/users` → Controller recibe `req.body` → `usersService.createUser(req.body)`

El Controller sabe de HTTP, pero **no debería saber cómo funciona MongoDB**.

---

## Service

Contiene la **lógica de negocio**.

Es la capa que decide qué está permitido y qué no.

Se encarga de:

* Validaciones.
* Reglas del sistema.
* Coordinar operaciones entre entidades.
* Llamar a uno o varios Repository.
* Generar errores de dominio.

Por ejemplo, para crear una entrega:

1. ¿Existe el pedido?
2. ¿Existe el usuario?
3. ¿Tiene rol `DRIVER`?
4. ¿El pedido está en `CREATED`?
5. Crear Delivery.
6. Actualizar Order.

Todo esto corresponde al **Service**.

El Service no debería manejar directamente HTTP ni consultar MongoDB.

---

## Repository

Es la capa encargada del **acceso a los datos**.

Es la que conoce directamente:

* Mongoose.
* Los Models.
* MongoDB.

Se encarga de:

* Buscar.
* Crear.
* Actualizar.
* Eliminar.

Por ejemplo:

```js
Delivery.findById(id)
```

pertenece al Repository.

El Service simplemente puede pedir:

```js
deliveriesRepository.getDeliveryById(id)
```

Una forma sencilla de recordarlo:

> **El Service decide qué hacer; el Repository sabe cómo acceder a los datos para hacerlo.**

---

## Model

Define la estructura de los documentos almacenados en MongoDB.

Contiene:

* Campos.
* Tipos de datos.
* Validaciones del esquema.
* Referencias entre documentos.

Por ejemplo, una Delivery tiene referencias a:

* `order`
* `driver`

El Model define cómo se representa esa información en MongoDB.

No debería contener reglas de negocio.

---

# Ejemplo de flujo completo

Si llega:

`POST /api/deliveries`

con:

```json
{
  "order": "ID_DEL_PEDIDO",
  "driver": "ID_DEL_DRIVER",
  "priority": "normal"
}
```

el recorrido es:

1. **Router**
   Identifica la ruta y llama al Controller.

2. **Controller**
   Obtiene `req.body` y llama al Service.

3. **Service**
   Verifica las reglas de negocio.

4. **Repository**
   Realiza las operaciones con Mongoose.

5. **Model**
   Define la estructura del documento.

6. **MongoDB**
   Guarda la información.

7. **Respuesta**
   MongoDB → Model → Repository → Service → Controller → Cliente.

---

# Manejo de errores

El proyecto utiliza `customError` y códigos de error centralizados.

Por ejemplo:

```js
throw new customError(ERROR_CODES.USER_NOT_FOUND);
```

`ERROR_CODES` indica **qué ocurrió**:

`USER_NOT_FOUND`

Mientras que `ERROR_DICTIONARY` indica cómo debe responder la API:

* Status HTTP: `404`
* Mensaje: `"Usuario no encontrado"`

Por lo tanto:

**ERROR_CODES → ¿Qué error ocurrió?**

**ERROR_DICTIONARY → ¿Qué status HTTP y mensaje corresponden?**

Esto evita repetir códigos y mensajes en diferentes partes del proyecto.

---

# Logging y monitoreo básico

El proyecto utiliza **Winston** como sistema de logging centralizado.

Los logs permiten mantener una **historia técnica de lo que hizo la aplicación**, registrando eventos importantes como el inicio del servidor, la conexión con MongoDB, las peticiones HTTP, la generación de datos de prueba, la creación de pedidos y los errores.

La idea no es registrar absolutamente todo, sino aquellos eventos que permitan entender qué ocurrió antes, durante y después de un problema.

## Niveles de log

ShipNow utiliza los siguientes niveles:

* `debug` → información detallada útil principalmente durante el desarrollo.
* `http` → registra las peticiones HTTP recibidas, incluyendo método, ruta, código de respuesta y tiempo de ejecución.
* `info` → registra operaciones normales e importantes de la aplicación.
* `warn` → registra situaciones que requieren atención, como validaciones de negocio o cantidad inválida de mocks.
* `error` → registra errores inesperados de la aplicación.
* `fatal` → registra fallas críticas, como problemas graves durante la conexión inicial con MongoDB.

En desarrollo se permiten logs desde `debug`.

En producción el nivel se restringe a partir de `info`, reduciendo la cantidad de información registrada.

## Request Logger

Se incorporó un middleware de logging de peticiones HTTP.

Por cada request se registra:

* Método HTTP.
* URL solicitada.
* Código de respuesta.
* Tiempo de ejecución.

Por ejemplo:

```text
2026-08-11T02:02:40.497Z [http] GET /api/users 200 73ms
```

Esto permite conocer qué peticiones recibió la API y cómo fueron procesadas.

## Integración con el manejo de errores

El logger está integrado con el middleware global de errores.

Los errores conocidos del dominio se registran como `warn`, mientras que los errores inesperados se registran como `error`.

Por ejemplo:

```text
[warn] POST /api/users - VALIDATION_ERROR: Faltan datos obligatorios
```

La respuesta enviada al cliente continúa utilizando el sistema centralizado de `ERROR_CODES` y `ERROR_DICTIONARY`.

De esta manera, el logging **no reemplaza el manejo de errores**, sino que lo complementa.

## Eventos importantes registrados

Actualmente se registran eventos relevantes como:

* Inicio del servidor.
* Conexión exitosa con MongoDB.
* Error durante la conexión con MongoDB.
* Peticiones HTTP.
* Generación de datos mock.
* Cantidad inválida para generación de mocks.
* Finalización de generación de datos mock.
* Creación de pedidos.
* Actualización del estado de pedidos.
* Errores de negocio.
* Errores inesperados.
* Peticiones sospechosas desde una misma IP.

Esto permite reconstruir qué ocurrió en la aplicación cuando se presenta un problema.

## Persistencia y rotación de logs

Además de mostrarse por consola, los errores importantes se persisten en archivos dentro de:

```text
logs/
```

Los archivos son generados mediante `winston-daily-rotate-file`.

La configuración actual permite:

* Rotar los archivos por fecha.
* Limitar el tamaño máximo de cada archivo.
* Mantener los registros durante un período determinado.
* Evitar que los archivos de logs crezcan indefinidamente.

Los archivos generados por la aplicación no forman parte del repositorio.

La carpeta `logs/` está incluida en `.gitignore`:

```gitignore
logs/
```

## Endpoint de prueba del logger

Se incorporó un endpoint interno para verificar rápidamente que los diferentes niveles de logging funcionan correctamente.

### Endpoint

```text
GET /api/logger
```

Al ejecutarlo genera registros de prueba para:

```text
debug
http
info
warn
error
fatal
```

Por ejemplo:

```text
[debug] Prueba de nivel DEBUG
[http] Prueba de nivel HTTP
[info] Prueba de nivel INFO
[warn] Prueba de nivel WARN
[error] Prueba de nivel ERROR
[fatal] Prueba de nivel FATAL
```

Los niveles pueden observarse en la consola y los niveles persistidos correspondientes pueden verificarse en la carpeta `logs/`.

Este endpoint existe únicamente como herramienta interna para comprobar la configuración del sistema de logging y no representa una funcionalidad del negocio.

## Rate Limit y monitoreo básico

También se incorporó un middleware de control básico de peticiones.

El middleware mantiene un contador temporal por dirección IP y registra una advertencia cuando detecta una cantidad elevada de solicitudes dentro de un período determinado.

Por ejemplo:

```text
[warn] Peticiones sospechosas desde la ip ::1
```

El objetivo de esta implementación es aportar una primera señal de monitoreo ante comportamientos potencialmente anómalos.

# Constantes del dominio

También se utilizan constantes para evitar repetir strings directamente en el código.

Por ejemplo:

```js
USER_ROLES.DRIVER
ORDER_STATUS.CREATED
ORDER_STATUS.DELIVERED
DELIVERY_STATUS.ASSIGNED
DELIVERY_PRIORITY.NORMAL
```

En lugar de escribir:

```js
'driver'
'created'
'delivered'
'assigned'
'normal'
```

Esto reduce errores de tipeo y hace que las reglas de negocio sean más claras.

---

# Entidades principales

El proyecto trabaja principalmente con:

**User**

* Customer
* Driver

**Order**

* Pertenece a un Customer.

**Delivery**

* Corresponde a un Order.
* Es realizada por un Driver.

Conceptualmente:

**Customer → Order → Delivery → Driver**

---

# Users

Los usuarios pueden tener diferentes roles:

* `CUSTOMER`
* `DRIVER`
* `ADMIN`
* `USER`
* `STORE`

Al crear un usuario:

* Se validan los datos obligatorios.
* Se verifica que el email no esté registrado.
* Si no se indica rol, se utiliza `CUSTOMER`.
* No se permite crear un usuario con rol `ADMIN`.
* Para eliminar un usuario, debe existir.

---

# Orders

Un Order representa un pedido.

Contiene información como:

* `customer`
* `items`
* `deliveryAddress`
* `total`
* `status`
* `priority`
* `delivery`

Al crear un pedido se valida, entre otras cosas:

* Que exista el Customer.
* Que haya items.
* Que exista una dirección.
* Que el usuario pueda realizar pedidos.
* El total se calcula a partir de los items.

También se calcula un costo de envío simulado.

## Estados

Los estados se centralizan mediante `ORDER_STATUS`:

* `CREATED`
* `ASSIGNED`
* `PICKED_UP`
* `IN_TRANSIT`
* `DELIVERED`
* `CANCELLED`

Un pedido que ya está en `DELIVERED` no puede volver a modificarse.

---

# Deliveries

Una Delivery representa la entrega de un Order.

Contiene:

* `order`
* `driver`
* `status`
* `priority`
* `assignedAt`
* `deliveredAt`

Para crear una Delivery se valida:

1. ¿Existe el Order?
2. ¿Existe el Driver?
3. ¿Tiene rol `DRIVER`?
4. ¿El Order está en `CREATED`?
5. Crear Delivery.

Al crearla:

* `Delivery.status = ASSIGNED`
* `Order.status = ASSIGNED`
* `Order.delivery = Delivery._id`

Cuando pasa a `DELIVERED`:

* `Delivery.deliveredAt = fecha actual`
* `Order.status = DELIVERED`

Esto muestra por qué esta lógica pertenece al Service: una acción sobre Delivery puede implicar actualizar también un Order.

---

# Endpoints

## Users

| Método | Ruta                        | Descripción                 |
| ------ | --------------------------- | --------------------------- |
| GET    | `/api/users`                | Listar usuarios             |
| GET    | `/api/users/:uid`           | Obtener usuario             |
| POST   | `/api/users`                | Crear usuario               |
| POST   | `/api/users/:uid/documents` | Cargar documento de usuario |
| DELETE | `/api/users/:uid`           | Eliminar usuario            |

## Orders

| Método | Ruta                      | Descripción       |
| ------ | ------------------------- | ----------------- |
| GET    | `/api/orders`             | Listar pedidos    |
| GET    | `/api/orders/:oid`        | Obtener pedido    |
| POST   | `/api/orders`             | Crear pedido      |
| PATCH  | `/api/orders/:oid/status` | Actualizar estado |
| DELETE | `/api/orders/:oid`        | Eliminar pedido   |

## Deliveries

| Método | Ruta                          | Descripción                   |
| ------ | ----------------------------- | ----------------------------- |
| GET    | `/api/deliveries`             | Listar entregas               |
| GET    | `/api/deliveries/:did`        | Obtener entrega               |
| POST   | `/api/deliveries`             | Crear entrega                 |
| POST   | `/api/deliveries/:did/proof`  | Cargar comprobante de entrega |
| PATCH  | `/api/deliveries/:did/status` | Actualizar estado             |
| DELETE | `/api/deliveries/:did`        | Eliminar entrega              |

---

# Carga de archivos

Multer se configura de forma centralizada en `src/config/multer.config.js`. Los routers solamente indican qué configuración y qué nombre de campo utiliza cada endpoint.

La API acepta archivos PDF, JPG y PNG de hasta 5 MB. Los nombres se generan en el servidor para evitar colisiones y los archivos se organizan en:

```text
uploads/
├── users/documents/
└── deliveries/proofs/
```

La carpeta completa está incluida en `.gitignore`, por lo que los archivos cargados no se envían al repositorio.

## Documentos de usuario

`POST /api/users/:uid/documents`

El cuerpo debe utilizar `multipart/form-data` con:

* `document` → archivo requerido;
* `documentType` → `user_document` o `driver_license`.

## Comprobantes de entrega

`POST /api/deliveries/:did/proof`

El archivo debe enviarse en el campo `proof`.

MongoDB no guarda el contenido del archivo. Solamente registra el nombre original, nombre generado, ruta, tipo MIME, tamaño, tipo de documento y fecha de carga. Si el archivo no puede asociarse a su entidad, se elimina del servidor para evitar que quede aislado.

---

# Mocking

La API utiliza **Faker** para generar datos simulados.

## Generación sin persistencia

* `GET /api/mocks/users`
* `GET /api/mocks/orders`
* `GET /api/mocks/deliveries`

Estos endpoints generan datos ficticios para probar la aplicación.

## Generación y persistencia

`POST /api/mocks/generate`

Genera y almacena datos de prueba relacionados:

**Users → Customers / Drivers → Orders → Deliveries**

Para cargas masivas se utilizan operaciones como:

```js
insertMany()
```

---

# Testing funcional automatizado

ShipNow incluye una suite de tests funcionales desarrollada con:

* **Mocha** → organiza y ejecuta los casos de prueba.
* **Chai** → comprueba estados HTTP, estructuras y valores.
* **Supertest** → realiza peticiones sobre la aplicación Express sin iniciar un servidor ni abrir un puerto.

Los tests importan directamente `app` desde `src/app.js`. La conexión con MongoDB y el inicio del servidor permanecen separados en `src/server.js`.

## Entorno de testing

La suite utiliza un entorno separado del desarrollo:

```text
NODE_ENV=test
PORT=8081
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA@CLUSTER/shipnow_test
```

El archivo `.env.test` contiene la configuración real y no debe subirse al repositorio.

El archivo `.env.test.example` documenta las variables necesarias sin incluir credenciales.

La base debe llamarse obligatoriamente `shipnow_test`. Antes de conectarse, `tests/setup.js` verifica el entorno y el nombre de la base para evitar que la limpieza se ejecute sobre datos de desarrollo.

## Preparación

1. Instalar las dependencias:

```bash
npm install
```

2. Crear `.env.test` a partir del archivo de ejemplo.

3. Completar `MONGODB_URI` con una conexión de Atlas que apunte a `shipnow_test`.

## Ejecución

Para ejecutar la suite completa:

```bash
npm test
```

No es necesario ejecutar `npm run dev` ni iniciar el servidor manualmente.

## Organización

```text
tests/
├── setup.js
├── deliveries.test.js
├── logger.test.js
├── mocks.test.js
├── notFound.test.js
├── orders.test.js
├── swagger.test.js
├── uploads.test.js
└── users.test.js
```

`tests/setup.js` se encarga de:

* cargar `.env.test`;
* validar el entorno y la base;
* conectar Mongoose;
* limpiar Users, Orders y Deliveries antes de cada test;
* eliminar los archivos creados dentro de `uploads/test`;
* limpiar los datos y desconectar MongoDB al finalizar.

## Módulos cubiertos

La suite incluye 42 tests funcionales para:

* Users.
* Orders.
* Deliveries.
* Mocks.
* Logger.
* Swagger.
* Uploads.
* Rutas inexistentes.

Se comprueban casos exitosos y errores esperados, incluyendo:

* listados;
* creación, consulta y eliminación de usuarios;
* carga y asociación de documentos y comprobantes;
* persistencia de metadatos y existencia del archivo físico;
* archivo faltante, formato, tamaño y campo inválidos;
* tipo de documento y entidad asociada inválidos;
* creación y consulta de pedidos;
* cálculos de total y costo de envío;
* actualización de estados;
* sincronización entre pedidos y entregas;
* generación de datos mock en memoria;
* persistencia controlada de mocks;
* datos obligatorios faltantes;
* recursos inexistentes;
* roles no permitidos;
* estados y cantidades inválidas;
* formato uniforme de los errores.

Cada test valida el status HTTP, la estructura del body y los valores importantes de la respuesta.

## Datos controlados y limpieza

Los tests crean sus propios usuarios, pedidos, entregas y archivos. No dependen de información cargada manualmente ni del orden de ejecución.

Antes de cada caso se eliminan los datos y los archivos de testing generados por el caso anterior. Al finalizar la suite se realiza una última limpieza y se cierra la conexión con MongoDB.

---

# Pruebas manuales realizadas

Se realizaron pruebas manuales utilizando **Postman**, verificando tanto casos exitosos como errores.

## Users

Se comprobó:

* Listado.
* Obtener usuario existente e inexistente.
* Crear usuario.
* Email duplicado.
* Datos obligatorios faltantes.
* Intentar crear `ADMIN`.
* Eliminar usuario.
* Eliminar usuario inexistente.

## Orders

Se comprobó:

* Listado.
* Creación.
* Validaciones.
* Customer inexistente.
* Driver intentando crear un pedido.
* Cálculo del total.
* Costo de envío.
* Cambios de estado.
* Estado inválido.
* Pedido `DELIVERED` que no puede volver a modificarse.
* Eliminación.
* Pedido inexistente.

## Deliveries

Se comprobó:

* Listado.
* Obtener entrega.
* Entrega inexistente.
* Creación.
* Pedido inexistente.
* Driver inexistente.
* Usuario que no es `DRIVER`.
* Pedido no disponible para asignación.
* Cambio a `IN_TRANSIT`.
* Cambio a `DELIVERED`.
* Generación de `deliveredAt`.
* Actualización del Order relacionado.
* Asociación Order → Delivery.
* Estado inválido.
* Delivery ya entregada que no puede modificarse.
* Eliminación.
* Verificación posterior de la eliminación.

Estas comprobaciones manuales se complementan con la suite de tests funcionales automatizados incluida en el proyecto.

---

# Limpieza del proyecto

Durante la revisión se eliminaron archivos y lógica que habían quedado sin uso.

El objetivo es mantener el proyecto limpio y evitar código muerto o componentes que puedan generar confusión.

---

# Objetivo de la arquitectura

La arquitectura por capas busca:

* Separar responsabilidades.
* Facilitar el mantenimiento.
* Reducir el acoplamiento.
* Facilitar las pruebas.
* Hacer más claro dónde debe implementarse cada comportamiento.
* Permitir cambiar detalles de infraestructura sin modificar toda la lógica de negocio.

La idea fundamental para estudiar es:

**ROUTER**
"¿A quién llamo?"

↓

**CONTROLLER**
"Estoy atendiendo una petición HTTP."

↓

**SERVICE**
"¿Qué está permitido hacer?"

↓

**REPOSITORY**
"¿Cómo busco o guardo los datos?"

↓

**MODEL**
"¿Cómo está estructurado el documento?"

↓

**MONGODB**
"¿Dónde se almacenan los datos?"

---
