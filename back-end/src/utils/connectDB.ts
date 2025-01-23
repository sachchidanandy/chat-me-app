import mongoose from 'mongoose';
import { MONGODB_URI } from './config';

export default async (callback: () => void): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    callback();
  } catch (error) {
    console.error('Error while connecting to DB: ', error);
  }
};
