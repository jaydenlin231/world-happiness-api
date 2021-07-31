const express = require("express");
const router = express.Router();
const middlewares = require("./middlewares");

router.get(
  "/:Year",
  middlewares.authorise,
  middlewares.validateFactorsQuery,
  function (req, res) {
    const year = req.params.Year;
    const { limit, country } = req.query;

    if (!limit && !country) {
      req.db
        .from("rankings")
        .select(
          "rank",
          "country",
          "score",
          "economy",
          "family",
          "health",
          "freedom",
          "generosity",
          "trust"
        )
        .where("year", "=", `${year}`)
        .orderBy("rank", "asc")
        .then((rows) => {
          res.status(200).json(rows);
        });
    } else if (limit && !country) {
      req.db
        .from("rankings")
        .limit(limit)
        .select(
          "rank",
          "country",
          "score",
          "economy",
          "family",
          "health",
          "freedom",
          "generosity",
          "trust"
        )
        .where("year", "=", `${year}`)
        .orderBy("rank", "asc")
        .then((rows) => {
          res.status(200).json(rows);
        });
    } else if (!limit && country) {
      req.db
        .from("rankings")
        .select(
          "rank",
          "country",
          "score",
          "economy",
          "family",
          "health",
          "freedom",
          "generosity",
          "trust"
        )
        .where("year", "=", `${year}`)
        .andWhere("country", "=", `${country}`)
        .then((rows) => {
          res.status(200).json(rows);
        });
    } else if (limit && country) {
      req.db
        .from("rankings")
        .limit(limit)
        .select(
          "rank",
          "country",
          "score",
          "economy",
          "family",
          "health",
          "freedom",
          "generosity",
          "trust"
        )
        .where("year", "=", `${year}`)
        .andWhere("country", "=", `${country}`)
        .then((rows) => {
          res.status(200).json(rows);
        });
    }
  }
);

module.exports = router;
