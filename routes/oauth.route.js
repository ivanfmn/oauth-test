const express = require('express');
const router = express.Router();
const OauthController = require('../controller/oauth.controller')

/* GET home page. */
router.get('/oauth', ((req, res) => {
    const oauthController = new OauthController(req.app.locals.collection)
    return oauthController.toGetTokens(req, res)
}))
router.post('/oauth/refresh', ((req, res) => {
    const oauthController = new OauthController(req.app.locals.collection)
    return oauthController.toRefreshTokenPairs(req, res)
}))

module.exports = router;
