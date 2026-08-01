
// Importamos Router de Express para definir las rutas del módulo.
import { Router } from 'express';

// Importamos el Controller porque el Router se encarga únicamente
// de recibir la petición y derivarla al método correspondiente.
import * as deliveriesController from '../controllers/delivery.controller.js';


const router = Router();


// GET /api/deliveries
// Obtiene todas las entregas.
// Router → Controller → Service → Repository.
router.get('/', deliveriesController.getDeliveries);


// GET /api/deliveries/:did
// Obtiene una entrega específica utilizando su ID.
router.get('/:did', deliveriesController.getDeliveryById);


// POST /api/deliveries
// Crea una nueva entrega.
// Los datos de la entrega llegan en req.body.
router.post('/', deliveriesController.createDelivery);


// PATCH /api/deliveries/:did/status
// Actualiza únicamente el estado de una entrega.
// El ID llega por la URL y el nuevo estado por req.body.
router.patch('/:did/status', deliveriesController.updateDeliveryStatus);


// DELETE /api/deliveries/:did
// Elimina una entrega utilizando su ID.
router.delete('/:did', deliveriesController.deleteDelivery);


// Exportamos el Router para que app.js pueda registrarlo
// bajo /api/deliveries.
export default router;

