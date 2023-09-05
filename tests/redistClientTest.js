import redisCleint from '../utils/redis'
import {expect} from 'chai'

describe('RedisClient', () => {
  before(() => {
    // Setup for your RedisClient if needed
  });

  after(() => {
    // Cleanup after your RedisClient if needed
  });

  it('should connect to Redis and return true for isAlive', async () => {
    const alive = await redisClient.isAlive();
    expect(alive).to.be.true;
  });

  it('should set and get a key in Redis', async () => {
    const key = 'testKey';
    const value = 'testValue';
    await redisClient.set(key, value);
    const retrievedValue = await redisClient.get(key);
    expect(retrievedValue).to.equal(value);
  });

  // Add more tests as needed
});
