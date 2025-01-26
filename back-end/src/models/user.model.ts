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
  profile_pic_url: {
    type: String,
    default: ''
  },
  friends: [{
    friend_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    last_chat_timestamp: {
      type: Date,
      default: Date.now,
    }
  }]
}, { timestamps: true });

// Add index on username
userSchema.index({ username: 1 }, { unique: true });

// Add index on email
userSchema.index({ email: 1 }, { unique: true });

// Add index on full_name
userSchema.index({ full_name: 1 });

export default model('User', userSchema);
