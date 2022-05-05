# Manejo de Archivos

## Objetivos

- Aprender a manejar archivos (imágenes, pdfs, archivos de texto, cvs, xls, word, etc.) desde el backend, empleando el mismo proyecto de api con MongoDB trabajado hasta el momento.

- Analizar distintos escenarios para el almacenamiento de archivos, entendiendo ventajas y desventajas de cada escenario.

- Emplear Firebase Storage para el almacenamiento gratuito de archivos, conectándolo a nuestro backend.

## Recursos recomendados

[https://googleapis.dev/nodejs/storage/latest/index.html](https://googleapis.dev/nodejs/storage/latest/index.html)

## Clase

Las aplicaciones hoy en día necesitan otorgar almacenamiento de imágenes, videos y/o documentos a nuestros usuarios dentro de la misma aplicación.

Como desarrolladores esto termina siendo un problema ya que necesitamos de un sistema o servicio lo suficientemente rápido y confiable que nos permita entregar estos contenidos de manera segura y eficiente.

Para este tipo de problemas existen soluciones que van desde guardar _chunks_ de datos en la base de datos hasta contratar servicios de almacenamiento en la nube.

Veamos las ventajas y desventajas de cada una de estas posibles opciones:

#### Almacenar archivos en Base de Datos

Muchas bases de datos (como MongoDB, MySQL, PostgreSQL, etc) soportan múltiples formatos para el almacenamiento de archivos, como el tipo de dato **BLOB (Binary Large Object)**, que nos permite almacenar datos de gran tamaño de forma dinámica.

- **Ventajas**
1. Acceso directo al archivo desde la Base de Datos
2. Son útiles para archivos pequeños (tamaño en Kb)
3. El formato BLOB es soportado por todas las bases de datos, por lo que su migración es sencilla.

- **Desventajas**
1. El tamaño de la base de datos aumenta exponencialmente conforme más usuarios agrueguen más archivos/imágenes a la aplicación.
2. Las consultas se vuelven más pesadas, por lo tanto más lentas.
3. Al pasar el tiempo termina siendo mucho más costoso mantener la base de datos.
4. Requiere doble procesamiento para que el servidor vuelva a convertir todos los archivos del tipo de dato almacenado al formato original.

#### Almacenar archivos en el servidor de aplicación

Podemos guardar archivos en el mismo servidor donde nuestro backend está montado. Servicios de infraestructura como servicio (IaaS) nos permiten almacenar ficheros de forma dinámica en nuestros servidores (por ejemplo EC2 o Compute Engine).

- **Ventajas**
1. Permite guardar un gran cúmulo de datos sin forzar la base de datos.
2. Es muy común emplearlo en pruebas durante el desarrollo de aplicaciones.

- **Desventajas**
1. Aumentan las necesidades de HDD (Hard Disk Drive) de nuestro servidor, aumentando así el precio del mismo
2. Se necesitan hacer **Backups** de manera manual.
3. Es peligro, ya que se puede enviar software malicio al servidor.
4. Puede afectar considerablemente el rendimiento de nuestro backend.

#### Guardar archivos en servicios especializados "Buckets"

Una de las mejores opciones al hablar de almacenamiento de archivos es utilizar opciones especializadas de Paas (Platform as a Service) como: S3 de AWS, Cloud Storage de Google, Firebase Storage o Cloudinary (este solo para imágenes y videos)

###### S3 (Servicio de Amazon web Services)

Es una gran plataforma para crear aplicaciones, subirlas a producción, almacenar archivos y demás, pero no es tan sencillo crear una cuenta porque debe estar ligada a una tarjeta de crédito desde el principio.

###### Google Cloud Storage (Servicio de Google Cloud Platform)

Es la contraparte de Google Cloud Platform al servicio S3 de AWS. También es un excelente servicio pero tiene el mismo tipo de complejidades iniciales que S3 al crear una cuenta.

###### Firebase Storage

Es muy sencillo de crear una cuenta e inicializarlo, además de que otorga un modo gratuito muy útil para comenzar a trabajar.

###### Cloudinary

Un gran servicio que también es increíblemente sencillo de inicializar y empezar a usar, junto con un gran rango de espacio gratuito. La única desventaja de este servicio es que solo funciona para archivos multimedia como imágenes y videos.

- **Ventajas**
1. Muchos de estos servicios pueden emplearse de manera gratuita, con ciertas restricciones. Por ejemplo:

- S3 ofrece hasta 20 GB por un año al crear una cuenta nueva.
- Cloud Storage permite el envio de 5GB por mes de forma gratuita.
- Firebase Storage otorga hasta 1 GB de almacenamiento y 50,000 lecturas de documentos al día.
- Cloudinary ofrece almacenamiento ilimitado, pero solo se pueden procesar hasta 25GB al mes.

2. Hacen backups automáticos, además pueden ser programables.
3. Permiten manejar cualquier tipo de archivo y tamaño del mismo.
4. En muchos casos no es necesaria la interveción del backend para el envío de estos archivos.
5. Solo se necesita guardar la URL del recurso en nuestra base de datos.
6. Mayor seguirdad y disponibilidad.

- **Desventajas**

1. Problemas de red pueden causar problemas al enviar archivos.
2. Para crear una cuenta se necesita ingresar una forma de pago (excepto con Cloudinary y Firebase).
3. No es recomendable usarlo en desarrollo y pruebas.

#### ¿Cómo enviar archivos al servidor?

Imaginemos que deseamos enviar un pdf desde el cliente hacia nuestro servidor, para que este sea almacenado posteriormente en un servicio en la nube, se nos otorgue una url y esta la almacenemos en nuestra base de datos.

###### multipart/form-data

Acá no necesariamente emplearemos un json. Aquí el cliente enviará la petición con un `content-type: multipart/form-data`. Este permite el envío de archivos al servidor a través de un simple formulario de HTML.

Debemos tomar en cuenta que tiene ser a través del método HTTP `POST`. Debemos agregar el atributp `enctype = "multipart/form-data" al formulario HTML para que el archivo sea **enviado por partes** al servidor. Finalmente el servidor se encarga de recibir cada una de las partes para procesarla o almacenarlas según se requiera.

Así, cuando el cliente envía el PDF al servidor, este se envía a través de un `POST` con `multipart/form-data`. Se mandan los _chunks_ del archivo para los reciba el servidor.

###### Base64

Otra forma de enviar archivos al servidor es convertir una imagen a una cadena de texto en **Base64**. Esto es de gran utilidad cuando tratamos con archivos muy pequeños. La consecuencia de emplar b64 es que se necesita procesamiento tanto del lado del cliente como del lado del servidor para transformar la imagen.

#### Manos a la obra

Vamos a emplear **Firebase Storage** de Google. Empecemos creando una cuenta en Firebase ingresando a [firebase.google.com](https://firebase.google.com/). Una vez creada la cuenta, ingresamos a **Go to console** en la esquina superior derecha.

En la consola de Firebase deberías ver algo como esto:

![Instrucciones Firebase Paso 1](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_1.png)

Hacemos click en "Add project" para crear un nuevo proyecto, con el nombre que deseemos. Hacemos click en "I accept the Firebase terms" y damos en "Continue".

![Instrucciones Firebase Paso 2](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_2.png)

En la siguiente pantalla, desactivamos la opción de Google Analytics, ya que puede incurrir en costos extra para el proyecto. Damos en "Create project".

![Instrucciones Firebase Paso 3](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_3)

Una vez que el proyecto esté listo, serás dirigido a la página principal de administración de tu proyecto. Puedes echar un ojo acá a todas las opciones que ofrece Firebase. Esencialmente provee de todo tipos de opciones para fungir como un Backend as a Service.

![Instrucciones Firebase Paso 4](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_4)

Al final de esta página, haciendo scroll hacia abajo, encontrarás la opción "See all Firebase features". Hacemos click acá. Serás redirigido a la siguiente pantalla:

![Instrucciones Firebase Paso 5](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_5)

En esta pantalla hacemos click en "Storage" para dirigirnos a la sección de almacenamiento de archivos en la nube.

![Instrucciones Firebase Paso 6](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_6)

Acá damos click en "Get Started". Aparecerá un menú emergente con opciones de configuración. Dejamos los valores predeterminados, y damos en siguiente en cada pantalla hasta crear nuestro bucket.

Debería de mostrarte una pantalla como la siguiente:

![Instrucciones Firebase Paso 7](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_7)

 **De esta pantalla nos interesa tomar la url de nuestro bucket, esta será utilizada más adelante en un archivo `storage.js`**.

En una nueva ventana, accedemos nuevamente a Firebase, y en la barra lateral izquierda, hacemeos click en el engrange, a lado de "Project Overview", en el menú desplegable hacemos click en "Project Settings"

![Instrucciones Firebase Paso 8](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_Firebase_8)

En esta pantalla de Project Settings encuentras tu "Project ID". Este valor lo necesitarás más adelante en un archivo `storage.js`, donde colocarás tus credenciales para conectarte a Firebase desde el backend.

#### Instalación de paquetes

Para utilizar nuestro storage de Firebase desde el backend, pasemos a realizar algunas configuraciones necesarias.

Abrimos nuestro servidor de `api_mongodb` con el que hemos trabajado en sesiones previas. Instalamos las siguientes librerías:

```JavaScript
npm install @google-cloud/storage firebase multer

// firebase para manejar credenciales de firebase
// google-cloud/storage para conectarnos al storage de firebase
// multer es un middleware para manejar los archivos que recibes del cliente
```

Una vez instalados, agregamos [multer](https://www.npmjs.com/package/multer) para utilizarlo en cualquier lugar de nuestro servidor.

Para esto, creamos una carpeta `/middlewares` y dentro creamos un archivo `multer.js`. Este archivo servirá para obtener una instancia configurada de multer y utilizarla como middleware en las rutas donde deseemos manejar archivos que envíe el cliente al hacer peticiones:

```JavaScript
// /middlewares/multer.js

const multer = require('multer');

const multerInstance = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

module.exports = multerInstance;

```

Posteriormente creamos una carpeta `/utils` y dentro creamos un archivo `storage.js` donde manejaremos la configuración para conectarnos a nuestro storage de firebase:

```JavaScript
// /utils/storage.js

const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: "", // Desde Firebase
  keyFilename: "", // Desde GCP
});

