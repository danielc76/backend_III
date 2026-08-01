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


export const saveDelivery = async (delivery) => {
  return await delivery.save();
};


export const deleteDelivery = async (id) => {
  return await Delivery.findByIdAndDelete(id);
};


// Inserta múltiples entregas.
// Se utiliza para la carga de datos de prueba mediante mocks.
export const createDeliveries = async (deliveriesData) => {

  return await Delivery.insertMany(deliveriesData);

};