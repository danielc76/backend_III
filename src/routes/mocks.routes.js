import { Router } from 'express';

// Importamos los Controllers porque el Router solamente
// deriva cada petición al método correspondiente.
import {
getUsersMocks,
getOrdersMocks,
getDeliveriesMocks,
generateMocks
} from '../controllers/mock.controller.js';

const router = Router();

// Devuelve usuarios simulados sin guardarlos en MongoDB.
router.get('/users', getUsersMocks);

// Devuelve pedidos simulados sin guardarlos en MongoDB.
router.get('/orders', getOrdersMocks);

// Devuelve entregas simuladas sin guardarlas en MongoDB.
router.get('/deliveries', getDeliveriesMocks);

// Genera e inserta datos de prueba en MongoDB.
// La validación de cantidad y los posibles errores
// se resolverán en las capas correspondientes.
router.post('/generate', generateMocks);

// Exportamos el Router para registrarlo en app.js
// bajo /api/mocks.
export default router;
