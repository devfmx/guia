# Validators

## Objetivos

- Entender qué son y para qué funcionan los validators.
- Instalar `celebrate` para el manejo de validaciones a través de `joi`.
- Crear un nuevo directorio `/validators` para nuestros validators.
- Crear los validators de los endpoints ya existentes.

## Recursos recomendados

https://www.npmjs.com/package/celebrate

https://joi.dev/api/?v=17.4.0#introduction

https://www.digitalocean.com/community/tutorials/how-to-use-joi-for-node-api-schema-validation

## Clase

Instalamos `celebrate` para crear una capa de validaciones adicional en nuestro servidor.

`npm i celebrate`

Una vez instalado, creamos un directorio `/validators` donde haremos el mismo esquema de tener un `index.js` para exportar validators, y tener cada archivo de validator por tabla por separado.

Creamos nuestro primer archivo de validator para validar el `login` que creamos la clase anterior:

```javascript
// /validators/UserValidator.js

const { celebrate, Joi, Segments } = require('celebrate');

module.exports = {
  login: celebrate({
    [Segments.BODY]: Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
};
```

Creamos un index.js para importar/exportar los validators fácilmente:

```javascript
// /validators/index.js

const UserValidator = require('./UserValidator');

module.exports = {
  UserValidator,
};
```

Ahora agregamos el `validator` como un middleware adicional en nuestro endpoint de `login`:

```javascript
// /routers/UserRouter.js

const express = require('express');
const router = express.Router();

const { UserController } = require('../controllers');
const { UserValidator } = require('../validators'); // Traemos el validator requerido

// Create
router.post('/users', UserController.create);

...

// Login
router.post('/login', UserValidator.login, UserController.login); // Agregamos el validator como middleware

module.exports = router;
```

Finalmente incorporamos el manejador de errores de `celebrate` desde nuestro `index.js` de todo el proyecto:

```javascript
// index.js

const express = require('express');
const app = express();
const { errors } = require('celebrate'); // Traemos el middleware de errores de celebrate
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => res.status(200).json({ message: 'Hello World' }));

app.use('/api/v1', require('./routers'));

api.use(errors()); // Configuramos el manejador de errores de celebrate

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
```

Probamos haciendo login desde postman/insomnia y veremos la respuesta automática de `celebrate` cuando no se cumplen las reglas impuestas por los validators.

## Actividad

Crear los validators restantes para nuestros endpoints de `users` y `rentals`.

#### Solución

```javascript
// /utils/index.js


```

