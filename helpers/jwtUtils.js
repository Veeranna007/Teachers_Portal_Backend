/** @format */

const jwt = require("jsonwebtoken");

// const secretKey = process.env.JWT_SECRET || "your_jwt_secret_key"; // Replace with your secret key
const secretKey = process.env.JWT_SECRET; // This will use the secret key from your environment variable

// Generate JWT token
function generateToken(user) {
	return jwt.sign({ id: user.id, email: user.email }, secretKey, {
		expiresIn: "1h",
	});
}

// // Middleware to authenticate using JWT
// function authenticateJWT(req, res, next) {
// 	const token =
// 		req.headers["authorization"] && req.headers["authorization"].split(" ")[1];
// 	if (!token) return res.sendStatus(401);

// 	jwt.verify(token, secretKey, (err, user) => {
// 		if (err) return res.sendStatus(403);
// 		req.user = user;
// 		next();
// 	});
// }
// Middleware to authenticate using JWT
function authenticateJWT(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1]; // Get the token from "Bearer token" format
	if (token == null) return res.sendStatus(401); // If no token, respond with 401 Unauthorized

	jwt.verify(token, secretKey, (err, user) => {
		if (err) return res.sendStatus(403); // If token is invalid, respond with 403 Forbidden
		req.user = user;
		next();
	});
}

module.exports = { generateToken, authenticateJWT };
