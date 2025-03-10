import { Schema, model } from 'mongoose';

const thumbnailSchema = new Schema({
  thumbnailUrl: { type: String, required: true },
  fileName: { type: String, required: true },
});

const Thumbnail = model('Thumbnail', thumbnailSchema);
export default Thumbnail;
