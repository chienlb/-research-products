import { v2 as cloudinary } from 'cloudinary';
import * as dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadImage = async (filePath: string, folderName: string) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: folderName,
            resource_type: 'auto',
        });
        return {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Upload failed');
    }
};
