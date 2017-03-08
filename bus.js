var Notify = require('pull-notify');
var Bus = require('nanobus');
var S = require('pull-stream/pull');
S.drain = require('pull-stream/sinks/drain');
var noop = function () {};

// take a hash of async functions
// return an event emitter `bus`, and a method `createReadStream`
function Bus (fns) {
    if ( !(this instanceof Bus) ) return new Bus(fns);
    var self = this;
    this._notify = Notify();
    this.bus = Bus();

    S(
        this._notify.listen(),
        S.drain(function onEvent (ev) {
            self.bus.emit(ev[0], ev[1]);
        }, function onEnd (err) {
            if (err) self.bus.emit('error', err);
        })
    );

    Object.keys(fns).forEach(function (k) {
        var fn = fns[k];
        self[k] = function (args, cb) {
            cb = cb || noop;
            self._notify(['start', args]);
            fn(args, function onResp (err, resp) {
                if (err) {
                    self._notify(['resolve', args]);
                    self._notify(['pushError', err]);
                    return cb(err);
                }
                self._notify(['resolve', args]);
                self._notify([k, resp]);
            });
        };
    });
}

Bus.prototype.createReadStream = function () {
    return this._notify.listen();
};

module.exports = Bus;
