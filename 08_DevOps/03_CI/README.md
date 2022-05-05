# Continuous Integration
---
## Objetivos

- Entender qué es Continuos Integration y por qué es tan útil al trabajar en equipo.
- Mostrar tecnologías para implementar CI.
- Implementar un proceso de CI con Github Actions.

## Clase

Empieza la clase con la presentación de CI/CD en la carpeta DevOps del Drive "Material para Senseis".

Después de la presentación y dar una intro general a CI y CD, crearemos un nuevo repositorio en Github.

#### Copiar un proyecto para subir a Github

Recomendamos copiar la carpeta de `node_nosql_db` en otro directorio empleando

```terminal
$ cp -R ./mi-repo-a-copiar ./directorio-donde-voy-a-copiar
```

Abrimos la carpeta copiada en el nuevo lugar, y creamos un nuevo repositorio de Git con:

```terminal
$ git init
```

Creamos un archivo `.gitignore` e incluimos los directorios y archivos que no queremos incluir en el repo, como : `service.json`, `.env`, `node_modules`, `uploads`, `coverage`, etc.

#### Subir repo a Github

Creamos un nuevo repo vacío desde nuestra cuenta de Github. Siguiendo las instrucciones para inicializar un nuevo repositorio, agregamos el `remote` a nuestro repositorio local.

`git remote add origin https://...`

Luego hacemos push de nuestro repositorio local a Github con `git push origin master`.

#### Github Actions

Podemos consultar la [documentación de Github Actions](https://docs.github.com/en/actions/guides/building-and-testing-nodejs) para configurar un flujo de trabajo para Continous Integration.

Comenzamos creando dentro de nuestro proyecto una carpeta `.github`. Dentro de esta carpeta creamos una nueva carpeta llamada `workflows`. Dentro de `workflows` creamos un archivo `main.yaml`.

Vamos a partir del archivo con extensión `.yaml` que aparece en la documentación. El código que ahí aparece, al día que se escribe esta guía, es el siguiente:

```yaml
name: Node.js CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [10.x, 12.x, 14.x, 15.x]

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test
```

Partiendo de la documentación y el código de ejemplo, creamos nuestro propio `main.yaml` con el siguiente código:

```yaml
name: Api Mongoose V1

on: [push,pull_request] 
#cuando se va ejecutar este work flow

jobs:
#Stages -> los proceso de CI que tiene que hacer este workflow
#Este workflow tiene que hacer dos cosas:
# compilar -> build
# test
  build:

    runs-on: ubuntu-latest
    # aqui le digo a mi CI en donde se va ejecutar
    steps:
    - uses: actions/checkout@v2
    #Son los pasos que tengo que hacer para que build funcione
    #que verion de github actions va a ocupar 
    - name: Build image Docker
    # nombra el paso en el que estas
      run: docker build . --file Dockerfile --tag api-mongoose-v1
    #ejecuta un comando especifico
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    - name: Tests API
      uses: actions/setup-node@v1
      with:
        node-version: '12.x'
    - run: npm ci
    - run: npm test
```

Es muy importante agregar la bandera `--forceExit` en nuestro `package.json` al ejecutar el comando de pruebas de nuestro proyecto. Si no agregamos la bandera, es posible que se quede colgado el proceso.