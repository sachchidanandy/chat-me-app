import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  full_name: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  pub_key: {
    type: String,
    require: true,
  },
  priv_key: {
    type: String,
    require: true,
  },
  friends: [{
    friend_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    last_chat: {
      type: Date,
      default: Date.now(),
    }
  }]
}, { timestamps: true });

export default model('User', userSchema);
