// models/index.js
const User = require('./user');
const Category = require('./category');
const Document = require('./document');
const FamilyMember = require('./familyMember');

// Hubungan User -> Document (Satu User mengunggah banyak Dokumen)
User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

// Hubungan User -> Category (Satu User membuat banyak Kategori)
User.hasMany(Category, { foreignKey: 'userId' });
Category.belongsTo(User, { foreignKey: 'userId' });

// Hubungan Category -> Document (Satu Kategori memiliki banyak Dokumen)
Category.hasMany(Document, { foreignKey: 'categoryId' });
Document.belongsTo(Category, { foreignKey: 'categoryId' });

// Hubungan Document -> FamilyMember (Satu Dokumen KK memiliki banyak Anggota Keluarga)
Document.hasMany(FamilyMember, { foreignKey: 'documentId' });
FamilyMember.belongsTo(Document, { foreignKey: 'documentId' });

// Export semua model yang sudah terhubung
module.exports = {
  User,
  Category,
  Document,
  FamilyMember
};