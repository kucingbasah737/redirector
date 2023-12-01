const express = require('express');
const geo = require('geoip-lite');

const router = express.Router();
module.exports = router;

const pageMain = (req, res) => {
  const ip = req.params.ip || req.ip;
  res.json({
    ip,
    geoipLookupResult: geo.lookup(ip),
  });
};

router.all('/', pageMain);
router.all('/:ip', pageMain);
