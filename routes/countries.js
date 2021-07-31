const express = require("express");
const router = express.Router();

router.get("/", function (req, res, next) {
  if (!(Object.keys(req.query).length === 0)) {
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Query parameters are not permitted.",
    });
  } else {
    req.db
      .from("rankings")
      .distinct("country")
      .pluck("country")
      .then((rows) => {
        res.status(200).json(rows.sort());
      })
      .catch((err) => {
        res.json({ Error: true, Message: "Error in MySQL query" });
      });
  }
});

module.exports = router;
