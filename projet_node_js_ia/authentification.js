import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import cors from "cors";
import User from "./models/user.js";
import Image from "./models/image.js";

const app = express();
app.use(express.json());
app.use(cors());

// ---------- CONNECT MONGODB ----------
mongoose.connect("mongodb://127.0.0.1:27017/ia_db")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));


// ---------- REGISTER ----------
app.post("/register", async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;

        const existed = await User.findOne({ email });
        if (existed) return res.status(400).send("User already exists");

        const hashed = await bcrypt.hash(password, 10);

        await User.create({
            firstname,
            lastname,
            email,
            password: hashed
        });

        res.send("User registered successfully");

    } catch (err) {
        res.status(500).send(err.message);
    }
});


// ---------- LOGIN ----------
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).send("User not found");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).send("Incorrect password");

        res.status(200).send({
            message: "Login successful",
            userId: user._id
        });

    } catch (err) {
        res.status(500).send(err.message);
    }
});
app.listen(3000, () => console.log("Server running on port 3000"));
