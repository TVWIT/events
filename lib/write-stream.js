var Drain = require('pull-stream/sinks/drain');

function createWriteStream (context, onEnd) {
    var sink = Drain(function onEvent (ev) {
        var fn = context[ev[0]];
        if (fn) fn.call(context, ev[1]);
    }, onEnd);
    return sink;
}

module.exports = createWriteStream;
