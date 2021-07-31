const jwt = require("jsonwebtoken");
const moment = require("moment");

const validateRankingsQuery = (req, res, next) => {
  const { year, country, ...others } = req.query;

  if (Object.keys(others).length > 0) {
    res.status(400).json({
      error: true,
      message: "Invalid query parameters. Only year and country are permitted.",
    });
    return;
  } else if (year && !/^([0-9]{4})$/.test(year)) {
    res.status(400).json({
      error: true,
      message: "Invalid year format. Format must be yyyy",
    });

    return;
  } else if (country && !/^([a-zA-z() ]+)$/.test(country)) {
    res.status(400).json({
      error: true,
      message:
        "Invalid country format. Country query parameter cannot contain numbers.",
    });
    return;
  }
  next();
};

const authorise = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token = null;

  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
  } else if (!authorization) {
    res.status(401).json({
      error: true,
      message: "Authorization header ('Bearer token') not found",
    });
    return;
  } else if (authorization.split(" ").length !== 2) {
    res.status(401).json({
      error: true,
      message: "Authorization header is malformed",
    });
    return;
  }
  try {
    const secretKey = "secret key";
    const decoded = jwt.verify(token, secretKey);

    if (decoded.exp < Date.now()) {
      res.status(401).json({
        error: true,
        message: "JWT token has expired",
      });
      return;
    }
    next();
  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token",
    });
    return;
  }
};

const validateFactorsQuery = (req, res, next) => {
  const { limit, country, ...others } = req.query;

  const year = req.params.Year;
  if (year && !/^([0-9]{4})$/.test(year)) {
    res.status(400).json({
      error: true,
      message: "Invalid year format. Format must be yyyy",
    });
    return;
  } else if (Object.keys(others).length > 0) {
    res.status(400).json({
      error: true,
      message:
        "Invalid query parameters. Only limit and country are permitted.",
    });
    return;
  } else if (limit && !/^\+?([1-9]\d*)$/.test(limit)) {
    res.status(400).json({
      error: true,
      message: "Invalid limit query. Limit must be a positive number.",
    });
    return;
  } else if (country && !/^([a-zA-z() ]+)$/.test(country)) {
    res.status(400).json({
      error: true,
      message:
        "Invalid country format. Country query parameter cannot contain numbers.",
    });
    return;
  }
  next();
};

const authProfile = (req, res, next) => {
  const authorization = req.headers.authorization;
  let token = null;

  if (authorization && authorization.split(" ").length === 2) {
    token = authorization.split(" ")[1];
  } else if (!authorization) {
    // Unauthorised users get limited info
    next();
    return;
  } else if (authorization.split(" ").length !== 2) {
    res.status(401).json({
      error: true,
      message: "Authorization header is malformed",
    });
    return;
  }
  try {
    const secretKey = "secret key";
    const decoded = jwt.verify(token, secretKey);

    if (decoded.exp < Date.now()) {
      res.status(401).json({
        error: true,
        message: "JWT token has expired",
      });
      return;
    }
    next();
  } catch (e) {
    res.status(401).json({
      error: true,
      message: "Invalid JWT token",
    });
  }
};

const validateProfileQuery = (req, res, next) => {
  if (
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.dob ||
    !req.body.address
  ) {
    res.status(400).json({
      error: true,
      message:
        "Request body incomplete: firstName, lastName, dob and address are required.",
    });
    return;
  } else if (!moment(req.body.dob, "YYYY-MM-DD", true).isValid()) {
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a real date in format YYYY-MM-DD.",
    });
    return;
  } else if (Date.parse(req.body.dob) > Date.now()) {
    res.status(400).json({
      error: true,
      message: "Invalid input: dob must be a date in the past.",
    });
    return;
  } else if (
    !(typeof req.body.firstName === "string") ||
    !(typeof req.body.lastName === "string") ||
    !(typeof req.body.address === "string")
  ) {
    res.status(400).json({
      error: true,
      message:
        "Request body invalid, firstName, lastName and address must be strings only.",
    });
    return;
  }
  next();
};

module.exports = {
  validateRankingsQuery: validateRankingsQuery,
  authorise: authorise,
  validateFactorsQuery: validateFactorsQuery,
  authProfile: authProfile,
  validateProfileQuery: validateProfileQuery,
};
