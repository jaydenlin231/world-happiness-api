const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const knexOptions = require("./knexfile.js");
const knex = require("knex")(knexOptions);
const cors = require("cors");
const helmet = require("helmet");
const swaggerUI = require("swagger-ui-express");

const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const countriesRouter = require("./routes/countries");
const rankingsRouter = require("./routes/rankings");
const factorsRouter = require("./routes/factors");
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("common"));
// log req and res headers
logger.token("req", (req, res) => JSON.stringify(req.headers));
logger.token("res", (req, res) => {
  const headers = {};
  res.getHeaderNames().map((h) => (headers[h] = res.getHeader(h)));
  return JSON.stringify(headers);
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  req.db = knex;
  next();
});
app.use(cors());
app.use(helmet());

app.use("/", swaggerUI.serve, indexRouter);
app.use("/user", userRouter);
app.use("/countries", countriesRouter);
app.use("/rankings", rankingsRouter);
app.use("/factors", factorsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
