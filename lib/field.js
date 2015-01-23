(function () {
    "use strict";

    module.exports.make = function (name, opts) {
        var obj = {},
            options = opts || {},
            tags = options.tags || [],
            value,
            validators = [],
            error,
            friendlyName = options.friendlyName || name,
            formatter = function (val) {
                return val;
            };

        obj.name = function () {
            return name;
        };

        obj.getFriendlyName = function() {
            return friendlyName;
        };

        obj.set = function (val) {
            if (value && options.readonly)
                throw new Error("readonly");
            value = val;
        };

        obj.hasValue = function() {
          return value !== undefined;
        };

        obj.get = function () {
            if (typeof(formatter) === 'function')
                return formatter(value);
            return value;
        };

        obj.tag = function (tag) {
            tags.push(tag);
        };

        obj.isTagged = function (tag) {
            if (!tags.indexOf) return false;
            return tags.indexOf(tag) > -1;
        };

        obj.format = function (fn) {
            formatter = fn;
        };

        obj.validation = function(fn) {
            validators.push(fn);
        };

        obj.isValid = function() {
            error = undefined;
            for(var i = 0; i < validators.length; i++) {
                if(typeof validators[i] === 'function') {
                    var valResult = validators[i](formatter(value));
                    if(valResult.error)
                        error = valResult.error;
                    if(!valResult.isValid)
                        return false;
                }
            }
            return true;
        };

        obj.error = function() {
            return error;
        };

        obj.clearValidators = function() {
            validators = [];
        };

        if(options.readonly)
            obj.tag("readonly");

        return obj;
    };

}());
