import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './historique.css';

export default function Historique() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vous devez être connecté pour voir votre historique');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/my-images', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement des images');
      }

      setImages(data.images);
      
      if (data.images.length > 0) {
        setSelectedImage(data.images[0]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="historique-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historique-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="historique-container">
        <div className="empty-state">
          <p>Aucune image disponible</p>
          <a href="/upload">Analyser une image</a>
        </div>
      </div>
    );
  }

  return (
    <div className="historique-container">
      <div className="container">
        <div className="row">
          {/* Swiper à gauche - col-md-6 */}
          <div className="col-md-6 col-12">
            <div className="swiper-section">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                onSlideChange={(swiper) => {
                  setSelectedImage(images[swiper.activeIndex]);
                }}
                className="images-swiper"
              >
                {images.map((image) => (
                  <SwiperSlide key={image._id}>
                    <div 
                      className="swiper-image-container"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img 
                        src={`http://localhost:3000${image.url}`} 
                        alt={image.filename}
                        className="swiper-image"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Description à droite - col-md-6 */}
          <div className="col-md-6 col-12">
            <div className="details-section">
              {selectedImage ? (
                <div className="details-content">
                  <div className="description-box">
                    <h3>Description</h3>
                    <p className="description-text">{selectedImage.description}</p>
                  </div>
                  
                  <div className="date-box">
                    <strong>Date:</strong> {formatDate(selectedImage.uploadedAt)}
                  </div>
                </div>
              ) : (
                <p className="no-selection">Sélectionnez une image</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}