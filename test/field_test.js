(function () {
    "use strict";

    var field = require('./../lib/field');
    var should = require('should');

    describe("field", function () {
        it("make", function () {
            var sut = field.make("name");
            sut.name().should.eql("name");

            sut = field.make("another name");
            sut.name().should.eql("another name");
        });

        it("stores value", function () {
            var sut = field.make("name");
            (sut.hasValue()).should.eql(false);

            sut.set("value 1");
            (sut.hasValue()).should.eql(true);
            sut.get().should.eql("value 1");

            sut.set("value 2");
            (sut.hasValue()).should.eql(true);
            sut.get().should.eql("value 2");
        });

        it("friendly name", function () {
            var sut = field.make("name");

            sut.getFriendlyName().should.eql('name');

            sut = field.make("name", {friendlyName: 'friendly name'});

            sut.getFriendlyName().should.eql('friendly name');

            sut = field.make("name", {friendlyName: 'another friendly name'});

            sut.getFriendlyName().should.eql('another friendly name');
        });

        it("tags", function () {
            var sut = field.make("name");
            sut.isTagged("tag").should.eql(false);

            sut.tag("a tag");
            sut.isTagged("a tag").should.eql(true);

            sut = field.make("name", {tags: ["tag 1", "tag 2"]});
            sut.isTagged("tag 1").should.eql(true);
            sut.isTagged("tag 2").should.eql(true);
            sut.isTagged("tag 3").should.eql(false);

            sut = field.make("name", {tags: {}});
            sut.isTagged("tag").should.eql(false);
        });

        it("readonly", function () {
            var sut = field.make("name", {readonly: true});
            sut.set("value 1");
            sut.get().should.eql("value 1");

            sut.set.should.throw("readonly");

            sut.isTagged("readonly").should.eql(true);
        });

        it("formats", function () {
            var sut = field.make("name");
            sut.set("val");
            sut.format(function(val){ return val.toUpperCase(); });

            sut.get().should.eql("VAL");

            sut.format(function(val){ return val.toLowerCase(); });

            sut.get().should.eql("val");

            sut.format(undefined);

            sut.get().should.eql("val");
        });

        it("validates", function () {
            var sut = field.make("name");
            sut.set("val");

            sut.isValid().should.eql(true);
            (sut.error() === null).should.eql(false);

            var valueToValidate = '';
            sut.validation(function(val){
                valueToValidate = val;
                return {isValid: false, error: 'an error occurred'};
            });

            sut.isValid().should.eql(false);
            sut.error().should.eql("an error occurred");
            valueToValidate.should.eql("val");

            sut.clearValidators();

            sut.validation(function(val){
                return {isValid: true};
            });

            sut.isValid().should.eql(true);
            (sut.error() === null).should.eql(false);

            sut.clearValidators();

            sut.validation(function(val){
                return {isValid: true, error: 'sss'};
            });

            sut.isValid().should.eql(true);
            (sut.error() === null).should.eql(false);

            sut.clearValidators();

            sut.isValid().should.eql(true);
            (sut.error() === null).should.eql(false);

            sut.validation({});

            sut.isValid().should.eql(true);
            (sut.error() === null).should.eql(false);
        });
    });

}());
