import * as productsService from '../services/product.service.js';

export const getProducts = async (req, res) => {
  try {
    const products = await productsService.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await productsService.getProductById(req.params.pid);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

export const createProduct = async (req, res) => {
  try {
    const newProduct = await productsService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};

export const updateProduct = async (req, res) => {
  try {
    const product = await productsService.updateProduct(
      req.params.pid,
      req.body
    );

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await productsService.deleteProduct(req.params.pid);

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};