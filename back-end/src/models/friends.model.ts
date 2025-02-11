import { Schema, model } from 'mongoose';

const friendsSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  friends_list: [{
    friend_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    last_chat_timestamp: {
      type: Date,
      default: Date.now,
    },
    last_chat_message: {
      type: String
    }
  }]
});

// add index on user_id
friendsSchema.index({ user_id: 1 });

// Add index on friends.last_chat in decending order
friendsSchema.index({ 'friends_list.last_chat_timestamp': -1 });

// Add index on friends_list.friend_id
friendsSchema.index({ 'friends_list.friend_id': 1 });

const Friends = model('Friends', friendsSchema);
export default Friends;
