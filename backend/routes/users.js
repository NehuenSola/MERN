const jwt = require('jsonwebtoken')
const config = require('config')
const { User, validate } = require('../models/user')
const express = require('express')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const router = express.Router()
const crypto = require('crypto')
const nodemailer = require('nodemailer')
require('dotenv').config()

// let transporter = nodemailer.createTransport({
//     host: 'smtp-mail.outlook.com', // hostname
//     secureConnection: false, // TLS requires secureConnection to be false
//     port: 587, // port for secure SMTP
//     auth: {
//         user: process.env.OUTLOOK_USER,
//         pass: process.env.OUTLOOK_PASSWORD,
//     },
//     tls: {
//         ciphers: 'SSLv3',
//     },
// })
transporter = nodemailer.createTransport({
    service: 'Gmail', // hostname
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
    },
    tls: {
        ciphers: 'SSLv3',
    },
})

let mailOptions, host, link

router.post('/', async (req, res) => {
    // First Validate The Request
    const { error } = validate(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message)
    }

    // Check if this user already exisits
    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).send('That user already exisits!')
    } else {
        // Insert the new user if they do not exist yet
        user = new User(_.pick(req.body, ['name', 'email', 'password']))

        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)

        const verificationHash = crypto.randomBytes(20).toString('hex')
        user.emailVerificationHash = await bcrypt.hash(verificationHash, salt)
        user.emailVerified = false

        host = req.get('host')
        link = `http://${host}/verify?id=${verificationHash}`

        mailOptions = {
            from: `"Nehuen Sola" <${process.env.GMAIL_USER}>`,
            to: user.email,
            subject: `Hello, ${user.name}! Please confirm your Email account`,
            html:
                'Hello &#10084;,<br> Please Click on the link to verify your email.<br><a href=' +
                link +
                '>Click here to verify</a>',
        }

        console.log('Sending email...')
        transporter.sendMail(mailOptions, function (error, response) {
            if (error) {
                console.log(error)
                res.end('error')
            } else {
                console.log('Message sent: ' + response.message)
            }
        })

        console.log('Saving user...')
        // Save user data after the validation email has been sent.
        // await user.save()

        const token = jwt.sign({ _id: user._id }, config.get('PrivateKey'))
        res.header('x-auth-token', token).send(
            _.pick(user, ['_id', 'name', 'email'])
        )
    }
})

module.exports = router
