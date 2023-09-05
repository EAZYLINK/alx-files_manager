import { createClient } from "redis";

class RedisClient {
    constructor(){
        this.client = createClient()
        this.client.on('error', err=>console.log('Redis Client Error', err))
    }
   async isAlive() {
        this.client.connected
    }
   async get(key) {
        const value = await this.client.get(key)
        return value
    }
    async  set(key, value, timeout) {
     await   this.client.set(key, value, {EX: timeout, NX: true})
    }
    async del(key) {
      await  this.client.del(key)
    }
}
const redisClient = new RedisClient()

module.exports = redisClient
