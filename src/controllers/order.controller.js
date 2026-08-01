// El Controller recibe la petición HTTP, llama al Service
// y devuelve únicamente las respuestas exitosas.
// Los errores se delegan al middleware global mediante next(error).
import * as ordersService from '../services/order.service.js';


// Obtiene todos los pedidos.
export const getOrders = async (req, res, next) => {

  try {

    const orders = await ordersService.getOrders();

    res.json(orders);

  } catch (error) {

    // El Controller no arma la respuesta de error.
    // La responsabilidad pasa al middleware global.
    next(error);

  }

};


// Obtiene un pedido por su ID.
export const getOrderById = async (req, res, next) => {

  try {

    const order = await ordersService.getOrderById(req.params.oid);

    // Si el pedido no existe, el Service ya lanzó
    // el error ORDER_NOT_FOUND.
    // Por eso acá no necesitamos hacer res.status(404).
    res.json(order);

  } catch (error) {

    next(error);

  }

};


// Crea un nuevo pedido.
export const createOrder = async (req, res, next) => {

  try {

    const result = await ordersService.createOrder(req.body);

    // 201 indica que el recurso fue creado correctamente.
    res.status(201).json(result);

  } catch (error) {

    // Los errores de validación, usuario inexistente,
    // permisos, etc. son procesados por errorHandler.
    next(error);

  }

};


// Actualiza el estado de un pedido.
export const updateOrderStatus = async (req, res, next) => {

  try {

    const order = await ordersService.updateOrderStatus(
      req.params.oid,
      req.body.status
    );

    // Si existe algún problema con el pedido o con el estado,
    // el Service lanza el CustomError correspondiente.
    res.json(order);

  } catch (error) {

    next(error);

  }

};


// Elimina un pedido.
export const deleteOrder = async (req, res, next) => {

  try {

    const order = await ordersService.deleteOrder(req.params.oid);

    // Si el pedido no existe, el Service lanza
    // ORDER_NOT_FOUND y el errorHandler responde con 404.
    res.json({
      message: 'Pedido eliminado'
    });

  } catch (error) {

    next(error);

  }

};