import { expect } from "chai";
import dbClient from '../utils/db'

describe('DBClient', () => {
  before(() => {
    // Setup for your DBClient if needed
  });

  after(() => {
    // Cleanup after your DBClient if needed
  });

  it('should connect to MongoDB and return true for isAlive', async () => {
    const alive = await dbClient.isAlive();
    expect(alive).to.be.true;
  });

  it('should retrieve the number of users from the database', async () => {
    const userCount = await dbClient.nbUsers();
    expect(userCount).to.be.a('number');
    // Add more assertions based on your expected data
  });

  it('should retrieve the number of files from the database', async () => {
    const fileCount = await dbClient.nbFiles();
    expect(fileCount).to.be.a('number');
    // Add more assertions based on your expected data
  });

  // Add more tests as needed
});
