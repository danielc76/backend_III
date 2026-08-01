# ShipNow API

ShipNow es una **API REST para la gestión de pedidos y entregas**, desarrollada con **Node.js, Express y MongoDB mediante Mongoose**. El sistema permite gestionar usuarios, pedidos y entregas, incluyendo la asignación de repartidores y el seguimiento de los estados.

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

| Método | Ruta              | Descripción      |
| ------ | ----------------- | ---------------- |
| GET    | `/api/users`      | Listar usuarios  |
| GET    | `/api/users/:uid` | Obtener usuario  |
| POST   | `/api/users`      | Crear usuario    |
| DELETE | `/api/users/:uid` | Eliminar usuario |

## Orders

| Método | Ruta                      | Descripción       |
| ------ | ------------------------- | ----------------- |
| GET    | `/api/orders`             | Listar pedidos    |
| GET    | `/api/orders/:oid`        | Obtener pedido    |
| POST   | `/api/orders`             | Crear pedido      |
| PATCH  | `/api/orders/:oid/status` | Actualizar estado |
| DELETE | `/api/orders/:oid`        | Eliminar pedido   |

## Deliveries

| Método | Ruta                          | Descripción       |
| ------ | ----------------------------- | ----------------- |
| GET    | `/api/deliveries`             | Listar entregas   |
| GET    | `/api/deliveries/:did`        | Obtener entrega   |
| POST   | `/api/deliveries`             | Crear entrega     |
| PATCH  | `/api/deliveries/:did/status` | Actualizar estado |
| DELETE | `/api/deliveries/:did`        | Eliminar entrega  |

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

# Pruebas realizadas

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

Las pruebas realizadas fueron manuales mediante Postman. Los tests automatizados podrían incorporarse como mejora futura.

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


