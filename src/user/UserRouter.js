const UserService = require('./UserService');

const express = require('express');
const router = express.Router();

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

router.post('/api/1.0/users', async (req, res) => {
  await UserService.save(req.body);
  return res.send({ message: 'User created!' });
});

module.exports = router;
