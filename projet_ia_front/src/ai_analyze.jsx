import { useState, useRef, useEffect } from 'react';
import './section.css';
import image1 from './assets/ChatGPTImage.png';

export default function Upload() {
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [userName, setUserName] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Récupérer les informations de l'utilisateur depuis localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const user = JSON.parse(userString);
                setUserName(user.firstname || user.email);
            } catch (err) {
                console.error('Error parsing user data:', err);
            }
        }
    }, []);

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        
        if (!file) return;

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner une image valide');
            return;
        }

        // Créer un aperçu de l'image uploadée
        const imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl);

        setLoading(true);
        setError('');
        setDescription('');

        // Récupérer le token depuis localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Vous devez être connecté pour analyser une image');
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch('http://localhost:3000/analyze', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'analyse de l\'image');
            }

            const data = await response.json();
            setDescription(data.description);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Erreur lors de l\'analyse de l\'image. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {userName && (
                <div className="welcome-message text-center mb-4">
                    <h3>Bonjour {userName} ! 👋</h3>
                </div>
            )}
            
            <div className='row'>
                <div className='col-md-6 d-flex flex-column justify-content-center align-items-center'>
                    <div className="img-wrapper">
                        <img 
                            width={350} 
                            height={320} 
                            src={image1} 
                            alt="" 
                            className="pulse-img"
                        />
                    </div>
                    <p className='paragraph_section d-flex flex-column align-items-center justify-content-center'>
                        <span>AsMe</span>
                        <span>vision</span>
                    </p>
                </div>
                
                <div className="col-md-6 d-flex flex-column justify-content-center align-items-center">
                    {uploadedImage && (
                        <div className="uploaded-image-preview mb-3">
                            <img 
                                src={uploadedImage} 
                                alt="Uploaded preview" 
                                className="preview-image"
                            />
                        </div>
                    )}
                    <p className="description-text w-100">
                        Upload your images and let our AI analyze, describe, and save them automatically.
                    </p>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    
                    <button 
                        className="upload-btn"
                        onClick={handleUploadClick}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <img 
                                    src={image1} 
                                    alt="analyzing" 
                                    className="btn-logo spin-animation"
                                />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <img 
                                    src={image1} 
                                    alt="upload" 
                                    className="btn-logo"
                                />
                                Upload
                            </>
                        )}
                    </button>

                    {error && (
                        <div className="alert alert-danger mt-3 w-100">
                            {error}
                        </div>
                    )}
                    {description && (
                        <div className="alert alert-success mt-3 w-100">
                            <h5>Analysis Result:</h5>
                            <p>{description}</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}