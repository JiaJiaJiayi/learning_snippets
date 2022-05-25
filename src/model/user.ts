const { Entity, Schema } = require('redis-om');

class User extends Entity {
  username: string;
  encryptedPassword: string;
}

let userSchema = new Schema(
  User,
  {
    username: { type: 'string' },
    encryptedPassword: { type: 'string' },
  },
  { indexName: 'user-schema' }
);

module.exports = { User, userSchema };


