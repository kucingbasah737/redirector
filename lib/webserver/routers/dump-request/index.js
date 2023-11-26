const express = require('express');
const geoIp = require('geoip-lite');

const router = express.Router();
module.exports = router;

const pageMain = (req, res) => {
  res.json({
    status: 200,
    ts: new Date(),
    request: {
      clientIp: req.ip,
      method: req.method,
      host: req.hostname,
      url: req.originalUrl,
      headers: req.headers,
      query: req.query,
      body: req.body,
    },
    geoIp: geoIp.lookup(req.ip),
    'trace-id': res.locals.xid,
  });
};

router.use(pageMain);
