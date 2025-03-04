const path = require("node:path");
const fs = require("node:fs");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const dotenv = require("dotenv");

const { firestore, storage } = require("./services/firebase.service");

dotenv.config({ path: path.join(__dirname, `../.env.${process.env.NODE_ENV?.trim()}`) });


// Express Setup
const app = express();
app.use(cors({
    origin: "*",
    methods: "OPTION,GET,POST"
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));


// Multer Setup
const multerDiskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});
const upload = multer({ storage: multerDiskStorage });


// Routes

// Get All Models
app.get("/models", (req, res) => {
    // TODO: Add pagination
    firestore.collection("models").get().then((snapshot) => {
        const models = [];
        snapshot.forEach((doc) => {
            models.push(doc.data());
        });
        res.json(models);
    });
});

// Search Models
app.get("/models/search", (req, res) => {
    const { q } = req.query;
    firestore.collection("models").where("name", "array-contains", q).get().then((snapshot) => {
        const models = [];
        snapshot.forEach((doc) => {
            models.push(doc.data());
        });
        res.json(models);
    });
});


// Upload Model
app.post("/upload", upload.single("file"), async (req, res) => {

    const { name, description } = req.body;

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    if (!name || !description) {
        console.log(name, description);
        return res.status(400).json({
            success: false,
            message: "Some fields are missing"
        });
    }

    try {

        const filepath = req.file.filepath;
        const mimeType = req.file.mimeType;
        const fileName = req.file.name;
        const destination = `models/${Date.now()}_${fileName}`;

        // Uploading File to the Firebase Storage
        await storage.bucket().upload(filepath, {
            destination,
            metadata: { contentType: mimeType }
        });

        const uploadedFile = storage.bucket().file(destination);
        const [ url ] = await uploadedFile.getSignedUrl({
            action: "read",
            expires: "03-09-2491"
        });

        const modelDoc = {
            id: uploadedFile.id,
            name,
            description,
            uploadDate: Date.now().toLocaleString({ timeZone: "Asia/Kolkata" }),
            url
        };

        // Uploading the Document to the Firestore
        const result = await firestore.collection("models")
            .doc(uploadedFile.id)
            .set(modelDoc);

        fs.unlinkSync(filepath);

        return res.status(201).json({
            success: true,
            message: "Model uploaded successfully",
            data: modelDoc
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }

});


app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});