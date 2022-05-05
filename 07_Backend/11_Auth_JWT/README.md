# Authentication

## Objetivos

- Entender qué es, cómo funciona y por qué es importante contemplar la **autenticación** en una aplicación web. 

- Modificamos el  controlador de **creación de usuarios**, para incorporar el **hasheo de contraseñas**.

- Al final de esta sesión lxs estudiantes implementan un endpoint para el **inicio de sesión**, construyendo todo lo necesario.

## Recursos recomendados

 https://danielmiessler.com/study/encoding-encryption-hashing-obfuscation/

https://codahale.com/how-to-safely-store-a-password/

## Clase

#### Presentación

Comienza la clase con la presentación "Autenticación" del módulo de Backend. Es útil acá recordar los procesos de autenticación que construimos del lado del cliente anteriormente con React en el proyecto de supermercado, obteniendo un JWT.

#### Opciones populares de Auth as a Service:

- Auth0
- Okta 
- Cognito
- Authy (2-factor auth)
- Twilio (sms/phone call auth)

#### Tipos de Auth

- Basic Auth

Entra a la página https://www.base64decode.org/ donde puedes encodificar a base64 o decodificar de base64. Intenta con el formato del basic auth, donde escribes `user:password`,  por ejemplo `maui:abc123`

Explica brevemente qué es codificar vs decodificar. Por qué es necesario en ejemplos comunes. Lectura altamente recomendada para entender mejor la encodificación: https://danielmiessler.com/study/encoding-encryption-hashing-obfuscation/

- OAuth2

Puedes mostrar un ejemplo de autenticación Auth0 a través de https://pinterest.com/ desde una ventana de incógnito en tu navegador. Al hacer login, te muestra un formulario donde puedes iniciar sesión con tu cuenta de facebook o con tu cuenta de google.

- Json Web Tokens (JWT)

Es el que emplearon para autenticarse con el proyecto de e-commerce, del módulo de frontend.

- API Keys
- API Token
- HMAC

#### Manos a la obra

Continuanos trabajando con el proyecto de knex. Se instalan dos dependencias:

- bcrypt
- jwt

`npm i bcrypt jwt`

Una vez instalados los paquetes, creamos una nueva migración con `knex migrate:make add_password_user`. En esta migración agregaremos las columnas `password` y `role` a nuestra tabla de `users`.

```JavaScript

exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.string('password').nullable();
    table.string('role').nullable(); // Como ya tenemos registros, debemos ponerlos 'nullable'
  })
}

exports.down = function(knex) {

}

```

ejecutamos esta última migración con `knex migrate:latest`

Ahora debemos incorporar la funcionalidad de crear usuarios con contraseñas en nuestro backend. Algo vital acá es **hashear** las contraseñas antes de almacenarlas en la base de datos.

#### Hasheo de Passwords

