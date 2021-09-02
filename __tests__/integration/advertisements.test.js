const request = require('supertest');
const app = require('../../app');

const userObj = {
    username :'amolto', 
    email: 'amoltovil@gmail.com',
    password: '4321'
}
const userObjFake = {
    username:'fake',
    email: 'fake@example.com',
    password: '1234'
}

/**
 * Declaro la variable token variable para que este accesible en todo el test suite
*/ 
    
let token;

beforeAll((done) => {
   request(app)
    .post('/apiv1/auth/signin')
    .send(userObj)
    .end((err, response) => {
        token = response.body.token; // guardamos el token
       done();
    });
});


describe('Testing /apiv1/advertisements', () => {

    describe('GET /apiv1/advertisements without JWT', () => {
        it('it should fetch an array of advertisements', async () => {
            
            const res = await request(app)
                .get('/apiv1/advertisements');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBePositive;
     
        });

        it("should get all ads", async () => {
            await request(app)
                .get("/apiv1/advertisements")
                .set("Accept", "application/json")
                .set('Authorization', token)
                .expect("Content-Type", /json/)
                .expect(200);
        });
    });

    describe('GET /apiv1/advertisements/id', () => {
        it('it should fetch one object of advertisements', async () => {
            
            const res = await request(app)
                .get('/apiv1/advertisements/6111b57f5a6a9ae95d2930b0');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toBeObject;
     
        });
    });

    describe('GET /api/anuncios/:id', () => {
        it('should fetch not found for a ad with id = 601fe467842fa20e151eab78', () => {
            return request(app)
                .get('/api/anuncios/601fe467842fa20e151eab78')
                .set('Authorization', token)
                .then((response) => {
                    expect(response.statusCode).toEqual(404);
                });
        });
    });

    describe('PUT /apiv1/advertisements', () => {
        // token not being sent - should respond with a 401
        it('It should require authorization', () => {
            return request(app)
                .put('/apiv1/advertisements/6111b57f5a6a9ae95d2930aa')
                .then((response) => {
                    expect(response.statusCode).toBe(401);
                })
        })
        
        // send the token - should respond with a 200
        it('It responds with JSON', () => {
           
            return request(app)
                .put('/apiv1/advertisements/6111b57f5a6a9ae95d2930aa')
                .set('Authorization', token)
                .then((response) => {
                   
                    expect(response.statusCode).toBe(201);
                    expect(response.type).toBe('application/json');
                });
        });
    });

    describe('POST /apiv1/advertisements', () => {
        test("POST /apiv1/advertisements", async () => {
            const data = {
                name: "prueba test",
                transaction: "sale",
                price: 10,
                image: '',
                tags: ['lifestyle', 'work']
            }
    
            await request(app)
                .post("/apiv1/advertisements")
                .set('Authorization', token)
                .send(data)
                .expect(201)
                .then(async (response) => {
                    // Check the response
                    
                    expect(response.body.result._id).toBeTruthy()
                    expect(response.body.result.name).toBe(data.name)
                    expect(response.body.result.transaction).toBe(data.transaction)
                    expect(response.body.result.price).toBe(data.price)
                    expect(response.body.result.image).toBe(data.image)
                    //expect(response.body.result.tags).toBe(data.tags)
                   
                });
        });
    });
});

