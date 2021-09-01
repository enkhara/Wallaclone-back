
# APIWallaclone 

Api for the iOS/Android apps.
## Deploy

### Install dependencies  
    
    npm install

Copy .env.example to .env and review the config.

    cp .env.example .env

The path http://localhost:3001/ must be modified in the .env to point to where the node application resides, we can leave this path to test it in local development environment.
### Configure  

Review models/connectMongoose.js to set database configuration

### Database initilization

If you want to reset your DB, you can run:

    npm run init-db

## Start

To start a single instance:
    
    npm start

To start in development mode:

    npm run dev (including nodemon & debug log)



## API Methods

## API v1 info


### Base Path

The API can be used with the followed paths: 

* [API V1 users](/apiv1/users)
* [API V1 advertisements](/apiv1/advertisements)
* [API V1 favourites](/apiv1/favourites)
* [API V1 conversations](/apiv1/conversations)
* [API V1 messages](/apiv1/messages)


The collections of the mongo database of our application are:

* users
* advertisements
* conversations
* messages

Requests to the API will return the information in JSON format.
# API USER ROUTES (END POINTS)
## PUBLIC ZONE

### USER REGISTER /apiv1/auth/signup

<http://localhost:3001/apiv1/auth/signup>
### USER LOGIN /apiv1/auth/signin

<http://localhost:3001/apiv1/auth/signin>

In the body of type x-www-form-urlencoded we incorporate the username and password. 
We select the POST method, and when we press send, it returns a valid JWT(JSON web token). 
### GET ALL USERS /users 

<http://localhost:3001/users>

List all users.
### GET /users/:userid 

<http://localhost:3001/users/:userid> 

Get a user given their id that pass us through params.
### FORGOT PASSWORD /apiv1/auth/forgot-password

<http://localhost:3001/apiv1/auth/forgot-password>

## PRIVATE ZONE

These requests must include the JWT (json web token) in the call to the request URL. 
The JWT will have to be indicated in Headers in the key "Authorization" and in the value we will put the value of the JWT token.
### CREATE NEW PASSWORD  /apiv1/auth/new-password

<http://localhost:3001/apiv1/auth/new-password>

### DELETE /users/:userid 

Delete all the data of the user id (userdata, adverts, images, conversations, etc.) and update the favorites of the rest of the users, eliminating the deleted ads of this user.
### PUT /users/:userid

Updates the user id data. In the body of type x-www-form-urlencoded we incorporate the username, email and password that we want to update. 
### GET /apiv1/favourites/:userId 

Given a user id per params you get a JSON with your favorite ads.

Url Example Request: <http://localhost:3001/apiv1/favourites/60eb19914d799d6a125a666a>

JSON Result

````
[
    {
        "tags": [
            "motor"
        ],
        "_id": "6111b57f5a6a9ae95d2930b0",
        "name": "Bicicleta adulto",
        "desc": "se busca bicicleta de paseo en buen estado",
        "transaction": "wanted",
        "price": 350,
        "image": "bicicleta.jpg",
        "userId": "60f3e6b2631489df48ff8844",
        "reserved": false,
        "sold": false,
        "createdAt": "2021-07-18T15:37:22.952Z",
        "updatedAt": "2021-07-18T15:37:22.952Z",
        "__v": 0
    },
    {
        "tags": [
            "lifestyle",
            "mobile"
        ],
        "_id": "6111b57f5a6a9ae95d2930b1",
        "name": "iPhone 3GS",
        "desc": "Busco móvil 3G por unos 350 euros",
        "transaction": "wanted",
        "price": 350,
        "image": "movil.jpg",
        "userId": "60f3e6b2631489df48ff8844",
        "reserved": false,
        "sold": true,
        "createdAt": "2021-07-18T15:42:03.507Z",
        "updatedAt": "2021-08-30T15:46:13.343Z",
        "__v": 0
    },
    {
        "tags": [
            "lifestyle"
        ],
        "_id": "6127d79850553ef4dec947bd",
        "name": "jersey zara",
        "desc": "JERSEY DE LANA",
        "transaction": "sale",
        "price": 8,
        "image": "",
        "userId": "6127b4c638aa48656cb49455",
        "createdAt": "2021-08-26T18:04:08.381Z",
        "updatedAt": "2021-08-26T18:04:08.382Z",
        "__v": 0,
        "reserved": false,
        "sold": false
    }
]
````
### PUT /users/addfavourite/:userid

