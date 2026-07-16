import * as productsRepository from '../repositories/product.repository.js';

export const getProducts = async () => {
  return await productsRepository.getProducts();
};

export const getProductById = async (id) => {
  return await productsRepository.getProductById(id);
};

export const createProduct = async (productData) => {

  const { name, description, price, stock, category, status } = productData;

  if (!name || price === undefined || stock === undefined) {
    throw new Error('Faltan datos obligatorios (name, price, stock)');
  }

  if (price < 0) {
    throw new Error('El precio no puede ser negativo');
  }

  if (stock < 0) {
    throw new Error('El stock no puede ser negativo');
  }

  const newProduct = await productsRepository.createProduct({
    name,
    description,
    price,
    stock,
    category,
    status: stock > 0 ? (status || 'available') : 'out_of_stock'
  });

  return newProduct;
};

export const updateProduct = async (id, productData) => {

  const { name, description, price, stock, category, status } = productData;

  const product = await productsRepository.updateProduct(id);

  if (!product) {
    return null;
  }

  if (price !== undefined && price < 0) {
    throw new Error('El precio no puede ser negativo');
  }

  if (stock !== undefined && stock < 0) {
    throw new Error('El stock no puede ser negativo');
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;

  if (stock !== undefined) {
    product.stock = stock;
    product.status = stock > 0 ? (status || 'available') : 'out_of_stock';
  }

  if (category !== undefined) product.category = category;

  if (status !== undefined && product.stock > 0) {
    product.status = status;
  }

  await productsRepository.saveProduct(product);

  return product;
};

export const deleteProduct = async (id) => {
  return await productsRepository.deleteProduct(id);
};