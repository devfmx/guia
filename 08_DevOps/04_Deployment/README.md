# Deployment
---

## Objetivos

- Entender qué implica hacer deployment de nuestras aplicaciones
- Conocer las distintas opciones para hacer deployment
- Hacer deployment de una aplicación en Heroku

## Clase

Para entender el proceso de subir el código a producción, es **fundamental** comprender cómo funcionan los **Modelos de servicios Cloud** con los que podemos trabajar.

Para esto podemos emplear la presentación XYZ.ABC.123

#### Servicios Cloud

- Software as a Service (SaaS)

Es software que puedes contratar como un servicio. Figma, Wix, Miro, Shopify, todos son SaaS. Es software pensado y creado por personas que buscan solucionar problemas concretos, y los ponen a disposición de usuarios en internet para poder ocuparlo.

Usuarios finales de todo tipo son quienes utilizan Saas.

- Platform as a Service (PaaS)

Es un entorno completo para el desarrollo y deployment en la nube. Netlify, Heroku, algunas partes de Firebase, todos son PaaS. Las PaaS están diseñadas para soportar todo el ciclo de vida de una aplicación web: build, test, deploy, manage and update. Así tu te encargas de las aplicaciones y servicios que tú desarrollas, y el proveedor del servicio cloud típicamente se encarga de todo lo demás.

Desarrolladores web son quienes trabajan con PaaS.

- Infraestructure as a Service (IaaS)

Las IaaS son un mundo entero, que requiere su propio estudio, en comparación con las PaaS que son plataformas sencillas y relativamente fáciles de aprender a utilizar para desarrolladores web. Azure, AWS, GCP todas son IaaS. Aquí solo se te ofrece la infraestructura necesaria para crear y montar tus propias instancias, pero d

Sysadmins y Arquitectos de red suelen ser quienes trabajan con IaaS.

Como regla general:

- Si ya está hecho es SaaS
- Si me permite montar mi aplicación es PaaS
- Si tengo que configurar todo a mano es IaaS

#### Deployment en Heroku (PaaS)

Haremos el deployment de una aplicación mediante la PaaS [Heroku](https://www.heroku.com/home). Si no tenemos una cuenta aún, nos registramos y creamos una nueva cuenta.

###### Heroku CLI

Instalamos la [CLI de Heroku](https://devcenter.heroku.com/articles/heroku-cli), siguiendo las instrucciones según el sistema operativo que usemos.

_Nota: En Windows puede ser necesario reiniciar la terminal o incluso reiniciar la computadora para que se reflejen._

Una vez instalada la CLI podemos verificar la instalación checando la versión de heroku instalada, o simplemente escribiendo el comando `heroku` en terminal.

```terminal
$ heroku --version
$ heroku
```

Procedemos a hacer login con nuestra cuenta de Heroku escribiendo en terminal `heroku login`. Este comando abrirá una pestaña de tu navegador para iniciar sesión y autenticarte para poder crear proyectos de Heroku desde la terminal. 

```terminal
$ heroku login
```

###### Deployment

Para desplegar una aplicación de Node.js en Heroku puedes seguir la [documentación oficial](https://devcenter.heroku.com/articles/deploying-nodejs).

Para desplegar una aplicación en Heroku, necesitamos:

1. Un proyecto o una aplicación previamente escrita
2. Tener este proyecto en un repositorio de Github

Utilizaremos el proyecto `api_nosql_db` que creamos en sesiones pasadas.

Es preferible copiar el proyecto en un nuevo directorio, y este directorio volverlo un repositorio y subirlo a Github.

Una vez que tengamos un proyecto listo en Github, nos colocamos con una terminal sobre el directorio del proyecto y ejecutamos el comando

```terminal
$ heroku create nombre-de-mi-app-en-heroku
```

_Nota: todos los nombres de apps de heroku son únicos. Si ya está usado el nombre que escribas, deberás elegir otro_

El comando `heroku create` está creando un nuevo proyecto vacío en Heroku. Para subir nuestro código a producción ejecutamos

```terminal
$ git push heroku master
```

De esta forma subiremos el código en nuestra rama hacia el remoto de Heroku, que es quien despliega la app en la nube.

###### Precios de Heroku

Para entender los precios de Heroku al montar una aplicación, es necesario hablar de los [Dynos](https://www.heroku.com/dynos) de Heroku.

En esencia, los Dynos son los bloques fundamentales sobre los que cada aplicación corre. En la versión gratuita puedes utilizar un Dyno de forma gratuita para cada proyecto.