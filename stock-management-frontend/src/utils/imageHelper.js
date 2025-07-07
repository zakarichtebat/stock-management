const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Si l'URL est déjà absolue, la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Nettoyer le chemin de l'image
  const cleanPath = imagePath.replace(/^\/+/, '');
  
  // Construire l'URL complète
  return `${API_URL}/api/uploads/${cleanPath}`;
};

export const getDefaultProductImage = () => {
  return '/default-product.png';
}; 