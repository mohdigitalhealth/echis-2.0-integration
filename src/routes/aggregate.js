const {Router} = require('express');
const {getMoh515Data} = require('../controllers/aggregate');

const router = Router();

router.get('/',
  async (req, res) => {
    await getMoh515Data(req, res);
  });

module.exports = router;
