const MODULE_NAME = 'WEBSERVER.ROUTERS.DASHBOARD.ROUTER.MY-LINKS';

const DAYS = 45;
const HOURS = 36;

const urlJoin = require('url-join');
const express = require('express');

const logger = require('../../../../logger');
const sanitizePathName = require('../../../../sanitize-path-name');
const getHostnameList = require('../../../../get-hostname-list');
const getTargetList = require('../../../../get-target-list');
const getTarget = require('../../../../get-target');
const getTargetByUuid = require('../../../../get-target-by-uuid');
const updateTarget = require('../../../../update-target');
const insertTarget = require('../../../../insert-target');
const getHitsDaily = require('../../../../get-hits-daily');
const getHitsHourly = require('../../../../get-hits-hourly');
const getUserList = require('../../../../get-user-list');
const isHostnameAllowedForUser = require('../../../../is-hostname-allowed-for-user');

const router = express.Router();
module.exports = router;

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const init = (req, res, next) => {
  res.locals.basePath = req.baseUrl;
  next();
};

const pageMain = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const showAllUsers = res.locals.showAllUsers && res.locals.currentUser?.super;

  try {
    const emailSelector = showAllUsers
      ? null
      : currentUser.email;

    const links = await getTargetList(xid, null, emailSelector, true);
    const hitsPerDay = await getHitsDaily(xid, null, emailSelector, DAYS, true);
    const hitsPerHour = await getHitsHourly(xid, null, emailSelector, HOURS, true);

    res.render('my-links.html.njk', {
      pageTitle: showAllUsers ? 'All Links From All Users' : 'My Links',
      links,
      hitsPerDay,
      hitsPerHour,
    });
  } catch (e) {
    logger.warn(`${MODULE_NAME} 3DCC91A1: Exception on pageMain`, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.status(500).json({
      status: 500,
      message: 'Exception',
      'trace-id': xid,
    });
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
const pageViewByUuid = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const { uuid } = req.params;

  if (!uuid) {
    res.redirect(req.baseUrl);
    return;
  }

  try {
    const target = await getTargetByUuid(xid, uuid);
    if (!target) {
      res.redirect(req.baseUrl);
      return;
    }

    if (!currentUser.super && (target.user_email !== currentUser.email)) {
      logger.verbose(`${MODULE_NAME} 1039F1C0: Unauthorized access pageViewByUuid`, {
        xid,
        ip: req.ip,
        currentUser,
        targetEmailOwner: target.user_email,
      });

      res.status(403).json({
        status: 403,
        message: 'Forbidden',
        'trace-id': xid,
      });

      return;
    }

    res.redirect(urlJoin(req.baseUrl, 'view', target.hostname, target.name));
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 1039F1C0: Exception on pageViewByUuid`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

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
  const { hostname, name } = req.params;

  if (!hostname || !name) {
    res.status(400).json({
      status: 400,
      message: 'Invalid parameter',
      'trace-id': xid,
    });

    return;
  }

  try {
    const target = await getTarget(xid, hostname, name);
    if (!target) {
      res.redirect(req.baseUrl);
      return;
    }

    if (!currentUser.super && (target.user_email !== currentUser.email)) {
      logger.verbose(`${MODULE_NAME} 797B60CE: Unauthorized access to view link detail`, {
        xid,
        ip: req.ip,
        currentUser,
        targetEmailOwner: target.user_email,
      });

      res.status(403).json({
        status: 403,
        message: 'Forbidden',
        'trace-id': xid,
      });

      return;
    }

    const userList = currentUser?.super
      ? await getUserList(xid)
      : null;

    const hitsPerDay = await getHitsDaily(xid, target.uuid, null, DAYS, true);
    const hitsPerHour = await getHitsHourly(xid, target.uuid, null, HOURS, true);
    const hostnameList = await getHostnameList(xid, currentUser);

    res.render('my-links.view.html.njk', {
      pageTitle: 'Link Detail',
      target,
      userList,
      hitsPerDay,
      hitsPerHour,
      hostnameList,
      editFormAction: urlJoin(req.baseUrl, 'update'),
    });
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} FB7CED7C: Exception on pageView`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.redirect(req.baseUrl);
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageUpdateSubmit = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const {
    linkUuid: uuid,
    linkHostname: hostname,
    linkUserEmail: email,
    linkName: name,
    linkTarget: targetUrl,
    linkDisabled: disabled,
  } = req.body;

  if (!uuid) {
    res.redirect(req.baseUrl);
    return;
  }

  try {
    const target = await getTargetByUuid(xid, uuid);
    if (!target) {
      logger.verbose(`${MODULE_NAME} 5C86C0FF: Target to update is not exists`, {
        xid,
        ip: req.ip,
        requestBody: req.body,
      });

      res.redirect(req.baseUrl);
      return;
    }

    if (!currentUser.super && target.user_email !== currentUser.email) {
      res.status(403).json({
        status: 403,
        message: 'Forbidden',
        'trace-id': xid,
      });

      logger.warn(`${MODULE_NAME} 1851E0DD: Forbidden attempt to updating target`, {
        xid,
        ip: req.ip,
        currentUser,
        target,
      });

      return;
    }

    const isAllowedHostname = await isHostnameAllowedForUser(
      xid,
      hostname || target.hostname,
      currentUser,
    );

    if (!isAllowedHostname) {
      res.status(403).json({
        status: 403,
        message: 'You\'re not allowed to using this hostname',
        'trace-id': xid,
      });

      return;
    }

    const sanitizedName = sanitizePathName(name);

    if (!sanitizedName) {
      res.redirect(urlJoin(
        req.baseUrl,
        'view',
        target.hostname,
        target.name,
      ));

      return;
    }

    /**
     * @type {import('../../../../update-target').NewTargetValues}
     */
    const newValues = {
      user_email: (currentUser.super && email) || target.user_email,
      name: name || target.name,
      hostname: hostname || target.hostname,
      target_url: targetUrl || target.target_url,
      disabled: disabled ? 1 : 0,
    };

    logger.verbose(`${MODULE_NAME} 7B9F7449: Processing request to update target`, {
      xid,
      ip: req.ip,
      currentUser,
      oldValues: target,
      newValues,
    });

    await updateTarget(xid, uuid, newValues);
    res.redirect(urlJoin(req.baseUrl, 'view', newValues.hostname, newValues.name));
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 3AF173EB: Exception on updating target`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.status(500).json({
      status: 500,
      message: 'Exception',
      'trace-id': xid,
    });
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageAdd = async (req, res) => {
  const {
    xid,
  } = res.locals;

  /**
   * @type {import('../../../../get-user-by-email').User}
   */
  const currentUser = res.locals.currentUser || null;

  try {
    const hostnameList = await getHostnameList(xid, currentUser);

    const userList = currentUser.super
      ? await getUserList(xid)
      : null;

    res.render('my-links.add.html.njk', {
      pageTitle: 'Create a new link',
      hostnameList,
      userList,
      editFormAction: urlJoin(req.baseUrl, 'add'),
    });
  } catch (e) {
    logger.warn(`${MODULE_NAME} A9187613: Exception on showing pageAdd`, {
      xid,
      eCode: e.code,
      eMessage: e.message,
    });

    res.status(500).json({
      status: 500,
      message: 'Something wrong in this universe',
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
  const {
    linkUserEmail: email,
    linkHostname: hostname,
    linkName: name,
    linkTarget: targetUrl,
    linkDisabled: disabled,
  } = req.body;

  try {
    const isAllowedHostname = await isHostnameAllowedForUser(
      xid,
      hostname,
      currentUser,
    );

    if (!isAllowedHostname) {
      res.status(403).json({
        status: 403,
        message: 'You\'re not allowed to using this hostname',
        'trace-id': xid,
      });

      return;
    }

    const sanitizedName = sanitizePathName(name);
    if (!sanitizePathName) {
      res.redirect(urlJoin(req.baseUrl, 'add'));
      return;
    }

    await insertTarget(
      xid,
      (currentUser.super && email) || currentUser.email,
      hostname,
      sanitizedName,
      targetUrl,
      disabled,
    );

    res.redirect(urlJoin(req.baseUrl, 'view', hostname, sanitizedName));
  } catch (e) {
    logger.warn(`${MODULE_NAME} A34DF11F: Exception on pageAddSubmit`, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.status(500).json({
      status: 500,
      message: 'Exception',
      'trace-id': xid,
    });
  }
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const pageHitCount = async (req, res) => {
  const { xid, currentUser } = res.locals;
  const { selector, uuid } = req.params;

  if (!selector || !uuid) {
    res.status(400).json({
      status: 400,
      message: 'Invalid',
      'trace-id': xid,
    });

    return;
  }

  try {
    const target = await getTargetByUuid(xid, uuid);
    if (!target) {
      res.status(404).json({
        status: 404,
        message: 'Link not found',
        'trace-id': xid,
      });

      return;
    }

    if (!currentUser.super && target.user_email !== currentUser.email) {
      res.status(403).json({
        status: 403,
        message: 'Unauthorized',
        'trace-id': xid,
      });

      return;
    }

    let hitCount;

    if (selector === 'today') {
      hitCount = await getHitsDaily(xid, target.uuid, null, 1, true);
    } else if (selector === 'this-hour') {
      hitCount = await getHitsHourly(xid, target.uuid, null, 1, true);
    }

    if (!hitCount) {
      res.status(404).json({
        status: 404,
        message: 'No data available',
      });

      return;
    }

    // res.json(hitCount); return;

    const value = hitCount[0]?.value || 0;
    res.end((value).toString());
  } catch (e) {
    const newE = new Error(`${MODULE_NAME} 599F2901: Exception on pageHitCount`);

    logger.warn(newE.message, {
      xid,
      eCode: e.code,
      eMessage: e.message || e.toString(),
    });

    res.status(500).json({
      status: 500,
      message: 'Exception',
      'trace-id': xid,
    });
  }
};

router.use(init);

router.get('/', pageMain);
router.get(
  '/all-users',

  (req, res, next) => {
    const { xid } = res.locals;
    if (!res.locals.currentUser?.super) {
      res.status(403).json({
        status: 403,
        message: 'Forbidden',
        'trace-id': xid,
      });

      return;
    }

    res.locals.showAllUsers = true;
    next();
  },

  pageMain,
);

router.get('/view/:uuid', pageViewByUuid);
router.get('/view/:hostname/:name', pageView);
router.post('/update', express.urlencoded({ extended: false }), pageUpdateSubmit);
router.get('/add', pageAdd);
router.post('/add', express.urlencoded({ extended: false }), pageAddSubmit);
router.get('/hit-count/:selector/:uuid', pageHitCount);
