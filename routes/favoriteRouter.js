const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) =>
        res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorite.find({ user: req.user._id })
            .populate('user')
            .populate('campsites')
            .then(favorites => {
                res.StatusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    req.body.forEach(campsite => {
                        if (!favorite.campsites.includes(campsite._id)) {
                            favorite.campsites.push(campsite._id);
                        } else {
                        favorite.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                            .catch(err => next(err));
                        }
                    })
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite Created', favorite);
                            res.StatusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                    }
            })
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOneAndDelete({ user: req.user._id })
        .then(favorite => {
            res.statusCode = 200;
            if (favorite) {
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            } else {
                res.setHeader('Content-Type', 'text/plain');
                res.end('Consider your favorite GONE!');
            }
        })
        .catch(err => next(err));
    })

favoriteRouter.route('/campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    if (!favorite.campsites.includes(req.params.campsiteId)) {
                        favorite.campsites.push(req.params.campsiteId);
                        favorite.save()
                            .then(favorite => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);
                            })
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end('That campsite is already in the list of favorites!');
                    }
                } else {
                    Favorite.create({ user: req.user._id, campsites: req.body })
                        .then(favorite => {
                            console.log('Favorite created', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                    })
                }
            })
            .catch(err => next(err));
    })    
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /favorites/${req.params.campsiteId}`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorite.findOne({ user: req.user._id })
            .then(favorite => {
                if (favorite) {
                    const index = favorites.indexOf(req.params.campsiteId);
                    if (index >= 0) {
                        favorite.campsites.splice(index, 1);
                    }
                    favorite.save()
                        .then(favorite => {
                            console.log('Favorite Campsite Deleted', favorite);
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        .catch(err => next(err));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'text/plain');
                    res.end('You do not have any favorites to delete');
                }
            })
            .catch(err => next(err));
    })
        
module.exports = favoriteRouter;