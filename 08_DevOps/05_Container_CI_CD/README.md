# Container CI/CD
---

## Objetivos

- Repasar buenas prácticas para un entorno en producción
- Crear un flujo completo de CI y CD a partir de una imagen de Docker

## Clase

Hasta ahora, todas las configuraciones están orientadas a probar todo nuestro código y revisar que el deployment se haga correctamente en un entorno de desarrollo, es decir, enfocando que todo sea lo más cómodo y directo para hacer todas las pruebas y cambios que necesitemos mientras codeamos. Sin embargo hay optimizaciones que vale la pena atender al pasar nuestro código a producción.

#### Buenas prácticas para producción

Comenzaremos creando una carpeta `/Docker` en nuestro proyecto. Dentro de esta carpeta creamos dos carpetas adicionales: `/Docker/prod` y `/Docker/dev`. Creamos un archivo `Dockerfile` dentro de las carpetas `prod` y `dev`que recién creamos.

Pasamos la configuración que hicimos en sesiones previas, de nuestro archivo `Dockerfile` de la raíz al archivo `Dockerfile` de la carpeta `Docker/dev`.

Modificamos también nuestro `docker-compose.yml` para incluir la nueva ruta donde se encuentra el `Dockerfile`, a la altura de `build` en el servicio `web`:

```yml
version: "3"

services:
    web:
        build: ./docker/dev
        ports:
            - "4000:4020"
        depends_on:
            - db
        env_file:
            - .env
        volumes:
            - .:/usr/src/app
            - /usr/src/app/node_modules
    # build: Ejecuta el docker file para crear la imagen y despues crea el container
    # ports: Sinonimo del docker run -p 4000:4020 api-mongo, hace un puenta entre el puerto 4000 de mi pc con 4020 del container 
    # env_file defines un archivo .env y crea las varibles de entorno dentro del container 
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

#### Dockerfile para producción

Ahora crearemos un `Dockerfile` para producción en la carpeta `/Docker/prod`. Aunque todo funciona con nuestra configuración actual, podemos crear una configuración más ligera y que optimice mejor nuestros tiempos al salir a producción.

```yml
# Empleamos la versión 'slim' de Node, para generar una imagen más ligera y, por lo tanto, un proyecto que carga más rápido
FROM node:12-slim

# Mismo workdir
WORKDIR /usr/src/app

# Especificamos que solo queremos el package y package-lock, va de la mano de 'npm ci --production'
COPY package.json package-lock.json ./

# Ejecutamos dos comandos, el primero optimiza la instalación partiendo de un package-lock, ahorrando el tiempo de búsqueda de paquetes. El segundo comando limpia caché cada vez que se crea una nueva imagen para producción. Así se crea todo desde cero y mejoramos tiempos de deployment en producción.
RUN npm ci --production && npm cache clean --force

# Copiamos igual que en dev
COPY . .

# ARG PORT

# ENV PORT=$PORT

ENV NODE_ENV=production

# Levanta su propio hilo de ejecución dentro del sistema operativo
CMD ["node", "server.js"]

# Esto no se hace, ya que quien inicia el servicio será npm, y no el contenedor como tal. Es como si npm encapsulara el servicio y lo conectara al sistema operativo, por lo que no podrás saber fácilmente si hay un error mientras se ejecuta el servicio.
# CMD ["npm", "start"]
```

#### Ajustar workflows de CI para producción

En nuestro archivo `/.github/workflows/main.yaml` hacemos los siguientes ajustes para ajustar todo a production level.

###### Gitflow

El flujo de trabajo con Git & Github a nivel de producción implica trabajar con [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) y separar nuestro trabajo por ramas, que sigan una nomenclatura dada.

En resumen, en el día a día del desarrollo de software, siempre estaremos haciendo `pull_request` a la rama `develop` para integrar nuevas funcionalidades, correcciones, refactors, etc. Cuando subamos a producción solo haremos un `pull_request` de la rama `develop -> master`.

Tomando esto en cuenta, hagamos algunas modificaciones a nuestro workflow de CI en Github.

###### main.yaml

Partimos modificando los eventos que detona el CI

```yml
# on: [push,pull_request]

on:
  push:
    branches:
      - master
```

###### Heroku Docker Registry 

Podemos hacer push de nuestra imagen de Docker en Heroku para que sea Heroku quien maneje las imágenes por nosotros, haciendo uso de su [Container Registry](https://devcenter.heroku.com/articles/container-registry-and-runtime).

Una vez que hagamos login con Heroku, haremos build y push de nuestra imagen al registry. Ya en el registry, podemos pedirle a Heroku que la utilice para hacer deployment.

Podemos separar este proceso en tres pasos:

1. Login
2. Build
3. Release

Modificamos el workflow de CI de la siguiente manera:

```yml
name: Node NoSQL API v2

on:
  push:
    branches:
      - master

jobs:
  build:

    runs-on: ubuntu-latest
    # aqui le digo a mi CI en donde se va ejecutar
    steps:
    - uses: actions/checkout@v2
    - name: Login al Heroku Registry
      env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:login
    - name: Build & push de mi imagen
      env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: |
           docker build . --tag api-mongoose-v1 -f docker/prod/Dockerfile
           docker tag api-mongoose-v1 registry.heroku.com/${{ secrets.HEROKU_APP_NAME  }}/web
           docker push registry.heroku.com/${{ secrets.HEROKU_APP_NAME  }}/web
    - name: Release
      env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
      run: heroku container:release -a ${{ secrets.HEROKU_APP_NAME }} web 

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: API Tests
        uses: actions/setup-node@v1
        with:
          node-version: '12.x'
      - run: npm ci
      - run: npm test
      
```

Ahora entramos a nuestra cuenta de Heroku. Accedemos a `account settings` donde, al final, aparece la `API KEY` de Heroku que necesitams agregar a los secrets de Github.

En tu repositorio, accedes a `Settings` y dentro accedes a `Secrets`.

Dentro de `Secrets` entramos a Environment Secrets y de ahi a "Manage your environment..."

Creamos un entorno "production"

Creamos la Environment Secret `HEROKU_API_KEY` y agregamos el valor que obtenemos de nuestra información de Heroku.

#### Nuevo Proyecto de Heroku

Desde nuestro dashboard en Heroku creamos un nuevo proyecto, con el nombre único que deseemos para este.

Creamos una nueva variable de entorno `HEROKU_APP_NAME` y le ponemos el nombre de nuestro nuevo proyecto de Heroku.

