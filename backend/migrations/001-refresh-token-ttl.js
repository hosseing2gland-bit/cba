import mongoose from 'mongoose';

export const name = '001-refresh-token-ttl';

export async function up() {
  const collection = mongoose.connection.collection('users');
  await collection.createIndex({ 'refreshTokens.createdAt': 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });
}

export async function down() {
  const collection = mongoose.connection.collection('users');
  await collection.dropIndex('refreshTokens.createdAt_1').catch((error) => {
    if (error.codeName !== 'IndexNotFound') {
      throw error;
    }
  });
}
