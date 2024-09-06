/** @format */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // For hashing passwords
const { Client } = require("pg");
const { authenticateJWT } = require("../helpers/jwtUtils");

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

// studentsinsertion route
router.post("/studentsinsertion", authenticateJWT, async (req, res) => {
	const { name, subject, marks } = req.body;
	console.log(req.body);

	try {
		// SQL query to insert a new user
		const query = `
            INSERT INTO students (name, subject, marks) VALUES ($1, $2, $3)
        `;
		await client.query(query, [name, subject, marks]);

		// Send a success response
		res.status(201).json({ message: "Student inserted successfully" });
	} catch (error) {
		console.error("Error during registration:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

// Get all student records
router.get("/allstudents", authenticateJWT, async (req, res) => {
	try {
		// SQL query to get all student records
		const query = `
            SELECT * FROM students ORDER BY id DESC ;
        `;
		const result = await client.query(query);

		// Send the retrieved data as a JSON response
		res.status(200).json(result.rows);
	} catch (error) {
		console.error("Error fetching student records:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

// Update existing student
router.put("/updatestudent/:id", authenticateJWT, async (req, res) => {
	const { id } = req.params;
	const { name, subject, marks } = req.body;

	try {
		// SQL query to update student record
		const updateQuery = `
           UPDATE students 
           SET name = $1, subject = $2, marks = $3 
           WHERE id = $4 
           RETURNING *;
        `;
		const result = await client.query(updateQuery, [name, subject, marks, id]);

		if (result.rows.length > 0) {
			// Send the updated record as a JSON response
			res.status(200).json(result.rows[0]);
		} else {
			// Handle case where no record was found with the given ID
			res.status(404).json({ message: "Student not found" });
		}
	} catch (error) {
		console.error("Error updating student record:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});
// Delete student record
router.delete("/deletestudent/:id", authenticateJWT, async (req, res) => {
	const { id } = req.params;
	console.log("req.params", req.params);

	try {
		const query = `DELETE FROM students WHERE id = $1;`;
		await client.query(query, [id]);

		res.status(200).json({ message: "Student deleted successfully" });
	} catch (error) {
		console.error("Error deleting student:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

module.exports = router;
