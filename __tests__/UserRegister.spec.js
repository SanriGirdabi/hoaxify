const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../config/database');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

const postValidUser = () => {
  return request(app).post('/api/1.0/users').send({
    username: 'user1',
    email: 'user1@mail.com',
    password: 'P4ssword',
  });
};

describe('User Registration', () => {
  it('Returns 200 OK when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
    // or you can use supertest expect block instead of the then
    // .expect(200, done);
  });

  it('Returns success message when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe('User created!');
  });

  it('It saves the user to database', async () => {
    await postValidUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('It saves the username and email to database', async () => {
    await postValidUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });

  it('Hashes the password in database', async () => {
    await postValidUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });
});
