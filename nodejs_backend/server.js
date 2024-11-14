const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const { PrismaClient } = require("@prisma/client"); // Prisma Client

const prisma = new PrismaClient(); // สร้าง Prisma Client instance

const app = express();
app.use(cors());
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "images")));

// ตั้งค่าการอัปโหลดไฟล์ด้วย multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images"); // ตั้งที่เก็บไฟล์ในโฟลเดอร์ images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ใช้ชื่อไฟล์ที่เป็น timestamp
  },
});

const upload = multer({ storage }); // สร้างออบเจ็กต์ upload สำหรับจัดการไฟล์ที่อัปโหลด

// User registration
app.post("/api/register", async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    res.status(201).json({ id: user.id, email, name });
  } catch (error) {
    res.status(500).json({ error: "Error registering user." });
  }
});

// User login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id }, "your_jwt_secret", {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Error logging in." });
  }
});

// CRUD routes

// Create Item (ใช้ upload.single() เพื่อจัดการกับไฟล์อัปโหลด)
app.post("/api/items", upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;

  try {
    const item = await prisma.item.create({
      data: {
        title,
        description,
        image,
      },
    });

    res.status(201).json({
      id: item.id,
      title,
      description,
      image,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Error creating item." });
  }
});

// Read Items
app.get("/api/items", async (req, res) => {
  try {
    const items = await prisma.item.findMany();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Error fetching items." });
  }
});

// Update Item
app.put("/api/items/:id", upload.single("image"), async (req, res) => {
  const { title, description } = req.body;
  let image;

  if (req.file) {
    image = req.file.filename;
  } else if (req.body.existingImage) {
    image = req.body.existingImage;
  } else {
    image = null;
  }

  try {
    const item = await prisma.item.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, image },
    });

    res.json({
      id: item.id,
      title,
      description,
      image,
      updatedAt: item.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Error updating item." });
  }
});

// Delete Item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const item = await prisma.item.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting item." });
  }
});

// Search Items
app.get("/api/items/search", async (req, res) => {
  const { query } = req.query;
  try {
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Error searching items." });
  }
});

// Start server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
