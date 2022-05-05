# Authentication Middlewares

## Objetivos

Crear middlewares que faciliten la verificación de un token en rutas protegidas. Para esta sesión:

1. Se explica qué es un middleware con un ejemplo sencillo.
2. Se generan los middlewares `verifyToken` y `checkRole`.
3. Se agregan los middlewares a algunas rutas para probar su funcionamiento.

## Recursos recomendados

https://expressjs.com/en/guide/using-middleware.html

https://medium.com/@selvaganesh93/how-node-js-middleware-works-d8e02a936113

## Clase

Comenzamos creando un directorio `/middlewares` donde colocaremos nuestro primer middleware que, para todas las peticiones entrantes, mostrará en consola un timestamp:

```javascript
module.exports = {
  /* 
    Un middleware es aquella función
    que tiene acceso a los objetos 
    req y res.

    Así el middleware puede modificar o validar
    datos que aparezcan en estos objetos y 
    responder inmediatamente al cliente.
  */
  showTime: (req, res, next) => {
    console.log('Timestamp: ', Date.now());
    next();  
    /*
    	Al ejecutar 'next()' se pasa al siguiente middleware, y así sucesivamente
    	hasta que se le responda al cliente o termine la ejecución.
    */
  },
} 
```

Incorporamos este middleware en index.js antes de todas las rutas de nuestra aplicación:

```javascript
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/*
	Un middleware es una funcion que tiene acceso a y puede manipular los objetos 'req' y 'res'.
	Estos se emplean para ejecutar cosas miscelaneas, modificar el req, validar datos,
	parámetros, parámetros de query, etc.
	
	En teoría, los controllers que hemos escrito SON middlewares porque cumplen con esta
	definición. Sin embargo les seguiremos llamando controllers ya que se encargan de algo
	muy particular, y los middlewares se emplean para casos más generales o que afectan a una
	mayor cantidad de endpoints.
*/

/*
  Podemos utilizar middlewares personalizados que afecten a todos los endpoints
*/
// const { showTime } = require('./middlewares');
// app.use(showTime);

/*
  O podemos utilizar middlewares directamente en un endpoint
*/
// const { showTime } = require('./middlewares');
// app.get('/', showTime, (req, res) => res.status(200).json({ message: 'Hello World' }));

app.get('/', (req, res) => res.status(200).json({ message: 'Hello World' }));

app.use('/api/v1', require('./routers'));

console.log('Entorno:', process.env.NODE_ENV);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
```

Probamos su funcionamiento haciendo peticiones a cualquier endpoint y visualizando en la consola de nuestro servidor los mensajes que imprime el middleware.

Como ejemplo adicional, podemos ver que si agregamos uno o varios middlewares frente a nuestro middleware de `showTime` estos se ejecutan en serie, uno después del otro, gracias al método `next()`.

```javascript
app.use(function (req, res, next) {
  console.log('Request URL:', req.originalUrl)
  next()
}, function (req, res, next) {
  console.log('Request Type:', req.method)
  next()
})

```

Una vez entendido qué es y cómo funciona un middleware, pasamos a crear nuestros propios middlewares. Estos facilitarán la verificación de tokens en las peticiones que realizan los clientes, o que se verifique el rol del token suministrado por el cliente para administrar los permisos de acceso a ciertos recursos protegidos.

#### Middleware de verificación de tokens

Para proteger endpoints determinados de usuarios sin token, primero crearemos un middleware que verifique que el cliente tenga en cabeceras el token seteado correctamente:

```javascript
const JWT_SECRET = 'mipasswordultrachido'; // Estos datos sensibles deberán ocultarse con variables de entorno

module.exports = {
  showTime: (req, res, next) => {
    console.log('Timestamp: ', Date.now());
    next();
  },
  verifyToken: (req, res, next) => {
    try {
      const { authorization } = req.headers;
      // Bearer eyJhbGciOiJIUz9.eyJpZCI6IjVmMDN.jNTFkZWUw
      // authorization.split(' '); // -> [ "Bearer", "eyJhbG..."] -> [1] -> "eyJhbG..."
      const token = authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      // console.log(decoded);
      req.decoded = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Auth error', error });
    }
  },
} 
```

#### Manejo de middlewares en Routers

Para emplear el middleware de verificación de token, basta con agregarlo dentro del endpoint en el orden deseado:

```javascript
// /routers/UserRouter.js

const express = require('express');

const router = express.Router();
const { verifyToken } = require('../middlewares');
const controller = require('../controllers/userController');

router.post('/user', controller.createUser);
router.post('/user/login', controller.login);
router.get('/users', [verifyToken], controller.findAllUsers);
router.get('/user/:iduser', [verifyToken], controller.findOneUser);
router.patch('/user/:iduser', controller.updateOneUser);
router.delete('/users/:iduser', controller.delieOneUser);
router.delete('/user/:iduser', controller.destroyOneUser);

module.exports = router;
```

## Actividad

Crea un middleware que revise si el token suministrado por el usuario contiene el `role` necesario para poder visualizar un endpoint dado.

Por ejemplo, imaginemos que tenemos un endpoint como el siguiente:

```javascript
router.get('/users', [verifyToken, checkRole('admin')], controller.findAllUsers);
```

Si un usuario suministra mediante el header `Authorization` un token que contenga el role `admin`, se le permite hacer la consulta a este endpoint y se entrega la lista de usuarios en la base de datos. De lo contrario, se le responde con el mensaje `Permisos insuficientes para visualizar el contenido`.

Prueba que tu middleware funciona correctamente modificando `UserRouter.js` de la siguiente forma:

#### Solución

Crear un middleware que verifique a través de `req.user` que el role del usuario sea `ADMIN`.

Algo importante a considerar es que el verificador de roles debemos escribirlo de forma que pueda usarse en otros casos, donde en vez de `ADMIN` tengamos `CUSTOMER` o `GUEST`.

Puedes probar este nuevo middleware en los endpoints que acabamos de modificar.

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

Agregamos el uso del middleware a los endpoints deseados:

```javascript
// /routers/UserRouter.js

const express = require('express');

const router = express.Router();
const verify = require('../middlewares/verify');
const checkRol = require('../middlewares/checkRol');
const controller = require('../controllers/userController');

router.post('/user', controller.createUser);
router.post('/user/login', controller.login);
router.get('/users', [verifyToken, checkRole('admin')], controller.findAllUsers);
router.get('/user/:iduser', [verifyToken, checkRole('guest')], controller.findOneUser);
router.patch('/user/:iduser', controller.updateOneUser);
router.delete('/users/:iduser', controller.delieOneUser);
router.delete('/user/:iduser', controller.destroyOneUser);

module.exports = router;
```

Actualizamos la creación del token para incluir el campo `role` en el `payload` del token:

```javascript
// /utils/generateToken.js

const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mipasswordultrachido';

// Agregamos 'role' a la desestructuración
module.exports = ({ user_id, first_name, last_name, email, role }) => {
  return jwt.sign({
    // exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expira en una hora
    data: { user_id, first_name, last_name, email, role }, // Agregamos 'role'
  }, JWT_SECRET, { expiresIn: '48h' });
};

```

Y agregamos la columna de `role` al método que trae al usuario en el login:

```javascript
// /controllers/UserController.js

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [user] = await User.find(
      { email: email },
      // Acá incluímos la columna 'role'
      ['user_id', 'first_name', 'last_name', 'email', 'password', 'role'],
    );
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await Utils.comparePasswords(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = await Utils.generateToken(user);
    return res.status(200).json({ token });
    
  } catch (error) {
    return res.status(500).send({ error });
  }
};

```

