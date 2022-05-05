# Refactor: Knex Model Util

## Objetivos

- Hablar de la importancia del refactor.
- Refactorizar los métodos cómunes de los modelos en un solo archivo de utilidades, para simplificar la creación de nuevos modelos y tener una misma base en todos, fácilmente editable.

## Clase

Comenzamos la clase observando el resultado de la actividad de la clase anterior `08_Knex_CRUD` donde deberían tener `routers`, `controllers` y `models` muy similares entre `Users` y `Rentals`.

Viendo que los modelos de `User` y `Rental` son esencialmente iguales, podemos refactorizar y volver más abstracto y general todo aquello que se repite.

#### Knex Utility

Creamos el un directorio `utils ` donde colocaremos el archivo `createModelKnex.js` donde tendremos:

```JavaScript
// Tiene como objetivo hacer una abstracción de mis funciones
// que solitan la info a la base de datos.

const createModelKnex = (knex ,table, returningData, tableId) =>  {

    const create = (body) => {
        return knex
            .insert(body)
            .returning(returningData)
            .into(table)
    };
    
    const findAll = () => {
        return knex
            .select(returningData)
            .from(table)
    
    }

    const find = (query) => {
        return knex.select(returningData)
                    .from(table)
                    .where(query)
    }
    
    const findOne = (id) => {
        return knex
            .select(returningData)
            .from(table)
            .where({ [tableId]: id });
    }
    
    const update = (id, bodyToUpdate) => {
        return knex
            .update(bodyToUpdate)
            .from(table)
            .where({ [tableId]: id })
            .returning(returningData)
    }
    
    const destroy = (id) => {
        return knex
            .del()
            .from(table)
            .where({ [tableId]: id });
    }
    
    const delit = (id) => {       
        return knex
            .update({ active: false })
            .from(table)
            .where({ [tableId]: id })
    }
    
    return {
        create,
        findAll,
        findOne,
        update,
        destroy,
        delit,
        find
    }

}

module.exports = createModelKnex;
```

De esta forma tenemos los métodos básicos de CRUD generalizados para cualquier tabla que creemos.

Ahora refactorizamos nuestro modelo `Rental.js` empleando esta nueva utilidad:

#### Rental Model (Refactorizado)

```javascript
// /models/Rental.js

const knex = require('../config');
const createModelKnex = require('../utils/createModelKnex');

const TABLE = 'rentals';
const RETURNING_DATA = ['title', 'rental_id', 'address', 'guests', 'description', 'created_at'];
const TABLE_ID = 'house_id';

const Rental = createModelKnex(knex, TABLE, RETURNING_DATA, TABLE_ID);

module.exports = Rental;
```

## Actividad

Refactorizar el modelo `user` de manera que se acople a utiliar esta nueva utilidad de modelo para knex, al igual que hicimos con `Rental.js`.

#### Solución

```javascript
// /models/User.js

const knex = require('../config');
const createKnexModel = require('../utils/createKnexModel');

const TABLE = 'users';
const TABLE_COLUMNS = ['user_id', 'first_name', 'last_name', 'email', 'phone', 'biography', 'is_active', 'created_at'];
const TABLE_ID = 'user_id';

const User = createKnexModel(knex, TABLE, TABLE_COLUMNS, TABLE_ID);

// Esto es lo que debemos exportar al final
// const User = {
//   create,
//   findAll,
//   findOneById,
//   updateOneById,
//   deleteOneById,
// }

module.exports = User;
```

