import {
  getMockUsers,
  getMockOrders,
  getMockDeliveries,
  createMockData
} from '../services/mock.service.js';

// Obtiene usuarios simulados sin guardarlos en la base de datos.
// El Controller solamente recibe la petición, llama al Service
// y devuelve el resultado.
export const getUsersMocks = async (req, res, next) => {
  try {
    const users = getMockUsers();
    res.status(200).json(users);
  } catch (error) {
    // El error se deriva al middleware global.
    next(error);
  }
};

// Obtiene pedidos simulados sin persistirlos en MongoDB.
// La generación de los datos corresponde al Service.
export const getOrdersMocks = async (req, res, next) => {
  try {
    const orders = getMockOrders();
    res.status(200).json(orders);
  } catch (error) {
    // El error se deriva al middleware global.
    next(error);
  }
};

// Obtiene entregas simuladas sin persistirlas en MongoDB.
// El Controller no contiene lógica de negocio.
export const getDeliveriesMocks = async (req, res, next) => {
  try {
    const deliveries = getMockDeliveries();
    res.status(200).json(deliveries);
  } catch (error) {
    // El error se deriva al middleware global.
    next(error);
  }
};

// Genera datos de prueba y los guarda en MongoDB.
// Las validaciones y posibles errores de generación
// serán responsabilidad del Service.
export const generateMocks = async (req, res, next) => {
  try {
    // Obtenemos la cantidad enviada por el usuario
    // y la pasamos al Service para su validación.
    const result = await createMockData(req.body.quantity);

    // 201 indica que los datos fueron creados correctamente.
    res.status(201).json({
      message: 'Datos de prueba generados correctamente',
      result
    });

  } catch (error) {
    // El error se deriva al middleware global para que
    // devuelva la respuesta uniforme de la API.
    next(error);
  }
};