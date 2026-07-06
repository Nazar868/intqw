const { celebrate, Joi, Segments } = require('celebrate');

const idParamValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
});

const createAnnouncementValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(3).max(100).required(),
    description: Joi.string().trim().min(10).required(),
    price: Joi.number().positive().required(),
  }),
});

const updateAnnouncementValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.number().integer().positive().required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().trim().min(3).max(100),
    description: Joi.string().trim().min(10),
    price: Joi.number().positive(),
  }).min(1),
});

module.exports = {
  idParamValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
};
