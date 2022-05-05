# Knex relaciones y joins 

## Objetivos

- Mostrar cómo se pueden modificar y/o agregar columnas a una tabla existente desde una nueva migración.
- Cómo agregar relaciones a tablas existentes mediante llaves foráneas en una migración.
- Generar una consulta que emplee `joins` con knex.

## Clase

Empezamos la clase creando una nueva migración con

`knex migrate:make add_relation`

En el archivo de migración escribimos el siguiente código:

```javascript
exports.up = function(knex) {
  // Dentro del siguiente callback, podemos manipular la tabla 'rentals'
  return knex.schema.table('rentals', (table) => {

    // Así podemos renombrar columnas
    table.renameColumn('description', 'details');

    // Así podemos agregar columnas nuevas
    table.integer('fk_user').unsigned().references('users.user_id');
  });
};

exports.down = function(knex) {
  
};
```

Corremos la migración con `knex migrate:latest` y revisamos desde pgAdmin que se hayan agregado las columnas correspondientes a nuestra tabla de `rentals`.

Posteriormente hacemos una prueba agregando `{ "fk_user": 1 }` a un rental a traves de un `PATCH` hacia el endpoint `localhost:3000/api/v1/rental/:idRental`

Ahora tenemos un registro de la tabla de `rentals` que tiene una llave foránea de un registro de la tabla `users`. Esto reúne las condiciones para poder realizar un `join` de la tabla `rentals` hacia la tabla `users`.

Escribimos el método del `join` directamente en el modelo de `Rental` y no en la utilidad de `createModelKnex`, ya que este método es algo mucho más específico de la tabla `rentals` y no se puede generalizar tan fácilmente para cualquier tabla.

Escribimos en el modelo de `Rental.js`:

```javascript
// /models/Rental.js

const knex = require('../config');
const createKnexModel = require('../utils/createKnexModel');

const TABLE = 'rentals';
const TABLE_COLUMNS = [
  'rental_id',
  'title',
  'address',
  'guests',
  'details',
  'is_active',
  'created_at'
];
const TABLE_ID = 'rental_id';

const Rental = createKnexModel(knex, TABLE, TABLE_COLUMNS, TABLE_ID);

// Inner Join de 'rentals' hacia 'users'
Rental.findOneByIdWithUser = (idRental) => {
  return knex
    .select(['users.user_id', 'users.email', 'rentals.title', 'rentals.rental_id'])
    .from(TABLE)
    .join('users', 'users.user_id', '=', 'rentals.fk_user')
    .where({ [TABLE_ID]: idRental })
}

module.exports = Rental;
```

## Actividad

Refactorizar el método `findOneById` del `RentalController.js` para que se obtengan los registros haciendo uso del método de join que recién escribimos.

#### Solución

En `RentalController`  modificamos el método  `findOneById` para traer el resultado haciendo el join.

Es importante resaltar que, de esta forma, solo se obtendrán aquellos registros que cumplan con la condición de tener una llave foránea asociada a un registro real de la tabla de `users`. Es decir, debe cumplirse el `innerJoin` para que se traiga el registro.

También es posible crear otro endpoint para mantener un endpoint donde obtienes un registro de `rentals` sin hacer join, y otro endpoint donde traigas el registro con el join hacia `users`.

```javascript
// /controllers/RentalController.js

...

const findOneById = async (req, res) => {
  const { idRental } = req.params;

  try {
    // Acá reemplazamos el método findOneById por findOneByIdWithUser
    const response = await Rental.findOneByIdWithUser(idRental);
    if (response.length === 0) return res.status(404).json({ message: "provided rental doesn't exist" });
    return res.status(200).json({
      message: 'Successfully obtained rental by id',
      response,
    });
    
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
}

...
```