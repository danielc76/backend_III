import Delivery from '../models/delivery.model.js';


export const getDeliveries = async () => {
  return await Delivery.find();
};


export const getDeliveryById = async (id) => {
  return await Delivery.findById(id);
};


export const createDelivery = async (deliveryData) => {
  return await Delivery.create(deliveryData);
};


export const updateDelivery = async (id) => {
  return await Delivery.findById(id);
};


export const saveDelivery = async (delivery) => {
  return await delivery.save();
};


export const deleteDelivery = async (id) => {
  return await Delivery.findByIdAndDelete(id);
};