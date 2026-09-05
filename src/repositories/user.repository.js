import User from '../models/user.model.js';


export const getUsers = async (filters, limit) => {

  return await User.find(filters)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

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


export const addUserDocument = async (id, documentData) => {

  return await User.findByIdAndUpdate(
    id,
    { $push: { documents: documentData } },
    { new: true, runValidators: true }
  );

};


// Inserta varios usuarios en una sola operación.
// Se utiliza para la carga de datos de prueba.
export const createUsers = async (usersData) => {

  return await User.insertMany(usersData);

};


export const deleteUser = async (id) => {
  return await User.findByIdAndDelete(id);
};
