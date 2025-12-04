const mongoose = require('mongoose')

const e_commerce_users = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    }

})

module.exports = mongoose.model('e_commerce_users', e_commerce_users)
