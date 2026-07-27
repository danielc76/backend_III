import {
  getMockUsers,
  getMockOrders,
  getMockDeliveries,
  createMockData
} from '../services/mock.service.js';


// Obtiene usuarios simulados sin guardarlos en la base de datos
export const getUsersMocks = async (req, res) => {

  try {

    const users = getMockUsers();

    res.status(200).json(users);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


// Obtiene pedidos simulados sin persistirlos en MongoDB
export const getOrdersMocks = async (req, res) => {

  try {

    const orders = getMockOrders();

    res.status(200).json(orders);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


// Obtiene entregas simuladas sin persistirlas en MongoDB
export const getDeliveriesMocks = async (req, res) => {

  try {

    const deliveries = getMockDeliveries();

    res.status(200).json(deliveries);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};


// Genera datos de prueba y los guarda en MongoDB
export const generateMocks = async (req, res) => {

  try {

    const result = await createMockData();

    res.status(201).json({
      message: 'Datos de prueba generados correctamente',
      result
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};