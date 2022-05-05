# Docker

## Objetivos

- Aprender qué es Docker y contenedores
- Aprender a identificar cuándo usar Docker
- Instalar Docker
- Crear un Dockerfile, Image y Container

## Clase

Comandos de Docker

```javascript
docker ps
docker build . -t my-image-name
docker run my-image-name
docker stop [uid]
```


Comenzar con la presentación: **SQL Driver, Query Builder y ORM** para explicar los puntos a continuación.

El backend puede conectarse a una base de datos y a través del código de JavaScript podemos hacer consultas.

¿Cómo hacer consultas?

- **Database driver**: se conecta directo y tú escribes las sentencias SQL dentro de strings. Haces todo a mano. Incluso temas de seguridad caen completamente en la implementación de la aplicación
- **ORM (Object-Relational Mapping)**: es la forma más "compleja" de conectarnos, tiene la obligación de convertir el SQL en algo que podamos manejar como programadores. Por ejemplo en objetos. Mucha configuración pero resuelve muchas cosas por ti, incluyendo temas de manejo de conexiones y seguridad.
- **Query builder**: no tiene tantas abstracciones como ocurre en un ORM, pero no requiere hacer absolutamente todo a mano como ocurre al trabajar con el driver.

Tanto los ORM comos los Query builders emplean los drivers, la diferencia recae en la cantidad de capas de abstracción que incorporan.

#### Instalación de Knex

Knex (pronunciado *kinecs*) es un **SQL Query Builder**. Encontramos la documentación oficial acá: https://knexjs.org/

Para trabajar con knex, primero es necesario instalar knex globalmente para tener el CLI disponible para utilizarse con cualquier proyecto. Para esto hacemos  `npm i knex -g` desde nuestra terminal.


En este archivo escribimos:

```JavaScript
// Agregar las migraciones
exports.up = function(knex) {
	// createTableIfNotExists parámetros: como se llama la tabla, callback
  return knex.schema.createTableIfNotExists('rentals', (table) => {
		// Definición de mi tabla 'rentals'
    table.increments('rental_id').primary();
		// table.tipo_de_dato('nombre_de_la_columna').atributos_de_columna
    table.string('title').notNullable();
    table.integer('guests').notNullable();
		table.text('address').notNullable();
    table.text('description');
    table.boolean('is_active').notNullable().defaultTo(true);
		table.timestamp('created_at').defaultTo(knex.fn.now());
  })
}

// Quitar las migraciones
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rentals');
} 
```

Una vez escrita la `migration` que tenemos arriba, podemos correr:

`knex migrate:latest` 

Acto seguido podemos encontrar en nuestra base de datos, a través de pgAdmin que ya tenemos la tabla **homes** con todas las columnas que nosotros especificamos acá arriba.

## Actividad

Inspeccionar y hablar de los comandos de la **CLI** **de** **knex** haciendo `knex --help` desde terminal. Pide a lxs estudiantes que discutan:

- ¿Cómo podríamos deshacer una migración?
- ¿Cómo podríamos intentar correr una migración en específico?
- ¿Cómo podemos deshacer el último **batch** de migración ejecutado? (Es decir, ¿cómo hacer rollback?)
- ¿Cuál es el propósito de las migraciones?
- ¿Porqué es importante tener un historial de los cambios a cada tabla de la base de datos?

Es importante hacer énfasis en lo útil que puede ser revisar cómo se trabaja con un comando haciendo uso de la bandera `--help` para leer la documentación.
