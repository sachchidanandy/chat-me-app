import bcrypt from 'bcrypt';

// function to ecrypt password
export const encryptPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// function to compare pasword
export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};
