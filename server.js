/** @format */

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const userRouter = require("./routes/user"); // Import your user router
const studentRouter = require("./routes/students"); // Import your student router
require("./helpers/passportConfig"); // Import Passport configuration

const app = express();
const port = process.env.PORT;
// Configure CORS to allow requests from specific origins
const corsOptions = {
	origin: "http://localhost:3000", // Allow requests from this origin
	methods: "GET,POST,PUT,DELETE,OPTIONS",
	allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions)); // Use the CORS middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize session and Passport
app.use(
	session({
		secret: "your_session_secret",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

// Use the user routes
app.use("/user", userRouter);
app.use("/student", studentRouter);

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
