var Notify = require('pull-notify');
var Bus = require('nanobus');
var S = require('pull-stream/pull');
S.drain = require('pull-stream/sinks/drain');
var noop = function () {};

function Api (fns) {
    if ( !(this instanceof Api) ) return new Api(fns);
    var self = this;
    this.notify = Notify();
    this.bus = Bus();

    S(
        this.notify.listen(),
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
            self.notify(['start', args]);
            fn(args, function onResp (err, resp) {
                if (err) {
                    self.notify(['resolve', args]);
                    self.notify(['pushError', err]);
                    return cb(err);
                }
                self.notify([k, resp]);
            });
        };
    });
}

Api.prototype.createReadStream = function () {
    return this.notify.listen();
};

module.exports = Api;
