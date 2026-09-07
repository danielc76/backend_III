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

1. Instalar las dependencias del proyecto:

```bash
npm install
```

2. Crear el archivo local de configuración a partir del ejemplo. En PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Completar `MONGODB_URI` en `.env` y ejecutar la API:

```bash
npm run dev
```

El proyecto utiliza variables de entorno para separar la configuración del código. El archivo `.env` contiene la configuración real de cada equipo y no debe subirse al repositorio.

## Variables de entorno

| Variable      | Uso                                                        | Ejemplo       |
| ------------- | ---------------------------------------------------------- | ------------- |
| `PORT`        | Puerto interno en el que escucha la API                    | `8080`        |
| `MONGODB_URI` | Conexión a la base de datos                                | Ver `.env.example` |
| `NODE_ENV`    | Entorno: `development`, `test` o `production`              | `development` |
| `LOG_LEVEL`   | Nivel mínimo: `debug`, `http`, `info`, `warn`, `error` o `fatal` | `debug` |

Al iniciar, la aplicación valida `PORT`, `MONGODB_URI` y `NODE_ENV`. Si falta una variable crítica o tiene un valor inválido, el proceso finaliza con un mensaje claro en lugar de arrancar con una configuración incompleta.

Los archivos de ejemplo disponibles son:

* `.env.example` → desarrollo local;
* `.env.test.example` → testing;
* `.env.docker.example` → ejecución con Docker Compose.

El proyecto no utiliza autenticación JWT ni servicios externos reales. Por eso no necesita un secreto JWT ni una URL externa; el envío de email actual es una simulación interna.

Una vez iniciado el servidor:

* API: `http://localhost:8080`
* Health check: `http://localhost:8080/health`
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
* **Health** → estado básico de la API.
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

Los endpoints de **Mocks** y **Logger** son herramientas internas. Se encuentran disponibles en desarrollo y testing, pero no se montan cuando `NODE_ENV=production`, por lo que responden `404` en ese entorno. Swagger permanece disponible en producción para poder revisar y probar la API durante esta entrega.

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

El nivel mínimo se configura mediante `LOG_LEVEL`. Si no se indica, se utiliza `debug` en desarrollo y testing, e `info` en producción. De esta manera se puede reducir la cantidad de registros sin modificar el código.

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

## Persistencia de logs

Los registros se guardan en archivos dentro de:

```text
logs/
```

La actividad general se guarda en `logs/combined.log` y los niveles `error` y `fatal` también se guardan en `logs/error.log`.

La configuración actual permite:

* Limitar el tamaño máximo de cada archivo.
* Conservar una cantidad controlada de archivos anteriores.
* Evitar que los archivos de logs crezcan indefinidamente.

La salida por consola se habilita solamente en desarrollo. En testing y producción los registros se escriben en los archivos correspondientes de acuerdo con `LOG_LEVEL`.

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

En desarrollo los niveles pueden observarse en la consola. Los registros persistidos pueden verificarse en `logs/combined.log` y los errores en `logs/error.log`.

Este endpoint existe únicamente como herramienta interna para comprobar la configuración del sistema de logging y no representa una funcionalidad del negocio.

## Rate Limit y monitoreo básico

También se incorporó un middleware de control de peticiones. Cada dirección IP puede realizar hasta 60 solicitudes por minuto. Al superar ese límite, la API bloquea temporalmente los nuevos intentos con una respuesta `429 Too Many Requests` e informa en el header `Retry-After` cuántos segundos faltan para volver a intentar.

El primer bloqueo se registra como advertencia. Los intentos posteriores reciben la misma respuesta sin generar una advertencia nueva en cada petición, para evitar llenar los logs.

El contador se mantiene en memoria y se reinicia automáticamente al finalizar la ventana. Esta implementación es adecuada para la instancia actual; si la API se distribuyera entre varios contenedores, el contador debería compartirse mediante un servicio externo.

---

