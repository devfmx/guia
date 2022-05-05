# Intro a Knex

## Objetivos

- Entender cómo se conecta el backend con una base de datos.
- Utilizar **knex** para manejar la conexión a la base de datos y crear tablas desde migraciones.

## Clase

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

#### Inicialización de un proyecto con Knex

Inicializamos un nuevo proyecto con `npm init` para crear nuestro proyecto de backend con sql. Aquí instalamos las siguientes dependencias:

2. knex
3. pg (driver de postgresql)

Es decir ejecutamos en terminal: `npm i knex pg` 

```javascript
// package.json

{
  "name": "node_sql_api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "Maui",
  "license": "ISC",
  "dependencies": {
    "knex": "^0.95.4",
    "pg": "^8.6.0"
  }
}


```

***Nota: acá estamos instalando knex nuevamente pero a nivel de proyecto, para utilizarlo dentro del código para hacer consultas.***

Gracias a que ahora tenemos knex instalado globalmente, podemos correr comandos de knex desde la terminal. Así, hacemos `knex init` para generar un archivo de configuración de conexiones para knex.



Creamos o nos conectamos a una instancia en ElephantSQL, y nos colocamos en la página básica donde nos muestra toda la data para conectarnos a la instancia.

Veamos cómo se conecta desde pgadming y los datos que nos pide, luego hagamos esto mismo con el `knexfile.js`

#### Migrations

hacemos `knex migrate:make rentals` 

luego en la migración que se acaba de crear dentro del directorio de `/migrations `, encontrarás un archivo con un nombre como el siguiente `timestamp_rentals.js`.

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
