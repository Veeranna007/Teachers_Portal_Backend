/** @format */

/** @format */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // For hashing passwords
const { Client } = require("pg");
const { generateToken } = require("../helpers/jwtUtils");

const client = new Client({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	port: process.env.DB_PORT,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE, // users database
});

client.connect();

async function hashPassword(plainPassword) {
	const saltRounds = 10;
	const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
	return hashedPassword;
}

// User registration route
router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;
	console.log(req.body);

	try {
		// Hash the password before saving it to the database
		const hashedPassword = await hashPassword(password);

		// SQL query to insert a new user
		const query = `
            INSERT INTO users (name, email, password)
            VALUES ($1, $2, $3)
        `;
		await client.query(query, [name, email, hashedPassword]);

		// Send a success response
		res.status(201).json({ message: "User registered successfully" });
	} catch (error) {
		console.error("Error during registration:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	console.log(req.body);

	try {
		const query = "SELECT * FROM users WHERE email = $1";
		const result = await client.query(query, [email]);

		if (result.rows.length === 0) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		const user = result.rows[0];

		// Compare the provided password with the hashed password in the database
		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			return res.status(401).json({ message: "Invalid email or password" });
		}

		// If login is successful
		// Generate a token and send it in the response
		const token = generateToken(user);
		res.status(200).json({ message: "Login successful", token, user });
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

module.exports = router;

/** @format */

// const express = require("express");
// const router = express.Router();
// const bcrypt = require("bcrypt"); // For hashing passwords
// const { Client } = require("pg");
// const passport = require("passport");
// const { generateToken, authenticateJWT } = require("../helpers/jwtUtils");

// const client = new Client({
// 	host: process.env.DB_HOST,
// 	user: process.env.DB_USER,
// 	port: process.env.DB_PORT,
// 	password: process.env.DB_PASSWORD,
// 	database: process.env.DB_DATABASE, // users database
// });

// client.connect();

// async function hashPassword(plainPassword) {
// 	const saltRounds = 10;
// 	const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
// 	return hashedPassword;
// }

// // User registration route
// router.post("/register", async (req, res) => {
// 	const { name, email, password } = req.body;
// 	console.log(req.body);

// 	try {
// 		// Hash the password before saving it to the database
// 		const hashedPassword = await hashPassword(password);

// 		// SQL query to insert a new user
// 		const query = `
//             INSERT INTO users (name, email, password)
//             VALUES ($1, $2, $3)
//         `;
// 		await client.query(query, [name, email, hashedPassword]);

// 		// Send a success response
// 		res.status(201).json({ message: "User registered successfully" });
// 	} catch (error) {
// 		console.error("Error during registration:", error);
// 		res.status(500).json({ message: "Internal server error" });
// 	}
// });

// Login route using Passport.js
// router.post("/login", (req, res) => {
// 	console.log("req.user", req.user);
// 	const token = generateToken(req.user);
// 	res.json({ message: "Login successful", token });
// });

// // Protected route example
// router.get("/protected", authenticateJWT, (req, res) => {
// 	res.json({ message: "This is a protected route", user: req.user });
// });

// module.exports = router;
