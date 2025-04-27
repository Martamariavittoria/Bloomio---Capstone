import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

console.log('🌍 ENV CHECK', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

// Configura Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage per Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: 'users/profiles', 
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
      resource_type: 'auto', // ✅ NECESSARIO per PDF e altri formati
      public_id: `${req.user.id}-${Date.now()}` 
    };
  },
});

export { cloudinary, storage };
