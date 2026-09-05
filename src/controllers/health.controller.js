import { config } from '../config/env.config.js';


export const getHealth = (req, res) => {

  res.status(200).json({
    status: 'OK',
    environment: config.nodeEnv,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });

};
