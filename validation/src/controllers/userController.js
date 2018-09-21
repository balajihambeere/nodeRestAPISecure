var mongoose = require('mongoose');
var UserSchema = require('../models/userModel');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const { validationResult } = require('express-validator/check');

const User = mongoose.model('User', UserSchema);

const register = (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
        return response.status(422).json({ errors: errors.array() });
    }

    let newUser = new User(request.body);
    newUser.password = bcrypt.hashSync(request.body.password, 10);
    newUser.save((error, user) => {
        if (error) {
            response.send(error);
        } else {
            user.password = undefined;
            response.json(user);
        }
    });
}

const login = (request, response) => {
    User.findOne({ username: request.body.username }, (error, user) => {
        if (error) {
            throw err;
        }
        if (!user) {
            response.status(401).json({ message: 'Authentication failed. No user found!' });
        } else if (user) {
            if (!user.comparePassword(request.body.password, user.password)) {
                response.status(401).json({ message: 'Authentication failed. Wrong password!' });
            }
            else {
                return response.json({ token: jwt.sign({ username: user.username, _id: user.id }, 'SIGNIN') });
            }
        }
    });
}

const isAuthenticated = (request, response, next) => {
    if (request.user) {
        next();
    } else {
        return response.status(401).json({ message: 'Unauthorized user!' });
    }
}

module.exports = {
    register,
    login,
    isAuthenticated
}