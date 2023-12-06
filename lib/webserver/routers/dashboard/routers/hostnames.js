const MODULE_NAME = 'WEBSERVER.ROUTERS.DASHBOARD.ROUTERS.HOSTNAMES';

const express = require('express');
const logger = require('../../../../logger');
const getHostnameList = require('../../../../get-hostname-list');
const insertHostname = require('../../../../insert-hostname');
const getHostname = require('../../../../get-hostname');

const router = express.Router();
module.exports = router;

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const init = (req, res, next) => {
  res.locals.baseUrl = req.baseUrl;
  next();
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageMain = async (req, res) => {
  const { xid, currentUser } = res.locals;

  if (!currentUser.super) {
    res.status(403).json({
      status: 403,
      message: 'No no no no, you may not access this resouce',
      'trace-id': xid,
    });

    return;
  }

  try {
    const hostnames = await getHostnameList(xid);

    res.render('hostnames.index.html.njk', {
      pageTitle: 'Hostname List',
      hostnames,
    });
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 4C6D2F14: Exception on pageMain`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString,
    });

    res.status(500).json({
      status: 500,
      message: newE.message,
      'trace-id': xid,
    });
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageAddSubmit = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const { hostname } = req.body;

  if (!hostname) {
    res.status(500).json({
      status: 500,
      message: 'Missing required parameter',
      'trace-id': xid,
    });

    return;
  }

  if (!currentUser.super) {
    res.status(403).json({
      status: 403,
      message: 'Are you kidding? You are not authorized to add a new hostname in this system',
      'trace-id': xid,
    });

    return;
  }

  try {
    await insertHostname(xid, hostname);
    req.flash('success', `Okay, we will serve "${hostname}" from now.`);
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} FCBAA188: Exception on pageAddSubmit`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    req.flash('warn', `Failed to register "${hostname}". Please make sure if it wasn't registered before.`);
  } finally {
    res.redirect(req.baseUrl);
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageView = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const { hostnameName } = req.params;

  if (!currentUser.super) {
    res.status(403).json({
      status: 403,
      message: 'Joking? No, you are not authorized to access this page.',
      'trace-id': xid,
    });

    return;
  }

  if (!hostnameName) {
    res.status(403).json({
      status: 403,
      message: 'Missing parameter',
      'trace-id': xid,
    });

    return;
  }

  try {
    const hostname = await getHostname(xid, hostnameName);

    if (!hostname) {
      res.status(404).json({
        status: 404,
        message: 'No matched hostname',
        'trace-id': xid,
      });

      return;
    }

    res.render('hostnames.view.html.njk', {
      pageTitle: `Host: ${hostname.name}`,
      hostname,
    });
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 9C160F91: Exception on pageView`);

    logger.warn(newE.message, {
      xid,
      hostnameName,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.status(500).json({
      status: 500,
      message: 'Something wrong',
      'trace-id': xid,
    });
  }
};

router.use(init);
router.get('/', pageMain);
router.post('/add', express.urlencoded({ extended: false }), pageAddSubmit);
router.get('/view/:hostnameName', pageView);
