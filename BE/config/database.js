// config/database.js
const { Sequelize } = require('sequelize');

// Konfigurasi koneksi sesuai dengan docker-compose.yml Anda
const sequelize = new Sequelize('arsip_digital_db', 'koozeedev', 'koozeedev', {
  host: 'localhost',
  port: 3306,
  dialect: 'mysql'
});

// Tes koneksi
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

testConnection();

module.exports = sequelize;