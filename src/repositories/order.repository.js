import Order from '../models/order.model.js';


export const getOrders = async () => {
  return await Order.find();
};


export const getOrderById = async (id) => {
  return await Order.findById(id);
};


export const createOrder = async (orderData) => {
  return await Order.create(orderData);
};


// Actualiza una orden existente y devuelve el documento actualizado.
export const updateOrder = async (id, orderData) => {

  return await Order.findByIdAndUpdate(
    id,
    orderData,
    {
      new: true
    }
  );

};


export const saveOrder = async (order) => {
  return await order.save();
};


export const deleteOrder = async (id) => {
  return await Order.findByIdAndDelete(id);
};


// Inserta múltiples órdenes.
// Se utiliza para la carga de datos de prueba mediante mocks.
export const createOrders = async (ordersData) => {

  return await Order.insertMany(ordersData);

};