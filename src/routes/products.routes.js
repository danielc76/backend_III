import { Router } from 'express';
import * as productsController from '../controllers/products.controller.js';

const router = Router();

// GET /api/products
router.get('/', productsController.getProducts);

// GET /api/products/:pid
router.get('/:pid', productsController.getProductById);

// POST /api/products
router.post('/', productsController.createProduct);

// PUT /api/products/:pid
router.put('/:pid', productsController.updateProduct);

// DELETE /api/products/:pid
router.delete('/:pid', productsController.deleteProduct);

export default router;