import { Schema, model } from 'mongoose';

const friendsSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  friends_list: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

// add index on user_id
friendsSchema.index({ user_id: 1 });

// Add index on friends_list.friend_id
friendsSchema.index({ friends_list: 1 });

const Friends = model('Friends', friendsSchema);
export default Friends;
