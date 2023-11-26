const express = require('express');
const getTargetList = require('../../../../get-target-list');

const router = express.Router();
module.exports = router;

const pageMain = async (req, res) => {
  const { xid, currentUser } = res.locals;

  const links = await getTargetList(xid, null, currentUser.email, true);

  res.render('my-links.html.njk', {
    pageTitle: 'My Links',
    links,
  });
};

router.get('/', pageMain);
