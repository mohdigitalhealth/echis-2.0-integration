const bodyParser = require('body-parser');
const express = require('express')
const app = express();
const { registerMediator } = require("openhim-mediator-utils");
const { OPENHIM } = require("./config");
const registryRoutes = require('./src/routes/client');
const referralRoutes = require('./src/routes/referral');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/client', registryRoutes);
app.use('/referral', referralRoutes);

const PORT = 9000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

const registerMediatorCallback = (err) => {
  if (err) {
    throw new Error(`Mediator Registration Failed: Reason ${err}`);
  }

  logger.info("Successfully registered mediator.");
};

registerMediator(OPENHIM, mediatorConfig, registerMediatorCallback);

app.get("/", (req, res) => {
  res.send("Loaded");
});
