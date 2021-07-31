const express = require("express");
const router = express.Router();
const swaggerUI = require("swagger-ui-express");
const swaggerDoc = require("./../docs/swagger.json");

// Hide schema section in Swagger
const options = {
  swaggerOptions: {
    defaultModelsExpandDepth: -1,
  },
};

router.use("/", swaggerUI.serve);

router.get("/", swaggerUI.setup(swaggerDoc, options), function (res, next) {
  res.status(200);
});

module.exports = router;
