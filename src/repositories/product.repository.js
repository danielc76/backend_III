import Product from '../models/product.model.js';

export const getProducts = async () => {
  return await Product.find();
};

export const getProductById = async (id) => {
  return await Product.findById(id);
};

export const createProduct = async (productData) => {
  return await Product.create(productData);
};

export const updateProduct = async (id) => {
  return await Product.findById(id);
};

export const saveProduct = async (product) => {
  return await product.save();
};

export const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};