const express = require('express')
const cors = require('cors')
const config = require('config');

// Routes
const routes = require('./routes/api')
const users = require('./routes/users');
const auth = require('./routes/auth');

const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

if (!config.get('PrivateKey')) {
    console.error('FATAL ERROR: PrivateKey is not defined.');
    process.exit(1);
}

app.use(cors())
app.use(express.json())
app.use(bodyParser.json())
app.use('/api', routes)
app.use('/api/users', users);
app.use('/api/auth', auth);



const uri = process.env.ATLAS_URI
mongoose.connect(uri)
const connection = mongoose.connection
connection.once('open', () => {
    console.log('MongoDB database connection established successfully')
})
mongoose.Promise = global.Promise

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`)
})
