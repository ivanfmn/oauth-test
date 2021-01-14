class OauthDatabase {
    constructor(collection) {
        this.collection = collection
    }
    postRefreshToken=(guid, refreshToken)=>{
        const insertData = {guid, refreshToken}
        return this.collection.insertOne(insertData)
    }
    getRefreshToken=(guid)=>{
        return this.collection.findOne({guid})
    }
    updateRefreshToken=(guid, refreshToken)=>{
        return this.collection.findOneAndUpdate({guid}, {$set:{refreshToken}}, {returnOriginal:false})
    }
}

module.exports = OauthDatabase