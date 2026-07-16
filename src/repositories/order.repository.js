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

export const updateOrder = async (id) => {
  return await Order.findById(id);
};

export const saveOrder = async (order) => {
  return await order.save();
};

export const deleteOrder = async (id) => {
  return await Order.findByIdAndDelete(id);
};