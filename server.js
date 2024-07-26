const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path"); // Import path module

const app = express();
const PORT = process.env.PORT || 3000;
const secretKey = "your_secret_key";

app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Mock user database (in a real app, this would be a database)
const users = [
  { id: 1, username: "aadarsh", password: "password1" },
  { id: 2, username: "21BCE3815", password: "password2" },
];

// Login endpoint to generate JWT
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // Generate JWT token
    jwt.sign(
      { userId: user.id, username: user.username },
      secretKey,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("Failed to generate token:", err);
          res.status(500).json({ error: "Failed to generate token" });
        } else {
          console.log("Login successful:", user.username);
          res.json({ token });
        }
      }
    );
  } else {
    console.warn("Login failed: Invalid credentials");
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: Token not provided" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err.message);
      return res.status(403).json({ error: "Unauthorized: Token is invalid" });
    }

    req.user = decoded;
    next();
  });
}

// Protected route example
app.get("/profile", verifyToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!` });
});

// Route to serve the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
