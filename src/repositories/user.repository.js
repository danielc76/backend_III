import User from '../models/user.model.js';

export const getUsers = async () => {
  return await User.find();
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const getUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const createUser = async (userData) => {
  return await User.create(userData);
};

export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};