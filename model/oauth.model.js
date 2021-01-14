const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const OauthDatabase = require('./oauth.database')

class OauthModel {
    constructor(collection) {
        this.oauthDatabase = new OauthDatabase(collection)
    }

    getTokenPairs = async (guid) => {
        const accessToken = await this.__getAccessToken(guid)
        const refreshToken = await this.__getRefreshToken(accessToken)
        const refreshTokenHash = await this.__toHash(refreshToken)
        const foundRefreshTokenDatabase = await this.oauthDatabase.getRefreshToken(guid)
        if (foundRefreshTokenDatabase != null) {
            await this.oauthDatabase.updateRefreshToken(guid, refreshTokenHash)
        } else {
            await this.oauthDatabase.postRefreshToken(guid, refreshTokenHash)
        }
        return {accessToken, refreshToken}
    }
    refreshTokenPairs = async (accessToken, refreshToken) => {
        try {
            const payload = jwt.verify(accessToken, process.env['JWT_PRIVATE_KEY'], {ignoreExpiration: true})
            const guid = payload.guid
            const compare = accessToken.slice(-Number(process.env['RT_SYNC_JWT_LENGTH'])) === refreshToken.slice(-Number(process.env['RT_SYNC_JWT_LENGTH']))
            if (compare) {
                const refreshTokenDatabaseHash = (await this.oauthDatabase.getRefreshToken(guid)).refreshToken
                if (await this.__compareRefreshToken(refreshToken, refreshTokenDatabaseHash) && this.__checkExpiresRefreshToken(refreshToken)) {
                    const accessTokenUpdated = this.__getAccessToken(guid)
                    const refreshTokenUpdated = await this.__getRefreshToken(accessTokenUpdated)
                    const refreshTokenUpdatedHash = await this.__toHash(refreshTokenUpdated)
                    this.oauthDatabase.updateRefreshToken(guid, refreshTokenUpdatedHash)
                    return {accessToken: accessTokenUpdated, refreshToken: refreshTokenUpdated}
                } else return false
            } else return false
        } catch (e) {
            console.log(e)
            throw new Error(e)
        }
    }
    __getAccessToken = (guid) => {
        const algorithm = 'HS512'
        const expiresIn = Number(process.env['JWT_EXPIRES']) // 30 minutes
        return jwt.sign({guid}, process.env['JWT_PRIVATE_KEY'], {algorithm, expiresIn})
    }
    __getRefreshToken = async (accessToken) => {
        const shortAccessToken = accessToken.toString().slice(-6)
        const randomString = await crypto.randomBytes(Number(process.env['RT_RANDOM_LENGTH']) / 2).toString('hex')
        const expires = Math.floor(Date.now() / 1000) + Number(process.env['RT_EXPIRES']) // 7 days
        return `${expires}${randomString}${shortAccessToken}`
    }
    __toHash = (object) => {
        return bcrypt.hash(object.toString(), 10)
    }
    __compareRefreshToken = (refreshToken, refreshTokenHash) => {
        return bcrypt.compareSync(refreshToken.toString(), refreshTokenHash.toString())
    }
    __checkExpiresRefreshToken = (refreshToken) => {
        const lengthExpiresDate = refreshToken.length - (Number(process.env['RT_RANDOM_LENGTH']) + Number(process.env['RT_SYNC_JWT_LENGTH']))
        const expiresDate = refreshToken.substr(0, lengthExpiresDate)
        return Math.floor(Date.now() / 1000) < expiresDate
    }
}

module.exports = OauthModel