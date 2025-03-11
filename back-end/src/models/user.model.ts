import { Document, Schema, model } from 'mongoose';

interface iUser extends Document {
  username: string;
  email: string;
  full_name: string;
  password: string;
  pub_key: string;
  priv_key: string;
  profile_pic_url: string;
  last_seen: Date;
};

const userSchema = new Schema<iUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  full_name: {
    type: String,
    require: true,
    trim: true,
    lowercase: true,
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
  last_seen: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Not adding any specific index as already added search_users index in mongoDB Atlas

const User = model('User', userSchema);

export default User;
