# Variables de Entorno

## Objetivos

- Entender qué son y por qué son importantes las variables de entorno
- Instalar `dotenv` en nuestro proyecto para manejar variables de entorno fácilmente
- Sustituir valores sensibles en nuestro proyecto por variables de entorno

## Recursos recomendados

https://es.ccm.net/contents/652-variables-de-entorno

https://www.twilio.com/blog/2017/08/working-with-environment-variables-in-node-js.html

## Clase

Hacemos un `console.log(process.env)` y miramos lo que hay dentro. Acá se listan todas las variables de entorno a las que tiene acceso `process.env` a través de node.

Sabemos de clases previas que podemos setear una variable de entorno directamente desde línea de comando:

```javascript
MI_VARIABLE=holamundo npm run dev
```

Si ejecutamos la instrucción previa desde nuestra terminal, tendremos la variable de entornp `MI_VARIABLE` disponible a través de `process.env`. Sin embargo esta manera de agregar variables de entorno no es tan sencilla ni reutilizable.

#### dotenv

Instalamos `dotenv` como una **dependencia de desarrollo** para manejar variables de entorno fácilmente desde un archivo con extensión `.env`. Lo instalamos como dependencia de desarrollo porque solo será necesaria mientras estamos trabajando en el código; ya en producción tendremos otra forma de configurar las variables de entorno.

Encuentas la documentación del paquete aquí: https://www.npmjs.com/package/dotenv.

`npm install dotenv --save` 

Una vez instalado `dontenv`, lo configuramos solicitándolo tan arriba (o tan al inicio) como podamos en nuestro proyecto:

```javascript
// index.js

require('dotenv').config();.

const express = require('express');
...
```

Ahora, podemos cargar nuestras propias variables de entorno desde un archivo `.env` que colocamos en la raíz de todo nuestro proyecto, al lado del index.js:

```javascript
// .env

FOO=bar
MI_VARIABLE_CHIDA=cool
```

Probamos su funcionamiento mostrando en consola las variables que coloquemos en nuestro archivo `.env`.

#### git ignore

Es **fundamental** agregar nuestro archivo `.env` al `.gitignore`, para que nuestro archivo nunca se suba a internet, y sea algo que siempre debamos incluir localmente, desde un archivo personal:

```javas
.vscode
node_modules
.env
```

## Actividad

Encuentra y pasa todos los valores sensibles de nuestro proyecto a variables de entorno, de forma que nuestro código fuente no revele contraseñas, conexiones, usuarios, etc.

#### Solución

En nuestro archivo `.env` debemos tener, al menos:

```javascript
// /utils/index.js

module.exports = {
	...
  checkRole: (role) => {
    // Devolvemos el callback de middleware con req, res, next
    return (req, res, next) => { 
      console.log(req.user); // Traemos el user desde el middleware de 'verifyToken'
      if(req.user.role !== role) {
        return res.status(403).send({message:"Forbiden, VIP Only"});
      } 
      return next();
    }
  },
} 
```

Refactorizamos los siguientes archivos para emplear variables de entorno:

- knexfile.js

```javascript

```

- utils/generateToken.js

```javascript

```

- Middleware/verifyToken.js

```javascript

```

