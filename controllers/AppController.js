import redisClient from '../utils/redis'
import dbClient from '../utils/db'

class AppController {
    static getStatus(req, res) {
    const redisAlive = redisClient.isAlive()
    const dbAlive = dbClient.isAlive()
        res.status(200).json({
            redis: redisAlive,
            db: dbAlive
        })
    }
    static async getStats(req, res){
        const countUsers = await dbClient.countUsers()
        const countFiles = await dbClient.countFiles()
        if (countUsers !==-1 && countFiles!==-1) {
            res.status(200).json({
                users: countUsers,
                files: countFiles
            })
        } else{
            res.status(500).json({message: 'Error fetching stats'})
        }
    }
}

module.exports = AppController