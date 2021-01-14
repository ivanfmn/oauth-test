const express = require('express');
const router = express.Router();
const OauthController = require('../controller/oauth.controller')

router.get('/oauth', (function (req, res){
    const oauthController = new OauthController(req.app.locals.collection)
    return oauthController.toGetTokens(req, res)
}))
router.get('/oauth/refresh', (function (req, res){
    const oauthController = new OauthController(req.app.locals.collection)
    return oauthController.toRefreshTokenPairs(req, res)
}))

module.exports = router;
