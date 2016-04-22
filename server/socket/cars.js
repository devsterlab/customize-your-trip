var Car = require('../models/car');
var methods = require('../socket');
var convertToMongoParams = methods.convertToMongoParams;
var handleNotEnoughResults = methods.handleNotEnoughResults;
var respondWithId = methods.respondWithId;
var logError = methods.logError;

var path = 'get_cars';
var sort = {brand: 1, model: 1};

module.exports = function(socket) {
    socket.on(path, function (req) {
        var params = convertToMongoParams(req);
        var sort = params.sort || sort;
        Car.find(params.query, params.fields).sort(sort).execAsync()
            .then(handleNotEnoughResults(Car, req, sort))
            .then(respondWithId(socket, path, req))
            .catch(logError);
    });
};