require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const { isCelebrateError } = require('celebrate');

const swaggerSpec = require('./swagger');
const authRoutes = require('./src/routes/auth.routes');
const announcementsRoutes = require('./src/routes/announcements.routes');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRoutes);
app.use('/announcements', announcementsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    const segment = err.details.get('body') || err.details.get('params') || err.details.get('query');
    const message = segment ? segment.details[0].message : 'Validation error';
    return res.status(400).json({ message });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (status === 403) {
    return res.status(status).json({ error: message });
  }

  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});

module.exports = app;
