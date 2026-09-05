import { Router } from 'express';

import { getHealth } from '../controllers/health.controller.js';


const router = Router();


// Esta ruta permite comprobar que el proceso está disponible.
router.get('/', getHealth);


export default router;
