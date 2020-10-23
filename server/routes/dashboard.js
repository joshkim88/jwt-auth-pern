const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async (req, res) => {
  try {
    // const user = await pool.query(
    //   "SELECT * user_name FROM users WHERE user_id = $1",
    //   [req.user]);
    // res.json(user.rows[0]);
    //request.user has the paylod
    res.json(req.user);
  //if would be req.user if you change your payload to this:

  //   function jwtGenerator(user_id) {
  //   const payload = {
  //     user: user_id
  //   };
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server error");
  }
});

module.exports = router;