const bucket = storage.bucket(""); // Desde Firebase

module.exports = (file) => {

};
```

Ahora necesitamos obtener el `keyFilename` desde Google Cloud Platform para llenar las credenciales del archivo de arriba.

#### Obtener keyFilename desde Google Cloud Platform

Para llenar los campos de nuestro archivo `storage.js` primero debemos crear una clave de cuenta de servicio desde Google Cloud Platform, ingresando acá: [https://cloud.google.com/iam/docs/creating-managing-service-account-keys?hl=es](https://cloud.google.com/iam/docs/creating-managing-service-account-keys?hl=es)

En esta sección buscamos el botón "Ir a Cuentas de Servicio", como se muestra en la imagen a continuación. Hacemos click.

![alt text](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_GCP_1)

Una vez dentro, hacemos click en "Seleccionar Proyecto".

![alt text](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_GCP_2)



Nos mostrará un menú emergente donde debemos buscar el proyecto de Firebase que recién creamos por nombre. Por ejemplo, si tu proyecto de Firebase lo llamaste `master-en-code`,  entonces con esta barra de búsqueda deberías de encontrar el mismo proyecto.


![alt text](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_GPC_new_1)

Seleccionamos "Abrir". Una vez dentro de nuestro proyecto, debe aparecernos dos cuentas de servicio ya generadas por los pasos previos automáticamente desde Firebase:

![alt text](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_GCP_new_2)


Podrás notar que debajo de la columna "Key ID" de la tabla, aparece el mensaje "No Keys" "No hay claves".

Para crear nuestra key, usaremos la cuenta de servicio con nombre **"App Engine default service account"** hacemos click sobre los tres puntos para desplegar opciones adicionales, al final de la fila donde aparece la cuenta de servicio recién creada.

Estos tres puntitos aparecen en la columna "Actions" de la tabla que se muestra. En este menú desplegable hacemos click en "Administrar claves".

![alt text](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_GCP_Keys.png)

En la pantalla de administración de claves, hacemos click en "Agregar clave", y luego en "Crear clave nueva".

![alt text](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_GCP_7)

Seleccionamos clave de tipo JSON.

![alt text](https://storage.googleapis.com/campus-cvs/guia-senseis/07_25_GCP_8)

Al crear la clave, te aparecerá una pantalla emergente para descargar el archivo `.json` donde se encuentran tus claves de acceso. El archivo descargado puedes arrastrarlo a Visual Studio Code para visualizarlo más cómodamente.

Obtendrás un archivo como el siguiente:

```JavaScript
// Archivo json con claves de Google Cloud Platform
{
  "type": "service_account",
  "project_id": "white-position-315023",
  "private_key_id": "ca6207b2f5a02ad1b2d8a2e505a720dce65a0977",
  "private_key": "-----BEGIN PRIVATE KEY-----\nadshasdhasdh=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase@...",
  "client_id": "100...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase...."
}
```

Este archivo debemos agregarlo a nuestro proyecto de backend. Podemos crear un archivo `service.json` y dentro pegar el contenido recibido en el `.json`.

**_Nota: Es muy importante agregar el `service.json` a nuestro archivo `.gitignore` para que no subir estas claves importantes a nuestro repositorio_**.

#### Configurar el archivo `storage.js`

```JavaScript
// /utils/storage.js

