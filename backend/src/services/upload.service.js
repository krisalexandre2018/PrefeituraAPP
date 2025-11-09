const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

class UploadService {
  async uploadImage(file) {
    try {
      // Converter buffer para base64
      const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

      // Upload para Cloudinary
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: 'ocorrencias',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      });

      // Criar thumbnail
      const thumbnail = cloudinary.url(result.public_id, {
        width: 300,
        height: 300,
        crop: 'fill'
      });

      return {
        url: result.secure_url,
        thumbnail,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  }

  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log('Imagem deletada do Cloudinary:', publicId);
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
    }
  }
}

module.exports = new UploadService();
