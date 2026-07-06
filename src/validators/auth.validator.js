const { celebrate, Joi, Segments } = require('celebrate');

const registerValidator = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string().trim().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().trim().min(2).required(),
  }),
});

const loginValidator = celebrate({
  [Segments.BODY]: Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().required(),
  }),
});

const refreshValidator = celebrate({
  [Segments.BODY]: Joi.object({
    // optional because the refresh token can also arrive via HttpOnly cookie
    refreshToken: Joi.string().optional(),
  }),
});

module.exports = {
  registerValidator,
  loginValidator,
  refreshValidator,
};
