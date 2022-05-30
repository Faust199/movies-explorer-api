const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user');
const ValidationError = require('../errors/validationError');
const ObjectNotExistError = require('../errors/objectNotExistError');
const UserError = require('../errors/userError');
const DataBaseError = require('../errors/dataBaseError');

function errorHandler(err, next) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    next(new ValidationError(err.message));
  } else {
    next(err);
  }
}

module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send({ user });
      } else {
        throw new ObjectNotExistError('Пользователь с таким id не найден.');
      }
    })
    .catch((err) => {
      errorHandler(err, next);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
    }))
    .then((userTemp) => {
      User.findById(userTemp.id)
        .then((user) => {
          res.send({ user });
        });
    })
    .catch((err) => {
      if (err.code === 11000) {
        next(new DataBaseError(err.message));
      }
      errorHandler(err, next);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  const { NODE_ENV, JWT_SECRET } = process.env;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res
        .status(200)
        .send({ token });
    })
    .catch((err) => {
      next(new UserError(err.message));
    });
};

module.exports.updateUserProfile = (req, res, next) => {
  const { name, email } = req.body;
  User.findByIdAndUpdate({ _id: req.user._id }, { name, email }, { runValidators: true, new: true })
    .then((user) => res.send({ user }))
    .catch((err) => {
      errorHandler(err, next);
    });
};
