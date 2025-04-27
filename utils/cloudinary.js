import dotenv from 'dotenv';
dotenv.config(); // Carica le variabili da .env

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

//  Verifica ENV
console.log('🔍 Verifica ENV:');
console.log('cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('api_key:', process.env.CLOUDINARY_API_KEY);
console.log('api_secret:', process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// salva in cartelle diverse 
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    console.log('💡 File ricevuto:', file.originalname, '→', file.mimetype);

    let folder = 'posts/images';
    let resource_type = 'image';

    if (file.mimetype.startsWith('video')) {
      folder = 'posts/videos';
      resource_type = 'video'; // 👈 FONDAMENTALE per video
    } else if (file.mimetype === 'application/pdf') {
      folder = 'posts/pdfs';
      resource_type = 'raw'; // 👈 Necessario per PDF
    }

    return {
      folder,
      resource_type,
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'mp4', 'mov', 'webm', 'avi'],
      public_id: `${req.user.id}-${Date.now()}`
    };
  },
});

export { cloudinary, storage };
