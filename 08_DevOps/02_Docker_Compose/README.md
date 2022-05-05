# Docker Compose

## Objetivos

- Levantar a través de Docker Compose localmente dos proyectos que se comuniquen entre sí: un backend de api y una base de datos de mongodb
- Habilitar la persistencia de datos para la base de datos de mongodb
- Habilitar el hot reload del contenedor, de forma que al cambiar el código que escribimos, se actualice el código del contenedor
- Aprender a usar variables de entorno en un contenedor

## Clase

Docker está pensado para que una imagen esté asociada a un solo contenedor, y viceversa.

Pensemos en un problema interesante:

- Debes correr una API
- La API se conecta a una base de datos de mongodb localmente

¿Deberías instalar tu propia base de datos localmente?

Con Docker podrías NO instalar localmente la base de datos, levantar dos contenedores, uno para la api y otro para la base de datos, y conseguir que se comuniquen entre sí.

Lo mejor de todo, puedes lograrlo con un simple `docker build`.

#### Docker Compose

Para levantar múltiples Dockerfiles podemos emplear **Docker Compose**.

Creamos un nuevo archivo `docker-compose.yml` donde la identación es parte importante de la descripción del archivo. Dentro escribimos el siguiente código:

```yml
# docker-compose.yml

# Versión de Docker Compose a emplear
version: "3"

# ¿Qué proyectos va a levantar ese docker compose?
services:
  # hace referencia a nuestra app web (la api)
  web:
    # ejecuta el docker file para crear la imagen y luego crear el contenedor
    build: .
    # sinónimo de docker run -p 4000:4020 api-mongo, hace un puente entre el puerto 4000 de mi PC con el puerto 4020 del contenedor
    ports:
      - "4000:4020"
    depends_on:
      - db


  # hace referencia a nuestra base de datos
  db:
    # como la base de datos la instalaremos desde docker hub, solo especificamos la imagen de donde se parte para crear el contenedor
    image: mongo
    restart: always
    expose:
      - "27017"
```

Debemos modificar el archivo `config.js` para especificar que ahora nos conectaremos a una base de datos local.

```javascript
const PORT = process.env.PORT || 4020;
const { NODE_ENV } = process.env;

const environments = {
    test: {
        PORT,
        db_uri: `mongodb://db:27017/miBaseDeDatosTest`
        // db_uri: `mongodb+srv://${MONGO_ATLAS_USER}:${MONGO_ATLAS_PASSWORD}@abcdef.j9vdi.mongodb.net/miBaseDeDatosTest?retryWrites=true&w=majority`
    },    
    dev: {
        PORT,
        db_uri: `mongodb://db:27017/miBaseDeDatosDev`
        // db_uri: `mongodb+srv://${MONGO_ATLAS_USER}:${MONGO_ATLAS_PASSWORD}@abcdef.j9vdi.mongodb.net/miBaseDeDatosDev?retryWrites=true&w=majority`
    },
    // Contiene los datos reales de nuestros usuarios/clientes
    production: {
        PORT,
        db_uri: `mongodb://db:27017/miBaseDeDatosProd`
        // db_uri: `mongodb+srv://${MONGO_ATLAS_USER}:${MONGO_ATLAS_PASSWORD}@abcdef.j9vdi.mongodb.net/miBaseDeDatosProd?retryWrites=true&w=majority`
    },
}

console.log('NODE_ENV:', NODE_ENV);

module.exports = environments[NODE_ENV]

```

Prueba ejecutando desde una terminal, posicionado dentro de tu proyecto los siguientes comandos:

```terminal
$ docker-compose build
$ docker-compose up
```

Prueba haciendo una petición `GET` a `http://localhost:4000/items` y verifica que la API no te entregue ningún item.

Si te trae items, quiere decir que estás contectándote a una base de datos previa, y no la base de datos local que recién creamos.

Posteriormente prueba creando un nuevo item con una petición `POST` al mismo endpoint.

Una vez creado el item, prueba nuevamente con los comandos

```terminal
$ docker-compose stop
$ docker-compose build
$ docker-compose up
```

Prueba obteniendo la lista de items nuevamente y notarás que los datos no se persistieron.

#### Persistencia de datos

No contamos con persistencia debido a que no hemos especificado un volumen para manejar la persistencia de datos de nuestra base de datos.

Para ello actualizamos nuestro archivo `docker-compose.yml` agregando, a nivel global y a nivel de "db", la configuración de volúmenes:

```yml
# docker-compose.yml

# Versión de Docker Compose a emplear
version: "3"

# ¿Qué proyectos va a levantar ese docker compose?
services:
  # hace referencia a nuestra app web (la api)
  web:
    # ejecuta el docker file para crear la imagen y luego crear el contenedor
    build: .
    # sinónimo de docker run -p 4000:4020 api-mongo, hace un puente entre el puerto 4000 de mi PC con el puerto 4020 del contenedor
    ports:
      - "4000:4020"
    depends_on:
      - db


  # hace referencia a nuestra base de datos
  db:
    # como la base de datos la instalaremos desde docker hub, solo especificamos la imagen de donde se parte para crear el contenedor
    image: mongo
    restart: always
    expose:
      - "27017"
    volumes:
      - mongodata:/data/db

  # En este caso el volumen me ayuda a persistir los datos en la base de datos, y no se pierdan al reiniciar contenedores
  volumes:
    mongodata:

```

