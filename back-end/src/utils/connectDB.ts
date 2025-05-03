import mongoose from 'mongoose';

export default async (callback: () => void): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    callback();
  } catch (error) {
    console.error('Error while connecting to DB: ', error);
  }
};
