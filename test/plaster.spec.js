var _ = require('lodash');
var plaster = require('../dist/index');
var expect = require('chai').expect;

describe('Plaster internals', function () {

  beforeEach(function () {
    plaster = new plaster.Plaster();
  });

  var schema = plaster.schema({
    string: String,
    date: Date,
    subobj: {
      string: String
    },
    arr: [String]
  });

  var SModel = plaster.model('SModel', schema);

  // Some tests require harmony proxies:
  if (typeof(Proxy) !== 'undefined') {

    it('should be empty when nothing is set', function () {
      var o = new SModel();
      expect(o).to.deep.equal({})
    });

    it('should not see _private when iterating', function () {
      var keysIterated = 0;
      var o = new SModel({string: 'hello', date: 582879600000});
      for (var key in o) {
        expect(key).to.not.equal('_private');
        keysIterated++;
      }

      expect(keysIterated).to.equal(2);
    });

    it('should not see _private when iterating with lodash', function () {
      var keysIterated = 0;
      var o = new SModel({string: 'hello', date: 582879600000});
      _.each(o, function (value, key) {
        expect(key).to.not.equal('_private');
        keysIterated++;
      });
      expect(keysIterated).to.equal(2);
    });

    it('should return keys for values that have been set only', function () {
      var o = new SModel({string: 'hello', date: 582879600000});
      expect(_.keys(o)).to.deep.equal(['string', 'date']);
    });

    // Without Proxy, delete keyword will delete the registered setter.
    it('should support delete keyword', function () {
      var o = new SModel({string: 'hello', date: 582879600000});
      delete o.string;
      expect(o.string).to.not.be.ok;

      o.string = 1;
      expect(o.string).to.be.a('string');
      expect(o.string).to.equal('1');
    });
  }
});

describe('clearErrors()', function () {
  it('should remove all errors on an object', function () {
    var schema = plaster.schema({
      string: {type: String, minLength: 15}
    });

    var CEModel = plaster.model('cemodel', schema);

    var o = new CEModel();
    o.string = '1234';
    expect(o.getErrors().length).to.equal(1);
    expect(o.hasErrors()).to.equal(true);
    o.clearErrors();
    expect(o.getErrors().length).to.equal(0);
    expect(o.hasErrors()).to.equal(false);
  });
});

