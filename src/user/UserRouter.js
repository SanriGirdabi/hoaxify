const UserService = require('./UserService');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

// router.post('/api/1.0/users', (req, res) => {
//   bcrypt.hash(req.body.password, 10).then((hash) => {
//     // Using spread operator
//     const user = { ...req.body, password: hash };

//     // Using Object.assign
//     // const user = Object.assign({}, req.body, { password: hash });

//     // One by one
//     // const user = {
//     //   username: req.body.username,
//     //   email: req.body.email,
//     //   password: hash,
//     // };
//     User.create(user).then(() => {
//       return res.send({ message: 'User created!' });
//     });
//   });
// });

// const validateUsername = (req, res, next) => {
//   const user = req.body;
//   if (user.username === null) {
//     req.validationErrors = {
//       username: 'Username cannot be null!',
//     };
//     //// return res.status(400).send({ validationErrors: { username: 'Username cannot be null!' } });
//   }

//   next();
// };

// const validateEmail = (req, res, next) => {
//   const user = req.body;
//   if (user.email === null) {
//     req.validationErrors = {
//       ...req.validationErrors,
//       email: 'Email cannot be null!',
//     };
//     //// return res.status(400).send({ validationErrors: { email: 'Email cannot be null!' } });
//   }

//   next();
// };

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('Username cannot be null!')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('Must have min 4 and max 32 characters!'),
  check('email')
    .notEmpty()
    .withMessage('Email cannot be null!')
    .bail()
    .isEmail()
    .withMessage('Invalid email!')
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);

      if (user) {
        throw new Error('Email in use!');
      }
    }),
  check('password')
    .notEmpty()
    .withMessage('Password cannot be null!')
    .bail()
    .isLength({ min: 6, max: 32 })
    .withMessage('Must have min 4 and max 32 characters!')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage('Password must have at least 1 uppercase 1 lowercase and one number!'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // const response = { validationErrors: { ...req.validationErrors } };
      const validationErrors = {};
      errors.array().forEach((element) => {
        validationErrors[element.param] = element.msg;
      });
      return res.status(400).send({ validationErrors: validationErrors });
    }
    await UserService.save(req.body);
    return res.send({ message: 'User created!' });
  }
);

module.exports = router;
