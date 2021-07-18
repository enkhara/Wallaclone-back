# Wallaclone-back

Las colecciones de la base de datos mongo son:
- users
- advertisements
## API Methods

La ruta base http://localhost:3001/ se deberá modificar en el .env para que apunte a dónde resida la aplicación de node, podemos dejar esta ruta para probarlo en entorno de desarrollo en local.
### ROUTES API

Las llamadas a la API se podrán realizar desde las siguientes rutas o routers:
## PUBLIC ZONE 
En la zona pública no es necesario agregar el token en la cabecera de las peticiones
### USER REGISTER: http://localhost:3001/apiv1/auth/signup

### USER LOGIN: http://localhost:3001/apiv1/auth/signin
### GET ADVERTISEMENTS: /apiv1/advertisements

Devuelve todos los anuncios definidos en la base de datos: http://localhost:3001/apiv1/advertisements
### GET ADVERTISEMENTS/:id => /apiv1/advertisements/:id

Devuelve el anuncio por id de la coleccion advertisements: http://localhost:3001/apiv1/advertisements/601fe467842fa20e151eab52
### GET /apiv1/advertisements con filtros en query params

Explicamos a continuación los distintos tipos de filtros que podemos aplicar en la ruta /apiv1/advertisements
- #### Resultado 

Un fichero en formato JSON que nos muestra los datos resultantes de realizar la consulta a la base de datos según los filtros que hayamos establecido en la llamada http.
- #### Ejemplos:

    **1. Lista de anuncios con páginación** 

    Si mostramos los anuncios de 10 en 10 en cada pagína, estas serían las llamadas http a realizar para 
    la 1ª Página:  
    http://localhost:3001/apiv1/advertisements?skip=0&limit=10  
    para la 2ª página: 
    http://localhost:3001/apiv1/advertisements?skip=10&limit=10  
    y siguiente página: 
    http://localhost:3001/apiv1/advertisements?skip=20&limit=10  

    **2. Lista de anuncios con filtro por tags** 

    Podremos buscar por uno o varios tags (separados por comas)

        http://localhost:3001/apiv1/advertisements?tags=work,motor
        http://localhost:3001/apiv1/advertisements?tags=animals

    **3. Lista de anuncios por tipo de anuncio (Venta ó Búsqueda)**

        http://localhost:3001/apiv1/advertisements?sale=false
        Obtiene los anuncios de tipo Se Busca

        http://localhost:3001/apiv1/advertisements?sale=true
        Obtiene los anuncios de tipo Se Vende

    **4. Lista de anuncios por rango de precios**

        http://localhost:3001/apiv1/advertisements?price=500-5000
        Obtiene los anuncios cuyo precio es mayor o igual a 500 y menor o igual a 5000

        http://localhost:3001/apiv1/advertisements?price=-10000
        Obtiene los anuncios cuyo precio es menor o igual a 10000

        http://localhost:3001/apiv1/advertisements?price=50000-
        Obtiene los anuncios cuyo precio es mayor a 50000

    **5. Lista de anuncios cuyo nombre empiece por una palabra**

        http://localhost:3001/apiv1/advertisements?name=agenda
        Obtiene los anuncios que comienzan por la palabra agenda

    **6. Lista de anuncios con filtros de ordenación**

    Podemos ordenar por varios campos separándolos por espacios. 

    `http://localhost:3001/apiv1/advertisements?sort=price -name`
    Obtiene los anuncios ordenados por precio ascendente y por nombre descendentemente.

    `http://localhost:3001/apiv1/advertisements?sort=price name`
    Obtiene los anuncios ordenados por precio ascendente y por nombre ascendentemente.

    **7. Lista de anuncios que solo muestre algunos campos**

    `http://localhost:3001/apiv1/advertisements?fields=image sale`
    Obtiene los anuncios con los campos foto y tipo de venta

    `http://localhost:3001/apiv1/advertisements?fields=price name sale -_id`
    Obtiene los anuncios con los campos que queramos seleccionar separados por espacios, en este caso precio, nombre y tipo de venta, además si queremos eliminar el campo _id, se lo podemos indicar con -_id

    **8. Lista de anuncios ordenados por el campo fecha de creación y/o actualización**
    `http://localhost:3001/apiv1/advertisements?sort=-updateAt`
    Obtiene los anuncios en orden descendente

    `http://localhost:3001/apiv1/advertisements?sort=updateAt`
    Obtiene los anuncios en orden ascendente

    **9 Lista de anuncios con varios filtros**

    `http://localhost:3001/apiv1/advertisements?tag=mobile&sale=false&name=ip&price=50-&skip=0&limit=2&sort=price`
    La consulta a la colección anuncios obtiene (response) un documento anuncio que cumple todos los filtros que le hemos hecho en la petición http (request).

    **10 Lista de anuncios por userId**
    `http://localhost:3001/apiv1/advertisements?userId=60f3e6b2631489df48ff8844`
    Obtiene los anuncios dado un userId

## PRIVATE ZONE

Todas las llamadas a la API de la zona privada necesitaran incorporar el token válido (token que no haya expirado) en la cabecera de la petición (Headers, campo o key: Authorization) para poder realizar la petición URL. Este token lo obtendremos en la llamada al User Login. 

### POST /apiv1/advertisements 

Creará un nuevo anuncio en la colección de anuncios.
Para probarlo vamos a la aplicación POSTMAN, creamos una nueva pestaña, seleccionamos el método POST
y añadimos la url: http://localhost:3001/apiv1/advertisements 

En Headers, tenemos que rellenar en el value del key "Authorization" el token válido.
Seleccionamos el selector dónde le vamos a pasar la información, en este caso, en el body y el formato de la información: form-data. 
Rellenamos los campos en el key de cada campo de nuestro esquema anuncio e insertamos en el value de cada campo el valor que queramos crear. 
Y a continuación, pulsamos el botón SEND en la aplicación de Postman. Postman nos da la respuesta con un status 201 tal como hemos establecido en nuestra api, con lo que se ha creado el nuevo anuncio en la base de datos correctamente. 

