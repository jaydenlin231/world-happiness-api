const express = require("express");
const router = express.Router();
const middlewares = require("./middlewares");

router.get("/", middlewares.validateRankingsQuery, function (req, res, next) {
  const { year, country, ...others } = req.query;

  if (!year && !country && Object.keys(others).length === 0) {
    req.db
      .from("rankings")
      .select("rank", "country", "score", "year")
      .orderBy("year", "desc")
      .then((rows) => {
        res.status(200).json(rows);
      });
    return;
  } else if (year && !country) {
    req.db
      .from("rankings")
      .select("rank", "country", "score", "year")
      .where("year", "=", `${year}`)
      .orderBy("rank", "asc")
      .then((rows) => {
        res.status(200).json(rows);
      });
    return;
  } else if (country && !year) {
    req.db
      .from("rankings")
      .select("rank", "country", "score", "year")
      .where("country", "=", `${country}`)
      .orderBy("year", "desc")
      .then((rows) => {
        res.status(200).json(rows);
      });
    return;
  } else if (country && year) {
    req.db
      .from("rankings")
      .select("rank", "country", "score", "year")
      .where("country", "=", `${country}`)
      .andWhere("year", "=", `${year}`)
      .then((rows) => {
        res.status(200).json(rows);
      });
    return;
  }
});

module.exports = router;
