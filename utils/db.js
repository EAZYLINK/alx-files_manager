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
        this.DATABASE = DATABASE || 'filemanager'
        this.url = `${this.DB_HOST}:${this.DB_PORT}/${this.DATABASE}`
        this.client = new MongoClient(this.url)
    }
    async isAlive() {
       try {
            await this.client.connect()
       } catch (error) {
        console.error('MongoDB Error:', error)
        return false
       }
    }
    async nbUsers() {
        try {
            await this.client.connect()
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
            await this.client.connect()
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