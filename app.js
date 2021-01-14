const express = require('express');
const MongoClient = require('mongodb').MongoClient

const indexRouter = require('./routes/oauth.route');
const mongoClient = new MongoClient("mongodb://localhost:27017/", {useNewUrlParser: true});
const app = express();

process.env['JWT_PRIVATE_KEY'] = 'f3p9o@fjM$O9f32!m40c$3fjfJ4xcm'
process.env['RT_RANDOM_LENGTH'] = '10'  // only even 2, 4, 6, 8...
process.env['RT_SYNC_JWT_LENGTH'] = '6'
process.env['JWT_EXPIRES'] = '1800'     // 60 * 30 = 30 minutes
process.env['RT_EXPIRES'] = '604800'    // 60 * 60 * 24 * 7 = 7 days

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use('/api', indexRouter);

mongoClient.connect((err, client) => {
    if (err) return console.log(err)
    app.locals.collection = client.db('user').collection('refresh_token')
})

app.listen(3000, () => {
    console.log('server listen in localhost:3000')
})
