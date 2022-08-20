const express = require('express')
const router = express.Router()

// router.get('/todos', (req, res, next) => {});

// router.post('/todos', (req, res, next) => {});

// router.delete('/todos/:id', (req, res, next) => {});

const Todo = require('../models/todo')

router.get('/todos', (req, res, next) => {
    Todo.find({}, 'action')
        .then((data) => res.json(data))
        .catch(next)
})

router.post('/todos', (req, res, next) => {
    console.log('Sending to database...')
    if (req.body.action) {
        Todo.create(req.body)
            .then((data) => {
                res.json(data)
                console.log(data)
            })
            .catch(next)
    } else {
        res.json({
            error: 'The input field is empty',
        })
    }
})

router.delete('/todos/:id', (req, res, next) => {
    Todo.findOneAndDelete({ _id: req.params.id })
        .then((data) => res.json(data))
        .catch(next)
})

module.exports = router