Podemos probar nuevamente haciendo `docker-compose build` y `docker-compose up`. Verificamos que la base de datos persiste los datos a través de reinicios.

#### Hot reload

Para que nuestros contenedores se reinicen según los cambios que escribimos en nuestro código, como hacemos con `nodemon`, tenemos que agregar más volúmenes a nuestro `docker-compose.yml`. Esta vez para el servicio `web`.

El primer volumen dirá se encarga de decirle a Docker que el código que existe en nuestro proyecto, donde estamos trabajando, debe ser el mismo que el código del contenedor.

Para el segundo volumen, empleamos una opción recomendada de escuchar también los node_modules. No es necesario pero es recomendable para no hacer un build siempre que cambien nuestros node_modules.

```yml
# docker-compose.yml

# Versión de Docker Compose a emplear
version: "3"

# ¿Qué proyectos va a levantar ese docker compose?
services:
  # hace referencia a nuestra app web (la api)
  web:
    # ejecuta el docker file para crear la imagen y luego crear el contenedor
    build: .
    # sinónimo de docker run -p 4000:4020 api-mongo, hace un puente entre el puerto 4000 de mi PC con el puerto 4020 del contenedor
    ports:
      - "4000:4020"
    depends_on:
      - db
    volumes:
      # indica que el working dir del contenedor debe ser igual a nuestro proyecto
      - .:/usr/src/app 
      # opcional: observa los node_modules de nuestro proyecto para evitar hacer un build cada vez que estos cambian
      - /usr/src/app/node_modules


  # hace referencia a nuestra base de datos
  db:
    # como la base de datos la instalaremos desde docker hub, solo especificamos la imagen de donde se parte para crear el contenedor
    image: mongo
    restart: always
    expose:
      - "27017"
    volumes:
      - mongodata:/data/db

  # En este caso el volumen me ayuda a persistir los datos en la base de datos, y no se pierdan al reiniciar contenedores
  volumes:
    mongodata:

```

Finalmente modificamos nuestro `Dockerfile` que ejecuta el código de nuestro servicio `web`. Aquí podemos utilizar tranquilamente `nodemon`, gracias a que este paquete ya está configurado para trabajar con Docker.

Solo necesitamos emplear la bandera `-L` al momento de ejecutarlo.

Hacemos los cambios pertinentes en nuestro Dockerfile:

```Dockerfile
# Aqui van las instrucciones para crear una imagen de docker

# Le digo a docker que version de node voy a usar
FROM node:12

# Le digo a docker donde van a estar las carpetas/proyectos que voy a usar dentro de mi container AHORA ES LA CARPETA RAIZ
WORKDIR /usr/src/app 

# Decirle a docker como levantar mi proyecto de node

# Copiar el pacakge json y ponerlo en la carpeta raiz del contenedor
COPY package.json ./

# Una vez copiado el package json ahora se instalan las dependencias
RUN npm install

# Instalo nodemon de manera global
RUN npm install -g nodemon

# Copiar la todo en donde estas parado a la raiz del contenedor
COPY . .

# Exponer un puerto desde el container
EXPOSE 4020

# El comando para correr mi proyecto con node
# CMD ["node", "index.js"]

# Comando para correr el proyecto con nodemon
CMD ["nodemon", "-L", "--watch", ".", "index.js"]
```

#### Variables de entorno

Para agregar variables de entorno a nuestros contenedores, podemos especificarlo en nuestro `docker-compose.yml`:

```yml
version: "3"

services:
    web:
        build: .
        ports:
            - "4000:4020"
        depends_on:
            - db
        env_file: # Agregamos el archivo que contiene variables de entorno
            - .env
        volumes:
            - .:/usr/src/app
            - /usr/src/app/node_modules

    db:
        image: mongo
        restart: always
        expose:
            - "27017"
        volumes:
            - mongodata:/data/db
# En este caso el volumen me va a ayudar a que persistan mis datos en la BD
volumes: 
    mongodata: 
```

Ya empleando variables de entorno podemos modificar, por ejemplo, la base de datos a la cual nos conectamos.

Agregamos a nuestro archivo `.env` una nueva variable de entorno:

```.env
MONGO_DB_NAME=miBaseDeDatos
```

Ahora podemos modificar nuestro archivo `config.js` y agregar la variable de entorno a las URLs de conexión:

```javascript
const PORT = process.env.PORT || 4020;

const environments = {
    // ...   
    dev: {
        PORT,
        db_uri: `mongodb://db:27017/${process.env.MONGO_DB_NAME}`
        // db_uri: `mongodb+srv://${MONGO_ATLAS_USER}:${MONGO_ATLAS_PASSWORD}@abcdef.j9vdi.mongodb.net/development?retryWrites=true&w=majority`
    },
    // ...
}

module.exports = environments[NODE_ENV]

```

Probamos nuevamente levantando el contenedor y verificando que todo funcione correctamente con

```terminal
$ docker-compose build
$ docker-compose up
```

## Actividad

Todo el proceso de aprender docker de esta sesión y la sesión previa fue trabajando sobre el proyecto `/node_nosql_db`.

Prueba ahora con el proyecto `/node_sql_db`. Aquí deberás:
  - Crear el `Dockerfile` para tu api
  - Crear el `docker-compose.yml` para crear y levantar un contenedor para la api, y un contenedor para postgresql

Corrobora que la persistencia de datos sea exitosa y que tu proyecto maneje datos sensibles mediante variables de entorno.