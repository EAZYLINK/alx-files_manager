import dbClient from '../utils/db'
import sha1 from 'sha1'
import {v4 as uuidv4} from 'uuid'
import {Queue} from 'bull'

const userQueue = new Queue('user-emails')

class UsersController {
    static async postNew(req, res) {
        const {email, password} = req.body
        if (!email) {
            return res.status(400).json({error: 'Missing email'})
        }
        if (!password) {
            return res.status(400).json({error: 'Missing password'})
        }
        const userExist = await dbClient
            .db()
            .collection()
            .findOne({email})
        if (userExist) {
            return res.status(400).json({error: 'Already exists'})
        }
        const hashedPassword = sha1(password)
        const newUser = {
            _id: uuidv4(),
            email,
            password: hashedPassword
        }
        try {
            const result = await dbClient.db().collection('users').insertOne(newUser)
            await userQueue.add('send-welcome-email', { userId: newUser._id });
            return res.status(201).json({
                id: result.insertedId,
                email: newUser.email,
            })
        } catch (error) {
            console.error('Error creating user', error)
            return res.status(500).json({error: 'Internal server error'})
        }
    }

    static async getMe(req, res) {
        const token = req.header('X-Token');
    
        if (!token) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const userId = await redisClient.get(`auth_${token}`);
    
        if (!userId) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        const user = await dbClient.db().collection('users').findOne({ _id: userId });
    
        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        return res.status(200).json({ email: user.email, id: user._id });
      }
}

module.exports = UsersController