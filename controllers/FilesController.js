import fs from 'fs'
import path from 'path'
import {v4 as uuidv4} from 'uuid'
import dbClient from '../utils/db'
import redisClient from '../utils/redis'
import {Queue} from 'bull'

const fileQueue = new Queue('file-thumbnails')

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const { name, type, parentId, isPublic, data } = req.body;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if ((type === 'file' || type === 'image') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }
    if (parentId) {
      const parentFile = await dbClient.db().collection('files').findOne({ _id: parentId });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }
    const fileDocument = {
      userId,
      name,
      type,
      isPublic: !!isPublic,
      parentId: parentId || '0',
    };

    if (type === 'folder') {
      await dbClient.db().collection('files').insertOne(fileDocument);
      await fileQueue.add('generate-thumbnails', {
        userId: userId,
        fileId: fileDocument._id,
      })
      return res.status(201).json(fileDocument);
    }
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const filename = uuidv4();
    const localPath = path.join(folderPath, filename);
    const fileData = Buffer.from(data, 'base64');
    fs.writeFileSync(localPath, fileData);
    fileDocument.localPath = localPath;
    await dbClient.db().collection('files').insertOne(fileDocument);
    return res.status(201).json(fileDocument);
  }

  static async getShow(req, res) {
    const token = req.header('X-Token');
    const fileId = req.params.id;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const file = await dbClient
      .db()
      .collection('files')
      .findOne({ _id: fileId, userId });

    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page) || 0;
    const pageSize = 20;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const pipeline = [
      {
        $match: {
          userId,
          parentId,
        },
      },
      {
        $skip: page * pageSize,
      },
      {
        $limit: pageSize,
      },
    ];
    const files = await dbClient
      .db()
      .collection('files')
      .aggregate(pipeline)
      .toArray();
    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    const fileId = req.params.id;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await dbClient
      .db()
      .collection('files')
      .updateOne(
        { _id: fileId, userId },
        { $set: { isPublic: true } }
      );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({ message: 'File is now public' });
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    const fileId = req.params.id;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const result = await dbClient
      .db()
      .collection('files')
      .updateOne(
        { _id: fileId, userId },
        { $set: { isPublic: false } }
      );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json({ message: 'File is no longer public' });
  }

  static async getFile(req, res) {
    const fileId = req.params.id
    const size = req.query.size
    const file = await dbClient
      .db()
      .collection('files')
      .findOne({ _id: fileId })
    if (!file) {
      return res.status(404).json({ error: 'Not found' })
    }
    const token = req.header('X-Token')
    const userId = await redisClient.get(`auth_${token}`)
    if (!file.isPublic && (!userId || userId !== file.userId)) {
      return res.status(404).json({ error: 'Not found' })
    }
    if (file.type === 'folder') {
      return res.status(400).json({ error: "A folder doesn't have content" })
    }
    const thumbnailPath = `${file.localPath}_${size || 'original'}`;
    if (!fs.existsSync(thumbnailPath)) {
      return res.status(404).json({ error: 'Not found' });
    }
    const mimeType = mime.lookup(file.name)
    res.setHeader('Content-Type', mimeType)
    fs.createReadStream(file.localPath).pipe(res)
  }
}

module.exports = FilesController;