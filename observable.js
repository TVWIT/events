var assign = require('xtend/mutable');
var createWriteStream = require('./lib/write-stream');

// create a writable stream that calls a method on an event
function Observable (opts) {
    if ( !(this instanceof Observable) ) {
        return new Observable(opts);
    }
    assign(this, opts);
}

Observable.prototype.createWriteStream = function (onEnd) {
    return createWriteStream(this, onEnd);
};

module.exports = Observable;

