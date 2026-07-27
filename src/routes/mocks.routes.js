import { Router } from 'express';

import {
  getUsersMocks,
  getOrdersMocks,
  getDeliveriesMocks,
  generateMocks
} from '../controllers/mock.controller.js';


const router = Router();


// Devuelve datos simulados sin guardar
router.get('/users', getUsersMocks);

router.get('/orders', getOrdersMocks);

router.get('/deliveries', getDeliveriesMocks);


// Genera e inserta datos de prueba en MongoDB
router.post('/generate', generateMocks);


export default router;