# Health check

`GET /health` permite comprobar si el proceso de la API está activo. Docker lo consulta automáticamente para determinar el estado del contenedor.

Respuesta esperada:

```json
{
  "status": "OK",
  "environment": "production",
  "uptime": 2160.9,
  "timestamp": "2026-09-05T22:25:41.164Z"
}
```

El endpoint devuelve un código `200` e información operativa básica, pero no expone credenciales, conexiones ni otros datos sensibles. También queda fuera del request logger para que los controles periódicos de Docker no llenen los logs.

---

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

# Controles de performance

Los listados de Users, Orders y Deliveries no devuelven la colección completa sin control. Todos aceptan `limit`, utilizan un valor predeterminado de 20 y permiten como máximo 100 resultados.

También se pueden reducir las consultas mediante filtros:

```text
GET /api/users?limit=10&role=driver
GET /api/orders?limit=20&status=created
GET /api/deliveries?limit=20&status=assigned
```

Las consultas se ordenan desde los registros más recientes y utilizan `lean()` cuando solamente necesitan devolver datos. El listado de usuarios tampoco incluye contraseñas. Esto evita transferir información innecesaria y reduce el trabajo de Mongoose.

La carga de archivos acepta únicamente PDF, JPG y PNG, limita cada archivo a 5 MB y controla los errores antes de asociar sus metadatos. Los uploads quedan fuera de Git y, al usar Docker Compose, se conservan en un volumen separado del contenedor.

Los mensajes de detalle, como el email simulado, utilizan el nivel `debug`; el rate limit evita repetir continuamente la misma advertencia. El flujo de las peticiones no contiene tareas síncronas pesadas que bloqueen el Event Loop.

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

Mocha está declarado en `devDependencies` y se instala localmente mediante `npm install`. El script utiliza `npx --no-install`, por lo que resuelve la versión local de Mocha sin depender del `PATH`, sin instalarlo globalmente y sin descargar otra versión. De esta manera, `npm test` funciona de la misma forma en PowerShell, Git Bash y Linux.

No es necesario ejecutar `npm run dev` ni iniciar el servidor manualmente.

## Organización

