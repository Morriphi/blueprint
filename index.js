(function () {
    "use strict";

    var qs = require('qs'),
        field = require('./lib/field');

    module.exports.is = function (fn, msg) {
        return function (val) {
            if (fn(val))
                return {isValid: true};
            return {isValid: false, error: msg};
        };
    };

    module.exports.isNot = function (fn, msg) {
        return function (val) {
            if (!fn(val))
                return {isValid: true};
            return {isValid: false, error: msg};
        };
    };

    module.exports.make = function () {
        var obj = {}, store = {}, errors = {};

        function eachField(fn) {
            var keys = Object.keys(store);
            for (var i = 0; i < keys.length; i++)
                fn(store[keys[i]]);
        }

        obj.getFields = function() {
            var fields = [];
            eachField(function(field){
                fields.push(field.name());
            });
            return fields;
        };

        obj.add = function (name, opts) {
            var options = opts || {};
            store[name] = field.make(name, options);
            return obj;
        };

        obj.getFriendlyName = function(name) {
            return store[name].getFriendlyName();
        };

        obj.getFriendlyNames = function() {
            var fields = {};
            eachField(function(field){
                fields[field.name()] = field.getFriendlyName();
            });
            return fields;
        };

        obj.set = function (name, value) {
            if (!store.hasOwnProperty(name))
                throw new Error("no field " + name);
            store[name].set(value);
            return obj;
        };

        obj.tag = function (name, tag) {
            store[name].tag(tag);
        };

        obj.get = function (name) {
            return store[name].get();
        };

        obj.isTagged = function (name, tag) {
            return store[name].isTagged(tag);
        };

        obj.tagged = function (tag) {
            var result = [];
            eachField(function (field) {
                if (field.isTagged(tag))
                    result.push(field.name());
            });
            return result;
        };

        obj.forEachTagged = function (tag, fn) {
            eachField(function (field) {
                if (field.isTagged(tag))
                    fn(field.name(), obj);
            });
            return obj;
        };

        obj.format = function (name, fn) {
            store[name].format(fn);
            return obj;
        };

        obj.isValid = function () {
            errors = {};
            eachField(function (field) {
                if (!field.isValid())
                    errors[field.name()] = field.error();
            });
            return Object.keys(errors).length === 0;
        };

        obj.errors = function () {
            return errors;
        };

        obj.validation = function (name, fn) {
            store[name].validation(fn);
            return obj;
        };

        obj.clearValidators = function () {
            eachField(function (field) {
                field.clearValidators();
            });
        };

        obj.merge = function (data) {
            eachField(function (field) {
                if (!field.isTagged("readonly"))
                    field.set(data[field.name()]);
            });
        };

        obj.toJSON = function () {
            var jsonObj = {};
            eachField(function (field) {
                if (field.hasValue())
                    jsonObj[field.name()] = field.get();
            });
            return jsonObj;
        };

        obj.toCSV = function(opts) {
            var options = opts || {};
            var str = [];
            eachField(function (field) {
                if (field.hasValue())
                    str.push(field.get());
                else
                    str.push('');
            });
            return str.join(options.delimiter || ',');
        };

        obj.toEncodedUrl = function() {
            return qs.stringify(obj.toJSON());
        };

        return obj;
    };

}());