const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");


router.post("/register", validInfo, async (req, res) => {
  const { email, name, password } = req.body;



  try {

    //destructure the req.body (name, email, password)
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email
    ]);

    // check if the user exists(if user exists throw the error.)
    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    }

    //bcrypt the password
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    //enter new user into our db
    let newUser = await pool.query(
      "INSERT INTO users (user_name, user_email, user_password) VALUES ($1, $2, $3) RETURNING *",
      [name, email, bcryptPassword]
    );

    //generate our jwt token
    const jwtToken = jwtGenerator(newUser.rows[0].user_id);

    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//log in route

router.post("/login", validInfo, async (req, res) => {

  try {

    //destructure the req.body (name, email, password)
    const { email, password } = req.body;

    // check if the user doesn't exists(if user doesn't exists throw the error.)
    const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [
      email
    ]);

    if (user.rows.length === 0) {
      return res.status(401).json("Email or Password is incorrect!");
    }

    //check if inputted password is the same as database password.
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );

    if (!validPassword) {
      return res.status(401).json("Email or Password is incorrect!");
    }

    //give them the jwttoken
    const token = jwtGenerator(user.rows[0].user_id);
    return res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/verify", authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
