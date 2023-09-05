import { Worker, Queue } from 'bull'
import thumbnail from 'image-thumbnail'
import dbClient from './utils/db'

const fileQueue = new Queue('file-thumbnails');

const worker = new Worker('file-thumbnails', async (job) => {
  const { userId, fileId } = job.data;
  if (!userId) {
    throw new Error('Missing userId');
  }
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  const fileDocument = await dbClient
    .db()
    .collection('files')
    .findOne({ _id: fileId, userId });
  if (!fileDocument) {
    throw new Error('File not found');
  }
  const sizes = [500, 250, 100];
  const thumbnailPromises = sizes.map(async (size) => {
    const thumbnailBuffer = await thumbnail(fileDocument.localPath, { width: size });
    const thumbnailFileName = `${fileDocument.localPath}_${size}`;
    await fs.promises.writeFile(thumbnailFileName, thumbnailBuffer);
  });
  await Promise.all(thumbnailPromises);
});

export default worker
