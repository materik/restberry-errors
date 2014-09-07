var httpStatus = require('http-status');
var utils = require('restberry-utils');


function RestberryError() { 
    this.name = 'RestberryError';
    this.err, this.next, this.req, this.req;
}
RestberryError.prototype.__proto__ = Error.prototype;
RestberryError.prototype._throw = function(m, err, req, res, next) {
    this.next = next, this.res = res, this.req = req;
    this.err = m(this.req, err);
    if (this.err.error)  this.res.status(this.err.error.statusCode)
    this.next(this.err, this.req, this.res)
};

function BadRequest(err, req, res, next) {
    this._throw(_badRequest, err, req, res, next);
};
BadRequest.prototype.__proto__ = RestberryError.prototype;

function BadRequestInvalidInput(err, req, res, next) {
    this._throw(_invalidInput, err, req, res, next);
};
BadRequestInvalidInput.prototype.__proto__ = RestberryError.prototype;

function BadRequestMissingField(err, req, res, next) {
    this._throw(_missingField, err, req, res, next);
};
BadRequestMissingField.prototype.__proto__ = RestberryError.prototype;

function BadRequestValidation(err, req, res, next) {
    this._throw(_validation, err, req, res, next);
};
BadRequestValidation.prototype.__proto__ = RestberryError.prototype;

function Conflict(err, req, res, next) {
    this._throw(_conflict, err, req, res, next);
};
Conflict.prototype.__proto__ = RestberryError.prototype;

function ServerIssue(err, req, res, next) {
    this._throw(_serverIssue, err, req, res, next);
};
ServerIssue.prototype.__proto__ = RestberryError.prototype;

function NotFound(err, req, res, next) {
    this._throw(_notFound, err, req, res, next);
};
NotFound.prototype.__proto__ = RestberryError.prototype;

function NotImplemented() {
    this.message = 'Not Implemented';
};
NotImplemented.prototype.__proto__ = Error.prototype;

function Unauthenticated(err, req, res, next) {
    this._throw(_unauthenticated, err, req, res, next);
};
Unauthenticated.prototype.__proto__ = RestberryError.prototype;

function Forbidden(err, req, res, next) {
    this._throw(_forbidden, err, req, res, next);
};
Forbidden.prototype.__proto__ = RestberryError.prototype;

exports.BadRequest = BadRequest;
exports.BadRequestInvalidInput = BadRequestInvalidInput;
exports.BadRequestMissingField = BadRequestMissingField;
exports.Conflict = Conflict;
exports.NotImplemented = NotImplemented;
exports.NotFound = NotFound;
exports.ServerIssue = ServerIssue;
exports.Unauthenticated = Unauthenticated;
exports.Forbidden = Forbidden;

var _devMessage = function(req, err, msg) {
    var method = req.method;
    var path = utils.getReqPath(req);
    var data = req.body;
    if (data && data.password) {
        data.password = '**********';
    }
    try {
        data = JSON.stringify(data);
    } catch (err) {
        data = JSON.stringify(err);
    }
    return 'Requested <' + method + '> <' + path + '> with data ' +
           '<' + data + '>. ' + (msg ? msg + ' ' : '') + JSON.stringify(err);
};

var _error = function(req, err, statusCode, title, message, devMessage) {
    var property = (err.property ? err.property : '');
    return {
        error: {
            statusCode: statusCode,
            property: property,
            title: title,
            message: message,
            devMessage: _devMessage(req, err, devMessage),
        }
    }
};

var _getMessageProperty = function(err) {
    return err.property.replace(/\..*/, '');
};

var _getProperty = function(err) {
    var property = '';
    if (err.property) {
        property = err.property;
    } else if (err.errors) {
        if (err.errors.type && err.errors.type.path) {
            property = err.errors.type.path;
        } else {
            property = Object.keys(err.errors)[0];
        }
    }
    property = property.replace(/\.\d+\./, '.');
    return property;
};

// ----- Errors -----;

var _badRequest = function(req, err) {
    var statusCode = httpStatus.BAD_REQUEST;
    var title = (err.title ? err.title : 'Bad Request');
    var devMessage = '';
    return _error(req, err, statusCode, title, err.message, devMessage);
};

var _conflict = function(req, err) {
    var statusCode = httpStatus.CONFLICT;
    var title = 'Conflict';
    var message = 'There already exists a \'' + _getMessageProperty(err) +
                  '\' object with these properties.';
    var devMessage = '';
    return _error(req, err, statusCode, title, message, devMessage);
};

var _invalidInput = function(req, err) {
    err.property = _getProperty(err);
    var statusCode = httpStatus.BAD_REQUEST;
    var title = 'Invalid Input';
    var message = 'Recieved an invalid field \'' + _getMessageProperty(err) +
                  '\' for \'' + err.modelName + '\'';
    var devMessage = '';
    return _error(req, err, statusCode, title, message, devMessage);
};

var _missingField = function(req, err) {
    var statusCode = httpStatus.BAD_REQUEST;
    var title = 'Missing Field';
    var message = 'Missing required field \'' + _getMessageProperty(err) +
                  '\' of \'' + err.objName + '\'';
    var devMessage = '';
    return _error(req, err, statusCode, title, message, devMessage);
};

var _notFound = function(req, err) {
    var statusCode = httpStatus.NOT_FOUND;
    var title = 'Not Found';
    var message = 'Couldn\'t find \'' + _getMessageProperty(err) + '\'.';
    var devMessage = 'Make sure you have the right id: <' + req.params.id + '>.';
    return _error(req, err, statusCode, title, message, devMessage);
};

var _forbidden = function(req, err) {
    var statusCode = httpStatus.FORBIDDEN;
    var title = 'Forbidden';
    var message = 'You are not authorized!';
    var devMessage = 'Make sure you\'re logged in with the correct credentials.';
    return _error(req, err, statusCode, title, message, devMessage);
};

var _serverIssue = function(req, err) {
    var statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    var title = 'Server Issue';
    var message = 'We\'re on it!';
    var devMessage = err.name;
    return _error(req, err, statusCode, title, message, devMessage);
};

var _unauthenticated = function(req, err) {
    var statusCode = httpStatus.UNAUTHORIZED;
    var title = 'Unauthorized';
    var message = 'Need to be logged in to perform this action.';
    var devMessage = 'Make sure you are logged in and authenticated.';
    return _error(req, err, statusCode, title, message, devMessage);
};

var _validation = function(req, err) {
    err.property = _getProperty(err);
    var statusCode = httpStatus.BAD_REQUEST;
    var title = 'Validation Error';
    if (err.errors) {
        var property = Object.keys(err.errors)[0];
        var type = err.errors[property].type;
        if (type == 'required') {
            return _missingFieldError(req, err);
        }
    }
    var message = 'Wasn\'t able to validate \'' + _getMessageProperty(err) +
                  '\' for \'' + err.objName + '\'.';
    var devMessage = '';
    return _error(req, err, statusCode, title, message, devMessage);
};
