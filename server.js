const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Reddy@123", // same password you used in MySQL Shell
    database: "global_explorer"
});

db.connect(err => {
    if (err) {
        console.error("DB connection failed:", err);
    } else {
        console.log("Database connected");
    }
});

app.post("/api/feedback", (req, res) => {
    const { rating, comment } = req.body;

    const sql = "INSERT INTO feedback (rating, comment) VALUES (?, ?)";

    db.query(sql, [rating, comment], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "DB error" });
        }
        res.json({ message: "Feedback saved" });
    });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
