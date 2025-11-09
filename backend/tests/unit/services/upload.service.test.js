const uploadService = require('../../../src/services/upload.service');
const cloudinary = require('cloudinary');

// Mock do Cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn(),
      destroy: jest.fn()
    },
    url: jest.fn()
  }
}));

describe('UploadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('deve fazer upload de imagem com sucesso', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg'
      };

      const mockCloudinaryResponse = {
        secure_url: 'https://cloudinary.com/test-image.jpg',
        public_id: 'ocorrencias/test-image-123',
        url: 'http://cloudinary.com/test-image.jpg'
      };

      cloudinary.v2.uploader.upload.mockResolvedValue(mockCloudinaryResponse);
      cloudinary.v2.url.mockReturnValue('https://cloudinary.com/test-thumbnail.jpg');

      const result = await uploadService.uploadImage(mockFile);

      expect(cloudinary.v2.uploader.upload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/jpeg;base64,'),
        expect.objectContaining({
          folder: 'ocorrencias',
          transformation: expect.any(Array)
        })
      );

      expect(result).toEqual({
        url: 'https://cloudinary.com/test-image.jpg',
        thumbnail: 'https://cloudinary.com/test-thumbnail.jpg',
        publicId: 'ocorrencias/test-image-123'
      });
    });

    it('deve lançar erro se upload falhar', async () => {
      const mockFile = {
        buffer: Buffer.from('fake-image-data'),
        mimetype: 'image/jpeg'
      };

      cloudinary.v2.uploader.upload.mockRejectedValue(
        new Error('Cloudinary error')
      );

      await expect(uploadService.uploadImage(mockFile)).rejects.toThrow(
        'Falha ao fazer upload da imagem'
      );
    });

    it('deve converter buffer para base64 corretamente', async () => {
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'image/png'
      };

      cloudinary.v2.uploader.upload.mockResolvedValue({
        secure_url: 'https://cloudinary.com/test.png',
        public_id: 'test-id'
      });
      cloudinary.v2.url.mockReturnValue('https://cloudinary.com/thumb.png');

      await uploadService.uploadImage(mockFile);

      expect(cloudinary.v2.uploader.upload).toHaveBeenCalledWith(
        expect.stringMatching(/^data:image\/png;base64,/),
        expect.any(Object)
      );
    });
  });

  describe('deleteImage', () => {
    it('deve deletar imagem do Cloudinary', async () => {
      const publicId = 'ocorrencias/test-image-123';

      cloudinary.v2.uploader.destroy.mockResolvedValue({
        result: 'ok'
      });

      await uploadService.deleteImage(publicId);

      expect(cloudinary.v2.uploader.destroy).toHaveBeenCalledWith(publicId);
    });

    it('não deve lançar erro se deleção falhar', async () => {
      const publicId = 'ocorrencias/test-image-123';

      cloudinary.v2.uploader.destroy.mockRejectedValue(
        new Error('Delete error')
      );

      await expect(
        uploadService.deleteImage(publicId)
      ).resolves.not.toThrow();
    });
  });
});