const { Storage } = new require('@google-cloud/storage');

const storage = new Storage({
    projectId: "masterencode-1ab9f", // Desde Firebase Config
    keyFilename: "service.json" // Archivo descargado desde Google Cloud
});


// Nota: si la url es algo como gs://master-en-code.appspot.com, acá la ponemos sin el "gs://" inicial
const bucket = storage.bucket("master-en-code.appspot.com"); // Desde la sección de Storage en Firebase

module.exports = (file) =>{

    return new Promise((resolve,reject) => {
        if(!file) reject("No hay ningun arhivo");

        const newFilename = `${file.originalname}_${Date.now()}`; // esto va a renombra el archivo

        const fileUpload  =  bucket.file(newFilename); // voy a crear un nuevo archivo

        /*
          Opcional: cómo podrías validar tipos de archivo
        */
        /*
          const valid_mimetypes = ['image/jpeg', 'image/png']
          if(valid_mimetypes.indexOf(file.mimetype) === -1) reject('Es necesario enviar un tipo valido')
        */

        const blobStream =  fileUpload.createWriteStream({ //stream de datos le voy a mandar los pedicitos de mi archivo
            metadata: {
                contentType: file.mimetype  // que tipo de archivo es el que te voy a mandar
            }
        })

        blobStream.on('error', (error) => {
            reject(error)
        }) // si pasa un error la promesa debe regresar un error

    
        blobStream.on('finish',() =>{
            const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media`
            resolve(url)

        }) // si todo sale bien regresame la url de mi archivo

        blobStream.end(file.buffer); // aqui empiezo la transmision de datos del backend al bucket
    })

}


```

#### Incorporar la subida de archivos a un endpoint

Para que el cliente pueda hacer peticiones al backend y enviar archivos, necesitamos crear un `endpoint` o modificar alguno de nuestros `endpoints` ya creados para incorporar el middleware de multer que obtuvimos al generar una instancia y configurarla.

```javascript
// /routers/UserRouter.js

...

router.post('/users', [mult.single('profile_pic'), UserValidator.create], UserController.create);

...
```

En el controlador incorporamos la lógica para emplear el archivo procesado por multer, en caso de haber uno recibido del cliente.

```javascript
const mongoose = require('mongoose');
const { User } = require('../models/User');
const { Post } = require('../models/Post');
const storage = require('../utils/storage.js');

module.exports = {
  create: async (req, res) => {
    try {
      /**
       *  Lógica para recibir `req.file` desde el middleware de multer, 
       *  subir el archivo a Firebase, recibir la URL del almacenamiento en la nube,
       *  y agregarla al `req.body` para que se almacene en nuestra base de datos.
      */  
      if (req.file) {
        const url = await storage(req.file);
        req.body.profile_pic = url;
      }
      const newUser = await User.create(req.body);
      res.status(201).json({ message: 'user created', user: newUser }); 
    } catch (error) {
      res.status(400).json({ message: 'error creating user', error });
    }
  },
  ...
}
```

#### Probar la subida de archivos desde Postman/Insomnia

Para probar la subida de archivos, desde un cliente HTTP como Postman, haz una petición de tipo `POST` sobre el endpoint `/users`.

En `body` al construir tu petición, elige la opción `form-data` y llena los datos como usualmente harías, poniendo cada clave del `body` a enviar, con la diferencia de que debes agregar un campo `profile_pic` donde cambies el tipo de dato a `file`.

Esto te arroja una opción para seleccionar un archivo de tu computadora y adjuntarlo al `body` de la petición.

Comprobamos que al crear un nuevo usuario, con una imagen que nosotros asignamos manualmente en el `body`, nos devuelve una respuesta la base de datos con el campo `profile_pic` conteniendo una `url` de la imagen almacenada en Firebase.

Sin embargo, **no contaremos con permisos para ver la imagen accediendo desde la url provista por Firebase**. Para esto, necesitamos modificar las reglas (rules) en la configuración de Firebase Storage.

#### Modificar reglas de Firebase Storage para acceso público

Para acceder a la imagen de forma pública es necesario modificar las reglas de Firebase Storage.

Agregamos en `Rules` dentro de la sección de Storage el siguiente código de reglas, solo es agregar una línea de reglas adicional:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
      allow read: if request.auth == null;
    }
  }
}

```

Si intentas acceder nuevamente a la url almacenada en tu base de datos, que apunta a Firebase Storage, ya debería darte acceso de manera pública.

#### Guardar archivos localmente en desarrollo

Como comentamos al inicio, **no es recomendable guardar imágenes en Firebase cuando trabajamos en entorno de desarrollo**. Para esto es mejor guardar los archivos localmente, si solo estamos haciendo pruebas.

Para esto agregamos un `middleware` que revise el entorno de desarrollo en el que estemos. Si estamos trabajando en `NODE_ENV=production`, subiremos los archivos a Firebase Storage.

De lo contrario, los archivos serán almacenados en nuestro servidor, localmente.

Primero debemos crear a nivel raíz de nuestro servidor una carpeta `/uploads`. Aquí se guardarán los archivos al trabajar en entorno de desarrollo, es decir cuando `NODE_ENV!==prodution`.

Posteriormente dentro de la carpeta `/middlewares` dentro creamos un archivo `manageFiles.js`:

```javascript
// /middlewares/manageFiles

const uploadImage = require('../utils/storage');
module.exports = (req,res,next) => {

    if(process.env.NODE_ENV === "production"){
        if(!req.file) return next()
        const url = uploadImage(req.file);
        req.body.profile_pic = url;
    }else{
        if(!req.file) return  next();
        req.body.profile_pic = `${req.protocol}://${req.host}/${req.file.path}` // en path viene la ubicacion de mi archivo dentro de mi servidor 
    }
    next();
}
```

En nuestro archivo `/utils/multer.js` agregamos la siguiente validación para guardar los archivos localmente **cuando NO estemos en `NODE_ENV=production`**


```JavaScript
// /middlewares/multer.js

const multer = require('multer');

const storage = process.env.NODE_ENV === "production" 
? multer.memoryStorage() 
: multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'uploads')
    },
    filename: function(req,file,cb){
        cb(null,`${Date.now()}_${file.originalname}`)
    }
})

const multerInstance = multer({
  // storage: multer.memoryStorage(),
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  }
});

module.exports = multerInstance;

```

En los endpoints/rutas donde manejaremos la subida/modificación de la `profile_pic` de nuestro usuario, incorporamos el uso del middleware `manageFiles`:

```javascript

// /routers/UserRouter.js

app.post('/users', [mult.single('profile_pic'), manageFiles], UserController.create);

app.patch('/users/:id', [mult.single('profile_pic'), manageFiles], UserController.update);

```

Finalmente, eliminamos la lógica del controlador que sube el archivo a Firebase Storage

```javascript
// /controllers/UserController.js
...

create: async (req, res) => {

  try {

    /*
    // Eliminamos esta sección del código del controlador, ahora se maneja desde el middleware
    if (req.file) {
      const url = await storage(req.file);
      req.body.profile_pic = url;
    }
    */

    const newUser = await User.create(req.body);
    res.status(201).json({ message: 'user created', user: newUser }); 
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'error creating user', error });
  }
},
```

Fin.
