(function () {
    "use strict";

    var model = require('./../index'), sut;
    var should = require('should');

    describe("model", function () {
        beforeEach(function () {
            sut = model.make();
        });

        it("stores value", function () {
            sut.add("a");
            sut.set("a", "value 1");
            sut.get("a").should.eql("value 1");
            sut.set("a", "value 2");
            sut.get("a").should.eql("value 2");

            sut.add("b");
            sut.set("b", "value");
            sut.get("b").should.eql("value");

            (function a() {
                sut.set("c", "value");
            }).should.throw("no field c");
            (function b() {
                sut.set("d", "value");
            }).should.throw("no field d");

            sut.add("e").add("f");
            sut.set("e", "value").set("f", "value");
        });

        it("tags", function () {
            sut.add("a");
            sut.isTagged("a", "tag").should.eql(false);

            sut.tag("a", "a tag");
            sut.isTagged("a", "a tag").should.eql(true);

            sut.add("b", {tags: ["tag 1", "tag 2"]});
            sut.isTagged("b", "tag 1").should.eql(true);
            sut.isTagged("b", "tag 2").should.eql(true);
            sut.isTagged("b", "tag 3").should.eql(false);

            sut.add("c", {tags: {}});
            sut.isTagged("c", "tag").should.eql(false);

            sut.add("d", {tags: ["test tag"]});
            sut.add("e", {tags: ["test tag"]});
            sut.add("f", {tags: ["test another tag"]});
            sut.add("g", {tags: ["test another tag"]});

            sut.tagged("test tag").should.eql(["d", "e"]);
            sut.tagged("test another tag").should.eql(["f", "g"]);
        });

        it("readonly", function () {
            sut.add("a", {readonly: true});
            sut.set("a", "value 1");
            sut.get("a").should.eql("value 1");

            (function a() {
                sut.set("a");
            }).should.throw("readonly");

            sut.isTagged("a", "readonly").should.eql(true);
        });

        it("formats", function () {
            sut.add("a");
            sut.add("b");
            sut.set("a", "val");

            sut.format("a", function (val) {
                return val.toUpperCase();
            });

            sut.get("a").should.eql("VAL");

            sut.format("a", function (val) {
                return val.toLowerCase();
            });

            sut.get("a").should.eql("val");

            sut.format("a", undefined);

            sut.get("a").should.eql("val");

            sut.format("a", undefined).format("a", undefined);
        });

        it("validates", function () {
            sut.add("a");
            sut.add("b");
            sut.set("a", "val");
            sut.set("b", "val");

            sut.isValid().should.eql(true);
            sut.errors().should.eql({});

            sut.validation("a", function () {
                return {isValid: true};
            })
                .validation("b", function () {
                return {isValid: false, error: 'an error occurred'};
            });

            sut.isValid().should.eql(false);
            sut.errors().should.eql({"b": "an error occurred"});

            sut.clearValidators();

            sut.isValid().should.eql(true);

            sut.validation("b", {});

            sut.isValid().should.eql(true);

            sut.clearValidators();

            sut.validation("a", function () {
                return {isValid: false, error: 'an error occurred'};
            });

            sut.validation("b", function () {
                return {isValid: false, error: 'another error occurred'};
            });

            sut.isValid().should.eql(false);
            sut.errors().should.eql({"a": 'an error occurred',
                "b": "another error occurred"});
        });

        it("merges", function () {
            sut.add("a");
            sut.add("b");

            sut.merge({a: "value a", b: "value b", c: "value c"});

            sut.get("a").should.eql("value a");
            sut.get("b").should.eql("value b");

            sut.add("d");

            sut.merge({a: "value a", b: "value b", c: "value c"});

            (sut.get("d") === null).should.eql(false);

            sut.validation("a", function(){return {isValid: false};});

            sut.merge({a: "value a"});

            sut.isValid().should.eql(false);

            sut.add("e", {readonly: true});
            sut.set("e", "value");
            sut.add("f");
            sut.set("f", "value");

            sut.merge({e: "new value", f: "new value"});

            sut.get("e").should.eql("value");
            sut.get("f").should.eql("new value");

        });

        it("json", function () {
            sut.add("a");
            sut.add("b");
            sut.set("a", "value a");
            sut.set("b", "value b");

            sut.toJSON().should.eql({a: "value a", b: "value b"});

            sut.add("c");

            sut.toJSON().should.eql({a: "value a", b: "value b"});
        });

        it("test", function () {
            var modelA = model.make();
            var modelB = model.make();
            modelA.add("a");
            modelB.add("a");

            modelA.set("a", "model a, value a");
            modelB.set("a", "model b, value a");

            modelA.get("a").should.eql("model a, value a");
            modelB.get("a").should.eql("model b, value a");

            modelA.validation("a", function(){return {isValid: false};});
            modelB.validation("a", function(){return {isValid: true};});

            modelA.isValid().should.eql(false);
            modelB.isValid().should.eql(true);
        });

        it("encoded url", function () {
            var contact = model.make();
            contact.add("a");
            contact.add("b");

            contact.set("a", "value a");
            contact.set("b", "value b");

            contact.toEncodedUrl().should.eql('a=value%20a&b=value%20b');

            contact.set("a", "value 1");
            contact.set("b", "value 2");

            contact.toEncodedUrl().should.eql('a=value%201&b=value%202');
        });

        it("csv", function () {
            var contact = model.make();
            contact.add("a");
            contact.add("b");

            contact.set("a", "value a");
            contact.set("b", "value b");

            contact.toCSV().should.eql('value a,value b');

            contact.toCSV({delimiter: '#'}).should.eql('value a#value b');
        });

        it("friendly name", function () {
            var contact = model.make();
            contact.add("a", {friendlyName: 'a friendly name'});
            contact.add("b", {friendlyName: 'b friendly name'});

            contact.getFriendlyName("a").should.eql('a friendly name');
            contact.getFriendlyName("b").should.eql('b friendly name');

            contact.getFriendlyNames().should.eql({'a': 'a friendly name', 'b': 'b friendly name'});
        });

        it("fields", function () {
            var contact = model.make();
            contact.add("a");
            contact.add("b");

            contact.getFields().should.eql(['a', 'b']);
        });
        
        it("is", function () {
            model.is(function(){return true;}, 'a message')('').should
                .eql({isValid:true});

            model.is(function(){return false;}, 'a message')('').should
                .eql({isValid:false, error: 'a message'});
        });

        it("isNot", function () {
            model.isNot(function(){return false;}, 'a message')('').should
                .eql({isValid:true});

            model.isNot(function(){return true;}, 'a message')('').should
                .eql({isValid:false, error: 'a message'});
        });
    });

}());
