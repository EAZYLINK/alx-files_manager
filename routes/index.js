import express from 'express'
import AppController from '../controllers/AppController'
import AuthController from '../controllers/AuthController'
import UsersController from '../controllers/UsersController'
import FilesController from '../controllers/FilesController'
import worker from '../worker'
const router = express.Router()

router.get('/status', AppController.getStatus)
    .get('/stats', AppController.getStats)
    .get('/connect', AuthController.getConnect)
    .get('/disconnect', AuthController.getDisconnect)
    .get('/file/:id', FilesController.getShow)
    .get('/files', worker, FilesController.getIndex)
    .get('/users/me', UsersController.getMe)
    .get('/files/:id/data', FilesController.getFile)
    .post('/users', UsersController.postNew)
    .post('/files', FilesController.postIpload)
    .put('/files/:id/publish', FilesController.putPublish)
    .put('/files/:id/unpublish', FilesController.putUnpublish)


module.exports = router