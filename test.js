var _ = require('underscore');
var errors = require('./lib/index.js')
var httpStatus = require('http-status');


exports.testBadRequest = function(test) {
    errors.BadRequest({}, function(err) {
        test.ok(err.error);
        err = err.error;
        test.equal(err.property, '');
        test.equal(err.statusCode, httpStatus.BAD_REQUEST);
        test.equal(err.title, 'Bad Request');
        test.done()
    });
};

exports.testBadRequestTitleMessage = function(test) {
    var d = {
        title: 'bar',
        message: 'foo',
    };
    errors.BadRequest(d, function(err) {
        test.ok(err.error);
        err = err.error;
        test.equal(err.statusCode, httpStatus.BAD_REQUEST);
        test.equal(err.title, d.title);
        test.equal(err.message, d.message);
        test.done()
    });
};

exports.testBadRequestReq = function(test) {
    var d = {
        req: {
            path: '/api/v1/foo',
            method: 'GET',
            data: { name: '1' },
        },
    };
    errors.BadRequest(d, function(err) {
        test.ok(err.error);
        err = err.error;
        test.equal(err.statusCode, httpStatus.BAD_REQUEST);
        test.equal(err.title, 'Bad Request');
        test.ok(err.devMessage.indexOf(d.req.path) > -1);
        test.ok(err.devMessage.indexOf(d.req.method) > -1);
        test.ok(err.devMessage.indexOf(JSON.stringify(d.req.data)) > -1);
        test.done()
    });
};
