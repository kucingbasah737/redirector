const MODULE_NAME = 'WEBSERVER.ROUTERS.DASHBOARD.ROUTER.MY-LINKS';

const urlJoin = require('url-join');
const express = require('express');

const logger = require('../../../../logger');
const sanitizePathName = require('../../../../sanitize-path-name');
const getHostnameList = require('../../../../get-hostname-list');
const getTargetList = require('../../../../get-target-list');
const getTargetByUuid = require('../../../../get-target-by-uuid');
const updateTarget = require('../../../../update-target');
const insertTarget = require('../../../../insert-target');

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

  const links = await getTargetList(xid, null, currentUser.email, true);

  res.render('my-links.html.njk', {
    pageTitle: 'My Links',
    links,
  });
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
const pageView = async (req, res) => {
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

    if (target.user_email !== currentUser.email) {
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

    const hostnameList = await getHostnameList(xid);

    res.render('my-links.view.html.njk', {
      pageTitle: 'Link Detail',
      target,
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

    const sanitizedName = sanitizePathName(name);

    if (!sanitizedName) {
      res.redirect(urlJoin(
        req.baseUrl,
        'view',
        uuid,
      ));

      return;
    }

    /**
     * @type {import('../../../../update-target').NewTargetValues}
     */
    const newValues = {
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

    // res.json({
    //   oldValues: target,
    //   requestBody: req.body,
    //   newValues,
    // });

    await updateTarget(xid, uuid, newValues);
    res.redirect(urlJoin(req.baseUrl, 'view', uuid));
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
  const { xid } = res.locals;

  try {
    const hostnameList = await getHostnameList(xid);

    res.render('my-links.add.html.njk', {
      pageTitle: 'Create a new link',
      hostnameList,
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
    linkHostname: hostname,
    linkName: name,
    linkTarget: targetUrl,
    linkDisabled: disabled,
  } = req.body;

  try {
    const sanitizedName = sanitizePathName(name);
    if (!sanitizePathName) {
      res.redirect(urlJoin(req.baseUrl, 'add'));
      return;
    }

    const newUuid = await insertTarget(
      xid,
      currentUser.email,
      hostname,
      sanitizedName,
      targetUrl,
      disabled,
    );

    res.redirect(urlJoin(req.baseUrl, 'view', newUuid));
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

router.use(init);
router.get('/', pageMain);
router.get('/view/:uuid', pageView);
router.post('/update', express.urlencoded({ extended: false }), pageUpdateSubmit);
router.get('/add', pageAdd);
router.post('/add', express.urlencoded({ extended: false }), pageAddSubmit);
