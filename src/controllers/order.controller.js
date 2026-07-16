import * as ordersService from '../services/order.service.js';

export const getOrders = async (req, res) => {
  try {
    const orders = await ordersService.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await ordersService.getOrderById(req.params.oid);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(order);

  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};

export const createOrder = async (req, res) => {
  try {
    const result = await ordersService.createOrder(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const order = await ordersService.updateOrderStatus(
      req.params.oid,
      req.body.status
    );

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(order);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const order = await ordersService.deleteOrder(req.params.oid);

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json({ message: 'Pedido eliminado' });

  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};