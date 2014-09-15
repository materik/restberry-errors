var httpStatus = require('http-status');
var utils = require('restberry-utils');


function RestberryError() { 
    this.name = 'RestberryError';
}
RestberryError.prototype.__proto__ = Error.prototype;

function BadRequest(err, next) {
    err.statusCode = httpStatus.BAD_REQUEST;
    err.title = err.title || httpStatus[err.statusCode];
    err.message = err.message || 'There was an issue with the request.';
    next(_error(err));
};
BadRequest.prototype.__proto__ = RestberryError.prototype;

function BadRequestInvalidInput(err, next) {
    err.property = _property(err);
    err.statusCode = httpStatus.BAD_REQUEST;
    err.title = 'Invalid Input';
    err.message = 'Recieved an invalid field \'' + err.property + '\' ' +
                  'for \'' + err.modelName + '\'.';
    next(_error(err));
};
BadRequestInvalidInput.prototype.__proto__ = RestberryError.prototype;

function BadRequestMissingField(err, next) {
    err.property = _property(err);
    err.statusCode = httpStatus.BAD_REQUEST;
    err.title = 'Missing Field';
    err.message = 'Missing required field \'' + err.property + '\' ' +
                  'of \'' + err.modelName + '\'.';
    next(_error(err));
};
BadRequestMissingField.prototype.__proto__ = RestberryError.prototype;

function BadRequestValidation(err, next) {
    err.property = _property(err);
    err.statusCode = httpStatus.BAD_REQUEST;
    err.title = 'Validation Error';
    err.message = 'Wasn\'t able to validate \'' + err.property + '\' ' +
                  'for \'' + err.modelName + '\'.';
    next(_error(err));
};
BadRequestValidation.prototype.__proto__ = RestberryError.prototype;

function Conflict(err, next) {
    err.property = _property(err);
    err.statusCode = httpStatus.CONFLICT;
    err.title = err.title || httpStatus[err.statusCode];
    err.message = 'There already exists a \'' + err.property + '\' ' +
                  'object with these properties.';
    next(_error(err));
};
Conflict.prototype.__proto__ = RestberryError.prototype;

function InternalServerError(err, next) {
    err.statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    err.title = err.title || httpStatus[err.statusCode];
    err.message = err.message || 'We\'re run into an unexpected problem, ' +
                                 'please contact support!';
    next(_error(err));
};
InternalServerError.prototype.__proto__ = RestberryError.prototype;

function NotFound(err, next) {
    err.property = _property(err);
    err.statusCode = httpStatus.NOT_FOUND;
    err.title = err.title || httpStatus[err.statusCode];
    err.message = 'Couldn\'t find \'' + err.property + '\'.';
    next(_error(err));
};
NotFound.prototype.__proto__ = RestberryError.prototype;

function NotImplemented() {
    this.message = 'Not Implemented';
};
NotImplemented.prototype.__proto__ = Error.prototype;

function Unauthenticated(err, next) {
    err.statusCode = httpStatus.UNAUTHORIZED;
    err.title = err.title || httpStatus[err.statusCode];
    err.message = 'Need to be logged in to perform this action.';
    next(_error(err));
};
Unauthenticated.prototype.__proto__ = RestberryError.prototype;

function Forbidden(err, next) {
    err.statusCode = httpStatus.FORBIDDEN;
    err.title || httpStatus[err.statusCode];
    err.message = 'Need to be logged in to perform this action.';
    next(_error(err));
};
Unauthenticated.prototype.__proto__ = RestberryError.prototype;

function Forbidden(err, next) {
    err.statusCode = httpStatus.FORBIDDEN;
    err.title || httpStatus[err.statusCode];
    err.message = 'You are not authorized to perform this action.';
    next(_error(err));
};
Forbidden.prototype.__proto__ = RestberryError.prototype;

var _devMessage = function(err) {
    var _devMessage = '';
    if (err.req) {
        var data = err.req.data;
        var method = err.req.method;
        var path = err.req.path
        if (data && data.password) {
            data.password = '**********';
        }
        try {
            data = JSON.stringify(data);
        } catch (err) {
            data = JSON.stringify(err);
        }
        _devMessage = 'Requested <' + method + '> <' + path + '> with data ' +
                      '<' + data + '>' + _devMessage;
    }
    _devMessage += '<' + JSON.stringify(err) + '>';
    return _devMessage;
};

var _error = function(err) {
    return {
        error: {
            statusCode: err.statusCode,
            property: _property(err),
            title: err.title,
            message: err.message,
            devMessage: _devMessage(err),
        }
    }
};

var _property = function(err) {
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
    property = property.replace(/\..*/, '');
    return property;
};

module.exports = {
    BadRequest: BadRequest,
    BadRequestInvalidInput: BadRequestInvalidInput,
    BadRequestMissingField: BadRequestMissingField,
    Conflict: Conflict,
    NotImplemented: NotImplemented,
    NotFound: NotFound,
    InternalServerError: InternalServerError,
    Unauthenticated: Unauthenticated,
    Forbidden: Forbidden,
};
