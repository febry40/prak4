const express = require('express');
const path = require('path');
const crypto = require('crypto');
const mysql = require('mysql2');

const app = express();
const port = 3000; // ✅ ganti dari 3306 ke 3000

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ✅ KONEKSI DATABASE (XAMPP)
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",       // ✅ kosongkan jika pakai XAMPP default
    database: "apikeydb"
});

db.connect((err) => {
    if (err) {
        console.log("Gagal konek database:", err);
    } else {
        console.log("Terhubung ke MySQL ✅");
    }
});

// ✅ TAMPILKAN INDEX.HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ CREATE API KEY → simpan ke database
app.post("/create", (req, res) => {
    let key = crypto.randomBytes(16).toString("hex");
    key = "sk-co-v1" + key;

    const sql = "INSERT INTO apikeys (api_key) VALUES (?)";

    db.query(sql, [key], (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Gagal menyimpan APIKEY" });
        }

        res.json({ success: true, apikey: key });
    });
});

// ✅ VALIDASI API KEY
app.post("/valid", (req, res) => {
    const { apikey } = req.body;

    if (!apikey) {
        return res.status(400).json({
            success: false,
            message: "apikey tidak boleh kosong!"
        });
    }

    const sql = "SELECT * FROM apikeys WHERE api_key = ? LIMIT 1";

    db.query(sql, [apikey], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Gagal membaca database" });
        }

        if (result.length === 0) {
            return res.status(401).json({
                success: false,
                message: "APIKEY tidak valid!"
            });
        }

        res.json({
            success: true,
            message: "APIKEY valid",
            apikey: result[0].api_key
        });
    });
});

// ✅ JALANKAN SERVER
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