Creamos un nuevo util `/utils/hashPassword.js` cuya única responsabilidad será hashear passwords. Acá empleamos el paquete de [bcrypt](https://www.npmjs.com/package/bcrypt)  que instalamos al inicio.

```javascript
// /utils/hashPassword.js

const bcrypt = require('bcrypt');
const SALT_FACTOR = 10; // La salt ayuda a generar una string aleatoria

/*
	Para entender el salt:
	Imagina que dos usuarios ocupan la misma contraseña "123". Sin un salt factor de por medio,
	el hash de encriptación que se generaría de ambas contraseñas sería el mismo.
	
	Así generamos hashes únicos.
	
	Te recomiendo buscar sobre "rainbow tables".
*/

module.exports = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
      // HS256 --> WPA2
      if(err) reject(err);
      resolve(hash);
    })
  })
}

```

Ya teniendo esta nueva utilidad, podemos modificar el `userController.js` para incorporar el hasheo de contraseñas

```javascript
// /controllers/userController.js

const createUser = async (req, res) => {
  if (req.body.password) { // Si el body trae una contraseña
    // Intercambiamos la contraseña por el hash, para almacenar el hash
    req.body.password = await hashPassword(req.body.password);
  }
  // ...
}

// ...
```

 Probamos creando un nuevo usuario desde Postman/Insmonia agregando el campo de contraseña al json de la petición. Ahí veremos que en la base de datos se almacena la contraseña **hasheada**.

#### Login de Usuario

Para lograr un login, es necesario construir un endpoint que nos permita recibir el **email** y **constraseña** de un usuario. Aquí dejamos como actividad implementar el login. Después de al menos 30 minutos para avanzar en esta implementación por su cuenta, compartimos la solución.

## Actividad

Escribir el código necesario para incorporar el manejo de  `login` para los usuarios. Como base revisa la siguiente pseudológica del controlador encargado de llevar el login:

```javascript
// /controllers/userController.js

const login = async (req, res) => {
  // Primero verificar que existe el usuario en la base de datos
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send();
  // 	Segundo, si el usuario existe. Revisar que la contraseña que proporciona sea correcta
  const isMatch = await Utils.comparePasswords(req.body.password, user);
  if (!isMatch) return res.status(403).send();
  // Tercero, si las contraseñas coinciden, generamos un JWT y respondemos con este
  const token = generateJWT(user);
  return res.status(200).json({ token });
}
```

Para resolver esto, puedes apoyarte de la documentación de `bcrypt` y `jsonwebtoken`.

https://www.npmjs.com/package/bcrypt

https://www.npmjs.com/package/jsonwebtoken

#### Solución

Comenzamos armando el esqueleto de toda la lógica que debemos construir, muy similar al ejemplo que tenemos en el código de arriba. Hacemos énfasis en dividir el problema en partes e irlo resolviendo por partes. ***(divide y vencerás)***

```javascript
const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		// 1) ¿Está registrado el usuario?

		// 2) ¿La contraseña es la correcta?

		// 3) Generar un JWT

    return res.status(200).json({ message: 'ok' });
  } catch (error) {
    return res.status(500).send({ error });
  }
};
```

**Primero** resolvemos cómo saber si el usuario está registrado o no.

Creamos un método nuevo general en nuestra util de `createModelKnex` que nos permita pasar cualquier query y columnas que querramos seleccionar. De esta forma podemos acoplarlo al controller que se muestra arriba, y también tenemos disponible este método flexible en todas nuestras demás tablas:

```javascript
// /utils/createKnexModel.js

function createKnexModel(knex, tableName, tableColumns, tableId) {
  ...
  
  // Find genérico
  // query -> { email: 'randy@gmail.com'}
  const find = (query, columns) => {
    return knex
      .select(columns)
      .from(tableName)
      .where({ ...query, is_active: true });
  }

  return {
    create,
    find,	// Exportamos el nuevo find
    findAll,
    findOneById,
    updateOneById,
    deleteOneById,
  }

}

module.exports = createKnexModel;
```

Enseguida adaptamos el controller a este nuevo método:

```javascript
// /controllers/userController.js

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
     // 1) ¿Está registrado el usuario?
    const [user] = await User.find(
      { email: email },
      ['user_id', 'first_name', 'last_name', 'email', 'password'],
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ user: user });

    // 2) ¿La contraseña es la correcta?

    // 3) Generar un JWT 
  } catch (error) {
    return res.status(500).send({ error });
  }
};

```

**Segundo** debemos comparar la contraseña que recibimos mediante `req.body` con el hash que tenemos almacenado en nuestra base de datos, en el registro de usuario. Es decir hay que comparar de alguna forma `req.body.password` con `user.password`.

Para esto generamos una util con `bcrypt`para comparar las contraseñas. La misma documentación de `bcrypt` explica cómo implementar este método:

```javascript
// /utils/comparePasswords.js

const bcrypt = require('bcrypt');

module.exports = (reqPassword, dbPassword) => {
  return bcrypt.compare(reqPassword, dbPassword);
};

```

Modificamos el controlador para incorporar la verificación de contraseña:

```javascript
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
     // 1) ¿Está registrado el usuario?
    const [user] = await User.find(
      { email: email },
      ['user_id', 'first_name', 'last_name', 'email', 'password'],
    );
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // 2) ¿La contraseña es la correcta?
    const isMatch = await Utils.comparePasswords(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    return res.status(200).json({ user, isMatch });

    // 3) Generar un JWT 
  } catch (error) {
    return res.status(500).send({ error });
  }
};
```

**Finalmente** generamos el Json Web Token a partir de la data de usuario que obtuvimos en el primer paso.

Para esto necesitamos crear una util que nos permita generar un jwt a partir de un objeto con datos. La implementación puede encontrarse en la documentación de `jsonwebtoken`:

```javascript
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'mipasswordultrachido'; // Estos datos sensibles deberán ocultarse con variables de entorno

// Des-estructuramos los datos inmediatamente desde el argumento de la función
module.exports = ({ user_id, first_name, last_name, email }) => {
  return jwt.sign({
    // exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expira en una hora
    data: { user_id, first_name, last_name, email },
  }, JWT_SECRET, { expiresIn: '48h' }); // Otra sintaxis de expiración
};

```

Ajustamos el controlador para incorporar la creación y envío del token al cliente:

```javascript
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
     // 1) ¿Está registrado el usuario?
    const [user] = await User.find(
      { email: email },
      ['user_id', 'first_name', 'last_name', 'email', 'password'],
    );
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // 2) ¿La contraseña es la correcta?
    const isMatch = await Utils.comparePasswords(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // 3) Generar un JWT
    const token = await Utils.generateToken(user);
    return res.status(200).json({ token });
    
  } catch (error) {
    return res.status(500).send({ error });
  }
};
```

