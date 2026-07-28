import { Router } from 'express';
import multer from 'multer';
import { protect, authorize } from '../../middleware/auth.middleware';
import { uploadToCloudinary } from '../../config/cloudinary';

const uploadRoutes = Router();
const upload = multer({ storage: multer.memoryStorage() });

uploadRoutes.post('/', protect, authorize('admin', 'manager'), upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    let resultUrl = dataURI;
    try {
      const resCloud = await uploadToCloudinary(dataURI, 'chronex_watches');
      resultUrl = resCloud.url;
    } catch {
      // Fallback base64 dataURI if Cloudinary keys missing in .env
    }

    res.json({ success: true, url: resultUrl });
  } catch (err) {
    next(err);
  }
});

export default uploadRoutes;
