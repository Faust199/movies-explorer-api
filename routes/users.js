const { celebrate, Joi } = require('celebrate');
const router = require('express').Router();
const validator = require('validator');

const {
  updateUserProfile, getUserInfo,
} = require('../controllers/users');

router.get('/users/me', getUserInfo);
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().custom((value) => {
      if (!validator.isEmail(value)) {
        throw new Error('Неправильный формат ссылки');
      }
      return value;
    }).required(),
  }),
}), updateUserProfile);

module.exports = router;
