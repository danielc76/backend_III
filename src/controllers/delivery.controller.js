// Importamos el Service porque el Controller se encarga de
// recibir la petición HTTP y delegar la lógica de negocio.
import * as deliveriesService from '../services/delivery.service.js';


// Obtiene todas las entregas.
// El Controller recibe la petición y delega al Service.
export const getDeliveries = async (req, res, next) => {

  try {

    const deliveries = await deliveriesService.getDeliveries();

    res.json(deliveries);

  } catch (error) {

    next(error);

  }

};


// Obtiene una entrega por su ID.
// La búsqueda y validación de existencia corresponden al Service.
export const getDeliveryById = async (req, res, next) => {

  try {

    const delivery = await deliveriesService.getDeliveryById(
      req.params.did
    );

    res.json(delivery);

  } catch (error) {

    next(error);

  }

};


// Crea una nueva entrega.
// El Controller recibe los datos del body y los pasa al Service.
export const createDelivery = async (req, res, next) => {

  try {

    const delivery = await deliveriesService.createDelivery(req.body);

    res.status(201).json(delivery);

  } catch (error) {

    next(error);

  }

};


// Actualiza el estado de una entrega.
// El Controller obtiene el ID desde la URL y el nuevo estado
// desde el body, y delega la operación al Service.
export const updateDeliveryStatus = async (req, res, next) => {

  try {

    const delivery = await deliveriesService.updateDeliveryStatus(
      req.params.did,
      req.body.status
    );

    res.json(delivery);

  } catch (error) {

    next(error);

  }

};


// Elimina una entrega por ID.
// El Service se encarga de verificar si existe y realizar
// la eliminación mediante el Repository.
export const deleteDelivery = async (req, res, next) => {

  try {

    await deliveriesService.deleteDelivery(req.params.did);

    res.json({
      message: 'Entrega eliminada'
    });

  } catch (error) {

    next(error);

  }

};