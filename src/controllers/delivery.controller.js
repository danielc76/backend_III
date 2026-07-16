import * as deliveriesService from '../services/delivery.service.js';

export const getDeliveries = async (req, res) => {
  try {
    const deliveries = await deliveriesService.getDeliveries();
    res.json(deliveries);
  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};


export const getDeliveryById = async (req, res) => {
  try {
    const delivery = await deliveriesService.getDeliveryById(req.params.did);

    if (!delivery) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    res.json(delivery);

  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};


export const createDelivery = async (req, res) => {
  try {
    const delivery = await deliveriesService.createDelivery(req.body);

    res.status(201).json(delivery);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};


export const updateDeliveryStatus = async (req, res) => {
  try {
    const delivery = await deliveriesService.updateDeliveryStatus(
      req.params.did,
      req.body.status
    );

    if (!delivery) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    res.json(delivery);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error del servidor');
  }
};


export const deleteDelivery = async (req, res) => {
  try {
    const delivery = await deliveriesService.deleteDelivery(req.params.did);

    if (!delivery) {
      return res.status(404).json({ error: 'Entrega no encontrada' });
    }

    res.json({ message: 'Entrega eliminada' });

  } catch (error) {
    res.status(500).send('Error del servidor');
  }
};