Add the ad in the array ads_favs (favorite ads) of a user given their id, in the body we pass the id of the ad to add.

Url Example request: <http://localhost:3001/users/addfavourite/60f3e6b2631489df48ff8844>
### PUT /users/deletefavourite/:userid

Given a user id per params, it removes the ad id (which is passed to us in the x-www-form-urlencoded body) from that user's ads_favs array.

Url example request: <http://localhost:3001/users/deletefavourite/60f3e6b2631489df48ff8844>
# API ADVERTISEMENTS ROUTES (END POINTS)

## PUBLIC ZONE 

In the public area it is not necessary to add the JWT in the header of the requests.
### GET TAGS /apiv1/tags

Url: <http://localhost:3001/apiv1/tags>

Returns Json with the defined tags:
````
[
"kitchen",
"lifestyle",
"mobile",
"motor",
"work"
]
````
### GET ADVERTISEMENTS /apiv1/advertisements

Url: <http://localhost:3001/apiv1/advertisements>

Returns all ads defined in the database.
### GET ADVERTISEMENTS/:id /apiv1/advertisements/:id

Returns the ad by id from the advertisements collection.

Example URL: <http://localhost:3001/apiv1/advertisements/601fe467842fa20e151eab52>

### GET /apiv1/advertisements 

* With filters en query params 

We explain the different types of filters that we can apply in the path /apiv1/advertisements.
- #### Resultados 

A file in JSON format that shows us the data resulting from making the query to the database according to the filters that we have established in the http request.
- #### Examples:

    **1. List of ads with pagination** 

    If we show the ads of 10 in 10 on each page, these would be the http calls to be made:

        Firts page:  
        http://localhost:3001/apiv1/advertisements?skip=0&limit=10
        Second page: 
        http://localhost:3001/apiv1/advertisements?skip=10&limit=10
        and next page: 
        http://localhost:3001/apiv1/advertisements?skip=20&limit=10  

    **2. List of ads with filter by tags** 

    We can search by one or more tags (separated by commas)

        http://localhost:3001/apiv1/advertisements?tags=work,motor
        http://localhost:3001/apiv1/advertisements?tags=lifestyle

    **3. List of ads by transaction type (Sale or Wanted)**

        http://localhost:3001/apiv1/advertisements?transaction=wanted
        
        http://localhost:3001/apiv1/advertisements?transaction=sale

    **4. List of ads by price range**

        http://localhost:3001/apiv1/advertisements?price=500-5000
        Gets ads whose price is greater than or equal to 500 and less than or equal to 5000

        http://localhost:3001/apiv1/advertisements?price=-10000
        Gets ads whose price is less than or equal to 10000

        http://localhost:3001/apiv1/advertisements?price=50000-
        Gets ads that are priced over 50000

    **5. List of ads whose name begins with a word**

        http://localhost:3001/apiv1/advertisements?name=agenda
        Gets ads that begin with the word agenda

    **6. List of ads with sort filters**

    We can sort by several fields separating them by spaces.

        http://localhost:3001/apiv1/advertisements?sort=price -name
        Gets ads sorted by ascending price and by name descendingly.

        http://localhost:3001/apiv1/advertisements?sort=price name
        Gets ads sorted by ascending price and by name ascending.

        http://localhost:3001/apiv1/advertisements?sort=-createdAt&limit=9
        Gets the last 9 ads created, sorts descendingly by creation date showing all 9.

    **7. List of ads that only shows a few fields**

        http://localhost:3001/apiv1/advertisements?fields=image sale
        Gets the ads with the image and sale type fields

        http://localhost:3001/apiv1/advertisements?fields=price name sale -_id
        It gets the ads with the fields that we want to select separated by spaces, in this case price, name and type of sale, also if we want to eliminate the field _id, we can indicate it with -_id

    **8. List of ads sorted by the createdAt and/or updatedAt date field**

        http://localhost:3001/apiv1/advertisements?sort=-createdAt
        Gets ads sorted by createdAt date in descending order

        http://localhost:3001/apiv1/advertisements?sort=-updatedAt
        Gets ads sorted by updatedAt date in descending order

        http://localhost:3001/apiv1/advertisements?sort=createdAt
        Gets ads sorted by createdAt date in asccending order

        http://localhost:3001/apiv1/advertisements?sort=updatedAt
        Gets ads sorted by updatedAt date in ascending order

    **9 List of ads with multiple filters**

        http://localhost:3001/apiv1/advertisements?tag=mobile&sale=false&name=ip&price=50-&skip=0&limit=2&sort=price

        The query to the ads collection obtains (response) the ad documents that comply with all the filters that we have indicated in the request http (request).

    **10 List of ads by userId**
        http://localhost:3001/apiv1/advertisements?userId=60f3e6b2631489df48ff8844
        Gets ads for a userId

