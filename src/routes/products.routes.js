import { Router } from 'express';
import Product from '../models/product.model.js';

const router = Router();

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { name, description, price, stock, category, status } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).send('Faltan datos obligatorios (name, price, stock)');
    }

    if (price < 0) {
      return res.status(400).send('El precio no puede ser negativo');
    }

    if (stock < 0) {
      return res.status(400).send('El stock no puede ser negativo');
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      status: stock > 0 ? (status || 'available') : 'out_of_stock'
    });

    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  try {
    const { name, description, price, stock, category, status } = req.body;

    const product = await Product.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (price !== undefined && price < 0) {
      return res.status(400).send('El precio no puede ser negativo');
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).send('El stock no puede ser negativo');
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) {
      product.stock = stock;
      product.status = stock > 0 ? (status || 'available') : 'out_of_stock';
    }
    if (category !== undefined) product.category = category;
    if (status !== undefined && product.stock > 0) product.status = status;

    await product.save();

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
});

export default router;
