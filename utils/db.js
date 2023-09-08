import { MongoClient } from "mongodb"
import dotenv from 'dotenv'

dotenv.config()
const DB_HOST = process.env.DB_HOST
const DB_PORT = process.env.DB_PORT
const DATABASE = process.env.DATABASE

class DBClient {
    constructor(){
        this.DB_HOST = DB_HOST || 'mongodb://127.0.0.1'
        this.DB_PORT = DB_PORT || 27017
        this.DATABASE = DATABASE || 'file_manager'
        this.url = `${this.DB_HOST}:${this.DB_PORT}/${this.DATABASE}`
        this.client = new MongoClient(this.url)
        this.client.connect()
    }
    static isAlive() {
       return this.client.isConnected()
    }
    async nbUsers() {
        try {
            const db = this.client.db()
            const userCollection = db.collection('users')
            const count = await userCollection.countDocuments()
            return count
        } catch (error) {
            console.log('MongoDB Error:', error)
            return -1
        }
    }
    async nbFiles() {
        try {
            const db = this.client.db()
            const filesCollection = db.collection('files')
            const count = await filesCollection.countDocuments()
            return count
        } catch (error) {
            console.log('MongoDB Error:', error)
            return -1
        }
    }
}

const dbClient = new DBClient()
module.exports = dbClient