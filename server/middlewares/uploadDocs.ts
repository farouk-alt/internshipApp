// server/middlewares/uploadDocs.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // ✅ On garde juste le nom original du fichier, en remplaçant les espaces
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, cleanName);
  }
});

const upload = multer({ storage });
export default upload;