## PRIVATE ZONE

All calls to the API of the private zone will need to incorporate the valid token JWT (token that has not expired) in the header of the request (Headers, key field: Authorization, in value we will put the token) to be able to make the request URL. 
This token will be obtained in the call to the User Login. 

### POST /apiv1/advertisements 

You'll create a new ad in your ad collection (advertisements).
To test it we go to the POSTMAN application, create a new tab, select the POST method and add the url: <http://localhost:3001/apiv1/advertisements>

In Headers, we have to fill in the value of the key "Authorization" the valid token.
We select the selector where we are going to pass the information, in this case, in the body and format of the information: form-data. 
We fill in the fields in the key of each field of our ad scheme and insert in the value of each field the value we want to create. 
And then, we press the SEND button in the Postman app. Postman gives us the answer with a status 201 as we have established in our api, so the new ad has been created in the database correctly. 
### PUT /apiv1/advertisements/:id 

It will update the data of the ad given its id. We select the PUT method, we must also pass the Authorization token in the header.
It is verified that the user making the request is the user who owns the ad.
The data of the modification of the advertisement are filled in the body in form-data format.

URL Example: <http://localhost:3001/apiv1/advertisements/60f44bcb3db9c46749691b4f>
### DELETE /apiv1/advertisements/:id 

Deletes a given ad from its ad id.
It is verified that the user making the request is the user who owns the ad.

URL Example: <http://localhost:3001/apiv1/advertisements/60f44bcb3db9c46749691b4f>
### PUT /apiv1/advertisements/changereserved/:id 

It will update the value of the reserved field of the ad id (passed by params). 
We use the PUT method, we must also pass the Authorization token in the header.
It is verified that the user making the request is the user who owns the ad.
It only updates the reserved data of the ad id, this data is passed to you in the body with x-www-form-urlencoded format.

URL Example: <http://localhost:3001/apiv1/advertisements/changereserved/6111b57f5a6a9ae95d2930aa>
### PUT /apiv1/advertisements/changesold/:id 

It will update the value of the sold field of the ad id (passed by params). 
We use the PUT method, we must also pass the Authorization token in the header.
It is verified that the user making the request is the user who owns the ad.
It only updates the reserved data of the ad id, this data is passed to you in the body with x-www-form-urlencoded format.

URL Example: <http://localhost:3001/apiv1/advertisements/changesold/6111b57f5a6a9ae95d2930aa>

