const OauthModel = require('../model/oauth.model')

class OauthController {
    constructor(collection) {
        this.oauthModel = new OauthModel(collection)
    }

    toGetTokens = async (req, res) => {
        try {
            const guid = req.query.guid
            const tokenPairs = await this.oauthModel.getTokenPairs(guid)
            if (!!tokenPairs) {
                res.status(200).send({...tokenPairs})
            } else {
                res.status(406).send()
            }
        } catch (e) {
            res.status(500).send()
        }
    }
    toRefreshTokenPairs = async (req, res) => {
        try {
            const {accessToken, refreshToken} = req.query
            if (accessToken === undefined || refreshToken === undefined) {
                res.status(406).send()
                return
            }
            const tokenPairs = await this.oauthModel.refreshTokenPairs(accessToken, refreshToken)
            if (!!tokenPairs) {
                res.status(200).send({...tokenPairs})
            } else {
                res.status(406).send()
            }
        } catch (e) {
            res.status(500).send()
        }
    }
}

module.exports = OauthController