import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Comprime e redimensiona imagem antes do upload
 * @param {string} uri - URI da imagem original
 * @param {number} maxWidth - Largura máxima (padrão: 1200px)
 * @param {number} quality - Qualidade de compressão 0-1 (padrão: 0.7)
 * @returns {Promise<object>} - Imagem comprimida com nova URI
 */
export const compressImage = async (uri, maxWidth = 1200, quality = 0.7) => {
  try {
    // Redimensiona e comprime a imagem
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: maxWidth } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG
      }
    );

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height
    };
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error);
    // Em caso de erro, retorna a imagem original
    return { uri };
  }
};

/**
 * Comprime múltiplas imagens
 * @param {Array} images - Array de objetos com URI das imagens
 * @returns {Promise<Array>} - Array de imagens comprimidas
 */
export const compressMultipleImages = async (images, maxWidth = 1200, quality = 0.7) => {
  const compressedImages = [];

  for (const image of images) {
    const compressed = await compressImage(image.uri, maxWidth, quality);
    compressedImages.push({
      ...image,
      uri: compressed.uri,
      width: compressed.width,
      height: compressed.height
    });
  }

  return compressedImages;
};

/**
 * Calcula tamanho aproximado da imagem em MB
 * Nota: Esta é uma estimativa, o tamanho real pode variar
 */
export const estimateImageSize = (width, height, quality = 0.7) => {
  // Estimativa aproximada: largura * altura * 3 (RGB) * qualidade / 1024 / 1024
  const bytes = width * height * 3 * quality;
  const mb = bytes / 1024 / 1024;
  return mb.toFixed(2);
};
