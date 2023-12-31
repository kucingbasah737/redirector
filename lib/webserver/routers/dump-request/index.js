const express = require('express');
const geoIp = require('geoip-lite');
const { rateLimit } = require('express-rate-limit');

const router = express.Router();
module.exports = router;

const limiter = rateLimit({
  windowMs: 2 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: true,
});

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageMain = (req, res) => {
  const retval = {
    status: 200,
    ts: new Date(),
    request: {
      clientIp: req.ip,
      clientIps: req.ips,
      uvid: res.locals.uvid || null,
      method: req.method,
      host: req.hostname,
      url: req.originalUrl,
      headers: req.headers,
      query: req.query,
      body: req.body,
    },
    geoIp: geoIp.lookup(req.ip),
    'trace-id': res.locals.xid,
  };

  if (req.query.text === undefined) {
    res.json(retval);
  } else {
    res.type('text/plain').end(JSON.stringify(retval, null, 2));
  }
};

router.use(limiter, pageMain);
