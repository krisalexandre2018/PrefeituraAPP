// Mock do Cloudinary para testes

const cloudinaryMock = {
  config: jest.fn(),
  uploader: {
    upload: jest.fn().mockResolvedValue({
      secure_url: 'https://cloudinary.com/test-image.jpg',
      public_id: 'ocorrencias/test-image-id',
      url: 'http://cloudinary.com/test-image.jpg'
    }),
    destroy: jest.fn().mockResolvedValue({
      result: 'ok'
    })
  },
  url: jest.fn().mockReturnValue('https://cloudinary.com/test-thumbnail.jpg')
};

module.exports = {
  v2: cloudinaryMock
};
