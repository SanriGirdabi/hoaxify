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

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'p4ssWord',
};

const invalidUser = {
  username: null,
  email: 'user1@mail.com',
  password: 'p4ssWord',
};

const postUser = (user = validUser) => {
  return request(app).post('/api/1.0/users').send(user);
};

describe('User Registration', () => {
  it('Returns 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
    // or you can use supertest expect block instead of the then
    // .expect(200, done);
  });

  it('Returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created!');
  });

  it('It saves the user to database', async () => {
    await postUser();
    const userList = await User.findAll();
    expect(userList.length).toBe(1);
  });

  it('It saves the username and email to database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });

  it('Hashes the password in database', async () => {
    await postUser();
    const userList = await User.findAll();
    const savedUser = userList[0];
    expect(savedUser.password).not.toBe('P4ssword');
  });

  it('returns 400 when username is null', async () => {
    const response = await postUser(invalidUser);
    expect(response.status).toBe(400);
  });

  it('returns the validationErrors, when invalid user is passed!', async () => {
    const response = await postUser(invalidUser);

    expect(response.body.validationErrors).not.toBeUndefined();
  });

  it('returns the validationErrors, for email and username', async () => {
    const invalidUser = {
      username: null,
      email: null,
      password: 'pas4worD',
    };
    const response = await postUser(invalidUser);

    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email']);
  });

  it.each([
    ['username', 'Username cannot be null!'],
    ['email', 'Email cannot be null!'],
    ['password', 'Password cannot be null!'],
  ])('when %s is null %s is received', async (field, expectedMessage) => {
    const user = validUser;
    user[field] = null;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${'Username cannot be null!'}
    ${'username'} | ${'usr'}           | ${'Must have min 4 and max 32 characters!'}
    ${'username'} | ${'a'.repeat(33)}  | ${'Must have min 4 and max 32 characters!'}
    ${'email'}    | ${null}            | ${'Email cannot be null!'}
    ${'email'}    | ${'mail.com'}      | ${'Invalid email!'}
    ${'email'}    | ${'user.mail.com'} | ${'Invalid email!'}
    ${'email'}    | ${'user@.mail'}    | ${'Invalid email!'}
    ${'password'} | ${null}            | ${'Password cannot be null!'}
    ${'password'} | ${'p4ssw'}         | ${'Must have min 4 and max 32 characters!'}
    ${'password'} | ${'alllowercase'}  | ${'Password must have at least 1 uppercase 1 lowercase and one number!'}
    ${'password'} | ${'lowerUPPER'}    | ${'Password must have at least 1 uppercase 1 lowercase and one number!'}
    ${'password'} | ${'4444444'}       | ${'Password must have at least 1 uppercase 1 lowercase and one number!'}
  `('when $field is $value returns $expectedMessage', async ({ field, expectedMessage, value }) => {
    const user = validUser;
    user[field] = value;
    const response = await postUser(user);
    const body = response.body;
    expect(body.validationErrors[field]).toBe(expectedMessage);
  });

  it('Returns errors for both username and email in use', async () => {
    const validUser = {
      username: null,
      email: 'user1@mail.com',
      password: 'p4ssWord',
    };
    await User.create({ ...validUser });
    const response = await postUser(validUser);
    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
});
