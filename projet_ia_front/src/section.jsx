import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./section.css";
import image1 from "./assets/ChatGPTImage.png";

export default function Section() {
    const [showModal, setShowModal] = useState(false);
    const [isSignup, setIsSignup] = useState(false);
    const [formData, setFormData] = useState({
        firstname: "",
        lastname: "",
        email: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    function handleChange(e) {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const url = isSignup
            ? "http://localhost:3000/register"
            : "http://localhost:3000/login";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (isSignup) {
                // Pour register, le backend renvoie du JSON
                const data = await response.json();
                
                if (!response.ok) {
                    setError(data.error || "An error occurred");
                    return;
                }

                
                setIsSignup(false); // Basculer vers login
                // Réinitialiser le formulaire
                setFormData({
                    firstname: "",
                    lastname: "",
                    email: "",
                    password: ""
                });
            } else {
                // Pour login, le backend renvoie aussi du JSON
                const data = await response.json();
                
                console.log("Login response:", data); // DEBUG

                if (!response.ok) {
                    setError(data.error || "Invalid credentials");
                    return;
                }

                // Vérifier que data.user existe
                if (!data.user || !data.token) {
                    console.error("Invalid response structure:", data);
                    setError("Invalid server response");
                    return;
                }

                // Login réussi
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                
                // Déclencher l'événement storage pour mettre à jour la navbar
                window.dispatchEvent(new Event('storage'));
                
                
                
                // Rediriger vers la page d'upload
                navigate("/upload");
            }
        } catch (err) {
            console.error(err);
            setError("Network error. Please try again.");
        }
    }

    return (
        <>
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
                    <p className="description-text w-100">
                        Upload your images and let our AI analyze, describe, and save them automatically.
                    </p>

                    <button className="upload-btn" onClick={() => setShowModal(true)}>
                        Upload
                    </button>
                </div>
            </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal-box">
                        <h3>{isSignup ? "Create an Account" : "Login"}</h3>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            {isSignup && (
                                <>
                                    <input
                                        type="text"
                                        name="firstname"
                                        placeholder="First Name"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="lastname"
                                        placeholder="Last Name"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                        required
                                    />
                                </>
                            )}

                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />

                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                            />

                            <button className="modal-btn" type="submit">
                                {isSignup ? "Sign Up" : "Login"}
                            </button>

                            <p className="switch-text">
                                {isSignup ? "Already have an account ?" : "Don't have an account ?"}
                                <span onClick={() => {
                                    setIsSignup(!isSignup);
                                    setError("");
                                }}>
                                    {isSignup ? " Login" : " Sign Up"}
                                </span>
                            </p>
                        </form>

                        <button className="close-btn" onClick={() => {
                            setShowModal(false);
                            setError("");
                        }}>
                            X
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}