const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const middlewares = require("./middlewares");
const moment = require("moment");

router.post("/register", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
    return;
  }

  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);

  queryUsers.then((results) => {
    if (results.length > 0) {
      res.status(409).json({
        error: true,
        message: "User already exists",
      });
      return;
    } else {
      const saltRounds = 10;
      const hash = bcrypt.hashSync(password, saltRounds);
      req.db
        .from("users")
        .insert({
          email: `${email}`,
          hash: `${hash}`,
        })
        .then((_) => {
          res.status(201).json({ message: "User created" });
        });
    }
  });
});

router.post("/login", function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete, both email and password are required",
    });
    return;
  }

  const queryUsers = req.db
    .from("users")
    .select("*")
    .where("email", "=", email);
  queryUsers
    .then((results) => {
      if (results.length === 0) {
        res.status(401).json({
          error: true,
          message: "Incorrect email or password",
        });
        return;
      }

      const user = results[0];
      return bcrypt.compare(password, user.hash);
    })
    .then((match) => {
      if (!match) {
        res.status(401).json({
          error: true,
          message: "Incorrect email or password",
        });
        return;
      }

      const secretKey = "secret key";
      const expires_in = 60 * 60 * 24; // 1 Day
      const exp = Date.now() + expires_in * 1000;
      const token = jwt.sign({ email, exp }, secretKey);

      res.status(200).json({
        token: `${token}`,
        token_type: "Bearer",
        expires_in: expires_in,
      });
      return;
    })
    .catch((e) => {
      return;
    });
});

router.get(
  "/:Email/profile",
  middlewares.authProfile,
  function (req, res, next) {
    const email = req.params.Email;
    const authorization = req.headers.authorization;

    const queryUsers = req.db
      .from("users")
      .select("*")
      .where("email", "=", email);

    queryUsers.then((result) => {
      if (result.length === 0) {
        res.status(404).json({
          error: true,
          message: "User not found",
        });
        return;
      } else if (authorization) {
        const token = authorization.split(" ")[1];
        const secretKey = "secret key";
        const decoded = jwt.verify(token, secretKey);

        if (decoded.email === email) {
          res.status(200).json({
            email: result[0].email,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
            dob:
              result[0].dob === null
                ? null
                : moment(result[0].dob).format("YYYY-MM-DD"),
            address: result[0].address,
          });
        } else {
          // Unmatched email users get limited info
          res.status(200).json({
            email: result[0].email,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
          });
        }
      } else if (!authorization) {
        // Unauthorised users get limited info
        res.status(200).json({
          email: result[0].email,
          firstName: result[0].firstName,
          lastName: result[0].lastName,
        });
      }
    });
  }
);

router.put(
  "/:Email/profile",
  middlewares.authorise,
  middlewares.validateProfileQuery,
  function (req, res, next) {
    const email = req.params.Email;

    const authorization = req.headers.authorization;
    const token = authorization.split(" ")[1];
    const secretKey = "secret key";
    const decoded = jwt.verify(token, secretKey);

    if (decoded.email !== email) {
      // Unmatched email users cannot change another user info
      res.status(403).json({
        error: true,
        message: "Forbidden",
      });
      return;
    } else if (decoded.email === email) {
      const updatedBody = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        dob: req.body.dob,
        address: req.body.address,
      };

      req
        .db("users")
        .where("email", "=", `${email}`)
        .update(updatedBody)
        .then((_) =>
          res.status(200).json({
            email: email,
            ...updatedBody,
          })
        );
    }
  }
);

module.exports = router;
