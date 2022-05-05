# Knex CRUD

## Objetivos

- Configurar una instancia de conexión de **knex** que permita conectarse a una base de datos según el entorno de desarrollo elegido (`dev`, `staging`, `production`)
- Crear y probar el CRUD de `rentals` incorporando la instancia de knex en el modelo de `Rentals`.

## Clase

Antes de construir nuestros modelos con sus respectivas consultas, es necesario configurar los entornos de desarrollo para trabajar con la base de datos de pruebas (development), la base de datos que sería una copia de producción (staging) y la base de datos de producción (production).

Primero debemos generar los scripts para automatizar la conexión según el entorno deseado y posteriormente hacer un archivo de configuración que automatice la conexión según el entorno elegido.

#### npm scripts

Agregamos los scripts `dev`, `staging`,  y `production`. Acá estamos agregando la variable de entorno `NODE_ENV` y asignándole un valor según el entorno elegido.

```javascript
{
  "name": "02_node_sql_db",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    // Agregamos las variables de entorno NODE_ENV=variable
		"dev": "NODE_ENV=dev nodemon index.js",
		"staging": "NODE_ENV=staging nodemon server.js",
		"production": "NODE_ENV=production nodemon server.js" 
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.1",
    "knex": "^0.95.4",
    "pg": "^8.6.0"
  }
}

```

_**Nota: el seteo de variables de entorno puede ser distinto en widows**_

https://stackoverflow.com/questions/25112510/how-to-set-environment-variables-from-within-package-json

https://reactgo.com/set-enviroment-variables-package-json/

#### config.js

Este archivo nos permitirá conectarnos a distintas bases de datos con una misma base de código. Utilizando la variable de entorno `NODE_ENV` que se settea automáticamente al correr los scripts de arriba, podemos cambiar entre entornos de desarrollo con el siguiente código:

```JavaScript
const env = process.env.NODE_ENV

const knexfile = require('./knexfile');
const knex = require('knex');

// Para conectarnos a la base de datos, pasamos a `knex()` el objeto de configuración deseado
const knexInstance = knex(knexfile[env]);

/* 
	knexfile[env] es lo mismo que hacer knexfile.env, donde env puede ser
	env === production
	env === staging
	env === development
*/

module.exports = knexInstance;
```

De esta forma exportamos una instancia de conexión a la base de datos correspondiente cuando importemos este archivo.

#### Incorporar la instancia de Knex en Models

Ahora podemos refactorizar el modelo `Rental.js` para incorporar la lógica de cada consulta correctamente, importando primero la instancia de **knex** desde el archivo `/config.js`.

Por cada refactor a cada método de este modelo, prueba y repasa todo el flujo de MVC para entender mejor cómo se está ejecutando todo el código, desde que se envía una petición en el cliente hasta que se recibe en el backend, se ejecuta una consulta en la base de datos y se responde de vuelta al cliente:

```JavaScript
const knex = require('../config');

const create = (body) => {
  // Crear un registro en la tabla 'rentals'
	return knex // retornamos una promesa. 'then' y/o 'catch' será manejados desde el controller.
  		.insert(body)
  		.returning(['title', 'rental_id', 'address', 'guests', 'description', 'created_at'])
  		.into('homes')
}

const findAll = () => {
  // Obtener todos los registros de la tabla 'rentals'
  return knex
  	.select(['rental_id', 'title', 'address', 'guests', 'description', 'created_at'])
  	.from('rentals')
}

const findOneById = (id) => {
        return knex
	    .select(['rental_id', 'title', 'address', 'guests', 'description', 'created_at'])
            .from('rentals')
            .where({ rental_id: id });
}

const updateOneById = (id, bodyToUpdate) => {
        return knex
            .update(bodyToUpdate)
            .from(table)
            .where({ rental_id: id })
            .returning(returningData)
}
    
const deleteOneById = (id) => {       
  return knex
    .update({ is_active: false })
    .from(table)
    .where({ rental_id: id })
}

const destroOneById = (id) => {
  return knex
    .del()
    .from(table)
    .where({ rental_id: id });
}

module.exports = {
  create,
  findAll,
  findOneById,
  updateOneById,
  deleteOneById,
}
```

