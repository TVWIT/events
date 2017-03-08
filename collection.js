var assign = require('xtend/mutable');
var xtend = require('xtend');
var struct = require('observ-struct');
var observ = require('observ');
var Drain = require('pull-stream/sinks/drain');

function Collection (opts) {
    if ( !(this instanceof Collection) ) {
        return new Collection(opts);
    }
    assign(this, {
        indexBy: 'id',
        state: struct({
            data: struct({}),
            resolving: observ([]),
            errors: observ([]),
            messages: observ([])
        })
    }, opts);
}

assign(Collection.prototype, {
    get: function (data) {
        this.state.data.set(data);
    },
    edit: function (item) {
        var update = {};
        update[this.indexBy] = item;
        this.state.data.set(xtend(this.state.data(), update));
    },
    add: function (item) {
        var update = {};
        update[this.indexBy] = item;
        this.state.data.set(xtend(this.state.data(), update));
    },
    delete: function (item) {
        var data = this.state.data();
        delete data[item[this.indexBy]];
        this.state.data.set(data);
    },

    start: function (req) {
        var newList = this.state.resolving().concat([req]);
        this.state.resolving.set(newList);
    },
    resolve: function (req) {
        var list = this.state.resolving();
        var i = list.indexOf(req);
        if (i === -1) return;
        var newList = list.slice();
        newList.splice(i, 1);
        this.state.resolving.set(newList);
    },

    pushError: function (err) {
        var list = this.state.errors().slice();
        list.push(err);
        this.state.errors.set(list);
    },
    shiftError: function () {
        var list = this.state.errors().slice();
        list.shift();
        this.state.errors.set(list);
    },

    createWriteStream: function (onEnd) {
        var self = this;
        var sink = Drain(function onEvent (ev) {
            var fn = self[ev[0]];
            if (fn) fn(ev[1]);
        });
        return sink;
    }
});

module.exports = Collection;

