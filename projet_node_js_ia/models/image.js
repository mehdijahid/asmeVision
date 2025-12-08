import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  filename: { 
    type: String, 
    required: true 
  },
  url: {  
    type: String, 
    required: true  // ← Maintenant on sauvegarde l'URL
  },
  description: { 
    type: String, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model("Image", imageSchema);