## Actividad

Vamos a crear todo lo necesario para incorporar la tabla `users` a nuestra base de datos, que contenga las siguientes columnas:

- user_id
- first_name
- last_name
- email
- phone
- biography
- is_active
- created_at

Para esto es necesario:

- Generar las migraciónes up y down de la tabla `users` 
- Generar el CRUD para la tabla de `users`:
  - Crear los endpoints (router)
  - Crear el controller
  - Crear el modelo

Prueba que funcione el crud de `users` creando, leyendo, actualizando y borrando al menos un registro de usuario.

#### Solución

Primero creamos una migración para la tabla `users` con el comando `knex migrate:make users`

Luego dentro del archivo recién creado en `/migrations/timestamp_users.js` agregamos el siguiente código

```JavaScript
exports.up = function(knex) {
  return knex.schema.createTableIfNotExists('users', (table) => {
    table.increments('user_id').primary();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('email').notNullable();
    table.string('phone').notNullable();
    table.string('biography').notNullable();
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
```

Corremos esta última migración con `knex migrate:latest`

Creamos el model, router y controller correspondiente y los conectamos con los `index.js` de cada directorio.

- Router

```javascript
const express = require('express');
const router = express.Router();

const { UserController } = require('../controllers');

// Create
router.post('/users', UserController.create);

// Read All
router.get('/users', UserController.findAll);

// Read One
router.get('/users/:idUser', UserController.findOneById);

// Update One
router.patch('/users/:idUser', UserController.updateOneById);

// Delete One (borrado lógico)
router.delete('/users/:idUser', UserController.deleteOneById);

// Destroy One (borrado físico)

module.exports = router;
```

- Controller

```javascript
const { User } = require('../models');

const create = (req, res) => {
  // const newUser = req.body;
  const newUser = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    phone: req.body.phone,
    biography: req.body.biography,
  }

  // utilizando knex, insertar el objeto en la base datos
  return User
    .create(newUser)
    .then((resDB) => {
      return res.status(200).json({
        message: 'user created',
        user: resDB,
      })
    })
    .catch((err) => {
      res.status(400).json({
        message: err,
      })
    })
}

const findAll = async (req, res) => {
  try {
    const response = await User.findAll(); 

    return res.status(200).json({
      message: 'Successfully obtained list of users',
      response,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Error obtaining list of users',
      error,
    });
  }
}

const findOneById = async (req, res) => {
  const { idUser } = req.params;

  try {
    const response = await User.findOneById(idUser);
    if (response.length === 0) return res.status(404).json({ message: "provided user doesn't exist" });
    return res.status(200).json({
      message: 'Successfully obtained user by id',
      response,
    });
    
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

const updateOneById = async (req, res) => {
  const { idUser } = req.params;

  try {
    const response = await User.updateOneById(idUser, req.body);
    return res.status(200).json({
      message: 'Successfully updated user by id',
      response,
    });
    
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

const deleteOneById = async (req, res) => {
  const { idUser } = req.params;

  try {
    await User.deleteOneById(idUser);
    return res.status(204).json();
    
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

module.exports = {
  create,
  findAll,
  findOneById,
  updateOneById,
  deleteOneById,
}
```

- Model

```javascript
const knex = require('../config');

const create = (bodyUser) => {
  return knex('users').insert(bodyUser);
}

const findAll = () => {
  return knex
    .select(['user_id', 'first_name', 'last_name', 'email', 'phone', 'biography', 'is_active', 'created_at'])
    .from('users');
}

const findOneById = (id) => {
  return knex
    .select(['user_id', 'first_name', 'last_name', 'email', 'phone', 'biography', 'is_active', 'created_at'])
    .from('users')
    .where({ user_id: id, is_active: true });
}

const updateOneById = (id, updateBody) => {
  return knex
    .update(updateBody)
    .from('users')
    .where({ user_id: id });
}

// Borrado Lógico (desactivar)
const deleteOneById = (id) => {
  return knex
    .update({ is_active: false })
    .from('users')
    .where({ user_id: id });
}

module.exports = {
  create,
  findAll,
  findOneById,
  updateOneById,
  deleteOneById,
}
```

