// JWT Configuration
module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'ardigdesa-super-secret-key-2024',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d'
};