```text
tests/
├── setup.js
├── deliveries.test.js
├── health.test.js
├── logger.test.js
├── mocks.test.js
├── notFound.test.js
├── orders.test.js
├── rateLimit.test.js
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

La suite incluye 55 tests funcionales para:

* Users.
* Orders.
* Deliveries.
* Health check.
* Mocks.
* Logger.
* Rate limit.
* Swagger.
* Uploads.
* Rutas inexistentes.

Se comprueban casos exitosos y errores esperados, incluyendo:

* listados;
* límites y filtros en los listados principales;
* estado, entorno, uptime y timestamp del health check;
* creación, consulta y eliminación de usuarios;
* carga y asociación de documentos y comprobantes;
* persistencia de metadatos y existencia del archivo físico;
* archivo faltante, formato, tamaño y campo inválidos;
* tipo de documento y entidad asociada inválidos;
* creación, consulta y eliminación de pedidos y entregas;
* cálculos de total y costo de envío;
* actualización de estados;
* sincronización entre pedidos y entregas;
* generación de datos mock en memoria;
* persistencia controlada de mocks;
* datos obligatorios faltantes;
* datos e identificadores inválidos;
* recursos inexistentes;
* roles no permitidos;
* estados y cantidades inválidas;
* bloqueo temporal, respuesta `429` y header `Retry-After`;
* formato uniforme de los errores.

Cada test valida el status HTTP, la estructura del body y los valores importantes de la respuesta.

## Datos controlados y limpieza

Los tests crean sus propios usuarios, pedidos, entregas y archivos. No dependen de información cargada manualmente ni del orden de ejecución.

Antes de cada caso se eliminan los datos y los archivos de testing generados por el caso anterior. Al finalizar la suite se realiza una última limpieza y se cierra la conexión con MongoDB.

---

# Producción y Docker

Docker permite ejecutar ShipNow en un entorno reproducible. La **imagen** es la plantilla construida a partir del `Dockerfile`; un **contenedor** es una instancia en ejecución de esa imagen. Docker Compose coordina la API y MongoDB como dos contenedores separados.

## Construir la imagen

Desde la raíz del proyecto:

```bash
docker build -t shipnow-api .
```

El `Dockerfile` utiliza Node 22 Alpine, instala solamente las dependencias de producción con `npm ci --omit=dev`, copia el código necesario y ejecuta la API con un usuario sin privilegios. Expone el puerto `8080` e incluye un health check sobre `/health`.

## Ejecutar solamente la API

Si se utiliza una base externa, como MongoDB Atlas, se puede iniciar un único contenedor con las variables del archivo `.env`:

```bash
docker run --name shipnow-api --env-file .env -e NODE_ENV=production -e LOG_LEVEL=info -p 8080:8080 shipnow-api
```

Este ejemplo supone que `PORT=8080`. Si se cambia el puerto interno, también debe ajustarse el valor ubicado a la derecha de `-p`.

## Ejecutar la API y MongoDB con Docker Compose

La primera vez, crear el archivo local de Docker a partir del ejemplo. En PowerShell:

```powershell
Copy-Item .env.docker.example .env.docker
```

Luego construir e iniciar los servicios:

```bash
docker compose --env-file .env.docker up --build
```

Compose crea:

* `api` → la aplicación ShipNow;
* `mongo` → MongoDB 7, accesible por la API mediante el nombre de servidor `mongo`;
* una red privada para la comunicación entre ambos servicios;
* volúmenes para la base, los uploads y los logs.

La API espera a que MongoDB responda correctamente antes de iniciarse. MongoDB no publica su puerto en Windows porque solamente necesita ser accesible desde la red interna de Compose.

Para revisar el estado desde otra terminal:

```bash
docker compose ps
curl.exe http://localhost:8080/health
```

Con los contenedores activos se puede comprobar:

* Health check: `http://localhost:8080/health`
* Swagger: `http://localhost:8080/api/docs`
* Endpoint principal: `http://localhost:8080/api/users?limit=1`

## Detener los contenedores

Si Compose se ejecuta en primer plano, `Ctrl + C` detiene los servicios. También se pueden detener y retirar los contenedores y la red con:

```bash
docker compose down
```

Los volúmenes nombrados se conservan, por lo que MongoDB, los uploads y los logs pueden reutilizarse en el siguiente inicio. `docker compose down -v` también elimina esos volúmenes y sus datos, por lo que solamente debe usarse cuando se quiere realizar una limpieza completa.

## Archivos que no se incluyen

`.dockerignore` evita copiar dentro de la imagen:

* `node_modules` y dependencias de desarrollo;
* `.env` y sus variantes con configuración local;
* `.git` y archivos internos del entorno de trabajo;
* tests y coverage;
* logs, uploads y archivos temporales.

Por separado, `.gitignore` evita subir al repositorio `node_modules`, las variantes locales de `.env`, los logs, los uploads, la cobertura y los archivos temporales. Los archivos `.example` sí se versionan porque solamente documentan la estructura esperada y no contienen secretos.

En Compose, los logs y uploads se guardan en volúmenes para no perderlos al reemplazar el contenedor. En un despliegue real con varias instancias, estos datos deberían enviarse a almacenamiento y monitoreo externos en lugar de depender del disco local de una sola máquina.

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

## Docker

Se comprobó:

* Construcción completa de la imagen `shipnow-api:latest`.
* Inicio conjunto de la API y MongoDB mediante Docker Compose.
* Estado `healthy` de ambos contenedores.
* Respuesta `200` de `/health` con `NODE_ENV=production`.
* Acceso a Swagger desde el contenedor.
* Respuesta de un endpoint principal de la API.

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
