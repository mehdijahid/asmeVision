import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI, createUserContent } from "@google/genai";
import User from "./models/user.js";
import Image from "./models/image.js";

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use('/uploads', express.static('uploads')); // Servir les images uploadées

// Configuration Multer pour sauvegarder les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// Connexion MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ia_db")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.log("❌ MongoDB error:", err));

// ==================== MIDDLEWARE AUTH ====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_secret_key_2024", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
}

// ==================== ROUTES AUTH ====================

// Register
app.post("/register", async (req, res) => {
  try {
    console.log("📝 Register request:", req.body);
    
    const { firstname, lastname, email, password } = req.body;

    const existed = await User.findOne({ email });
    if (existed) {
      console.log("❌ User already exists");
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      firstname,
      lastname,
      email,
      password: hashed
    });

    console.log("✅ User registered successfully");
    const response = { message: "User registered successfully" };
    console.log("📤 Sending response:", response);
    res.json(response);
  } catch (err) {
    console.error("❌ Register error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    // Créer un JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || "your_secret_key_2024",
      { expiresIn: "24h" }
    );

    // S'assurer que la réponse est bien formatée
    return res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTES IMAGES ====================

// Analyser et sauvegarder une image
app.post("/analyze", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    console.log("📸 Analyze request from user:", req.user.userId);
    
    if (!req.file) {
      console.log("❌ No file uploaded");
      return res.status(400).json({ error: "No image provided" });
    }

    console.log("✅ File received:", req.file.originalname, req.file.mimetype);

    const buffer = fs.readFileSync(req.file.path);
    console.log("✅ File read, size:", buffer.length, "bytes");

    // Vérifier la clé API
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ API_KEY or GEMINI_API_KEY not found in .env");
      fs.unlinkSync(req.file.path);
      return res.status(500).json({ error: "API configuration error" });
    }

    console.log("🤖 Calling Google AI...");
    
    // Analyser avec Google AI
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        createUserContent([
          "Say hello first and describe this image in 3 lines, including the background.",
          { inlineData: { data: buffer.toString("base64"), mimeType: req.file.mimetype } }
        ])
      ]
    });

    console.log("✅ AI response received");

    const description = response.candidates[0].content.parts[0].text;
    console.log("📝 Description:", description.substring(0, 100) + "...");

    // Sauvegarder dans MongoDB avec l'URL du fichier
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const newImage = await Image.create({
      userId: req.user.userId,
      filename: req.file.originalname,
      url: imageUrl,
      description: description,
      mimeType: req.file.mimetype
    });

    console.log("✅ Image saved to DB with ID:", newImage._id);

    // NE PAS supprimer le fichier - il reste dans uploads/
    // fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      description: description,
      imageId: newImage._id,
      imageUrl: imageUrl
    });
  } catch (err) {
    console.error("❌ Error during analysis:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    
    // Supprimer le fichier en cas d'erreur
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ error: "Error during analysis: " + err.message });
  }
});

// Récupérer l'historique des images de l'utilisateur
app.get("/my-images", authenticateToken, async (req, res) => {
  try {
    const images = await Image.find({ userId: req.user.userId })
      .sort({ uploadedAt: -1 })
      .limit(50);

    res.json({ images });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => 
  console.log(`🚀 Server running on http://localhost:${port}`)
);