const request = require('supertest');
const app = require('../../app');

describe('Testing /users', () => {
    describe('GET /users', () => {
        it('should fetch an array of users', async () => {
            const res = await request(app).get('/users');
            
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('resultado');
            expect(res.body.resultado.length).toBePositive;

        });
    });

    describe('GET /users/:id', () => {
        it('should fetch 1 single user for id = 1', async () => {
            const res = await request(app).get('/users/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.username).toMatch(/adm/i);
        });

        it('should fetch null for a user with id = 0', async () => {
            const res = await request(app).get('/users/0');

            expect(res.statusCode).toEqual(500);
            expect(res.body).toMatchObject({});
        });
    });

    describe('REGISTER POST /auth/signup', ()=> {
        it('should return a 201 code when creating a user', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ username: 'Jorge', password: '1231' })
                .set('Accept', 'application/json');
            
            expect(res.statusCode).toEqual(201);
        });
        it('should return the created user', async () => {
            const res = await request(app)
                .post('/auth/signup')
                .send({ username: 'Jorge', password: '1231' })
                .set('Accept', 'application/json');
            
            expect(res.statusCode).toHaveProperty('USER REGISTERED');
            expect(res.body.username).toEqual('Jorge');
            expect(res.body._id).toBePositive();

        });
    })

    describe('LOGIN POST /auth/signin', ()=> {
        it.skip('should return a 201 code when creating a user', async () => {
            const res = await request(app)
                .post('/auth/signin')
                .send({ username: 'Jorge', password: '1231' })
                .set('Accept', 'application/json');
            
            expect(res.statusCode).toEqual(201);
        });
        it.skip('should return the created user', async () => {
            const res = await request(app)
                .post('/auth/signin')
                .send({ username: 'Jorge', password: '1231' })
                .set('Accept', 'application/json');
            
            expect(res.statusCode).toHaveProperty('token');
            expect(res.body.username).toEqual('Jorge');
           

        });
    })
})