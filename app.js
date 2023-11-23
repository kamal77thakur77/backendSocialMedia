const express = require("express");
const { connectDB } = require("./db/db");
const app = express();
const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const path = require("path");

const bodyParser = require("body-parser");

// Parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: false }));
// Parse JSON data
app.use(bodyParser.json());

//builtin middleware for static serving of html pages
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
  res.render("index");
});

// app.get("/", (req, res) => {
//   res.send(`Hello, World! this is default route in app.js <br>
//   >The Routes for registeration and logging in are <br>
//   /auth<br>
//   >The Routes for Posts related work are<br>
//   /post <br>
//   `);
// });

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/post", postRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

startServer();
