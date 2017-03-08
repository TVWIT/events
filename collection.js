var assign = require('xtend/mutable');
var createWriteStream = require('./lib/write-stream');

// create a writable stream that calls a method on an event
function Collection (opts) {
    if ( !(this instanceof Collection) ) {
        return new Collection(opts);
    }
    assign(this, opts);
}

Collection.prototype.createWriteStream = function (onEnd) {
    return createWriteStream(this, onEnd);
};

module.exports = Collection;

