/** @format */

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { Client } = require("pg");
const bcrypt = require("bcrypt");

const client = new Client({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	port: process.env.DB_PORT,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE, // users database
});

client.connect();

// Serialize user into the session
passport.serializeUser((user, done) => {
	done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
	try {
		const result = await client.query("SELECT * FROM users WHERE id = $1", [
			id,
		]);
		const user = result.rows[0];
		done(null, user);
	} catch (error) {
		done(error);
	}
});

// Local strategy for username and password
passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			const result = await client.query(
				"SELECT * FROM users WHERE email = $1",
				[username]
			);
			const user = result.rows[0];

			if (!user) {
				return done(null, false, { message: "Incorrect username." });
			}

			// Check if the password matches
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				return done(null, false, { message: "Incorrect password." });
			}

			return done(null, user);
		} catch (error) {
			return done(error);
		}
	})
);
