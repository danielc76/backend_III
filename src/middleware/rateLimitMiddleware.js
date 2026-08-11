import { logger } from "../utils/logger.js";

const hits = new Map()

const limit = 5
const time = 60000
export const rateLimitMiddleware = (req, res, next) =>{
   const ip = req.ip
   const now = Date.now()
   const hit = hits.get(ip) ?? { count: 0, first: now}

   if(now - hit.first > time){
    hit.count = 0
    hit.first = now
   }

    hit.count++
    hits.set(ip, hit)

    if (hit.count >=limit){
        logger.warn( `Peticiones sospechosas desde la ip ${ip}`)
    }
    next()
}