const request = require('supertest');
const app = require('../../app');
const { User } = require('../../models');

jest.setTimeout(10000); // 10 seconds

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
const newUserObj = {
    username :'ana', 
    email: 'ana@gmail.com',
    password: '12455'
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

describe('API Authentication /apiv1/auth/signin', () => {
    it('it should return an JSON with a token property', async () => {
        const res = await request(app)
            .post('/apiv1/auth/signin')
            .send(userObj);
        
        expect(res.body).toHaveProperty('token');
        expect(res.statusCode).toEqual(200);
    })
    it('it should return a 401 error with a user incorrect', async () => {
        const res = await request(app)
            .post('/apiv1/auth/signin')
            .send(userObjFake)
        expect(res.statusCode).toEqual(401);
    })

    describe('REGISTER POST /apiv1/auth/signup', () => {
        it('should return a 201 code when creating a user', async () => {
            const res = await request(app)
                .post('/apiv1/auth/signup')
                .send(newUserObj);
               
            expect(res.statusCode).toEqual(201);
            
        });
        it('should return a 400 code when creating a user that already exists', async () => {
            const res = await request(app)
                .post('/apiv1/auth/signup')
                .send(newUserObj);
               
            expect(res.statusCode).toEqual(400);
           
        });
            
    })

    describe('LOGIN POST /apiv1/auth/signin', () => {
        it('should return a 200 code when logging a user', async () => {
            const res = await request(app)
                .post('/apiv1/auth/signin')
                .send({ username: 'ana', password: '12455' });
            //.set('Accept', 'application/json');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.token).toBeString;
        });

        it('should return a 401 code when missing password is incorrect', async () => {
            const res = await request(app)
                .post('/apiv1/auth/signin')
                .send({ username: 'ana', password: 'xx' });
            //.set('Accept', 'application/json');
            
            expect(res.statusCode).toEqual(401);
        });
    })

    describe('Testing Public /apiv1/users', () => {
        describe('GET /apiv1/users', () => {
            it('should fetch an array of users', async () => {
                const res = await request(app).get('/apiv1/users');
            
                expect(res.statusCode).toEqual(200);
                expect(res.body).toHaveProperty('resultado');
                expect(res.body.resultado.length).toBePositive;

            });
        });

        describe('GET /apiv1/users/:id', () => {
            it('should not fetch user for id = 1', async () => {
                const res = await request(app).get('/apiv1/users/1');

                expect(res.statusCode).toEqual(500);
               
            });
        });

        describe('DELETE /apiv1/users/:id ', () => {
            
            it('should return a status 401 without JWT', async () => {

                const user = await User.findOne({ username: 'ana' });
                const id = user._id
                
                const res = await request(app).delete(`/apiv1/users/${id}`);
                
                expect(res.statusCode).toEqual(401);
                
            });
        })
    });

});
  