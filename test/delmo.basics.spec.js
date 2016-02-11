var expect = require('chai').expect;
var plaster = require('../dist/index');

describe('plaster basics', function () {
  it('Should export the proper functions', function () {
    // exported data
    expect(plaster.models).to.be.an('object');
    expect(plaster.options).to.be.an('object');

    // instance methods
    expect(plaster.set).to.be.a('function');
    expect(plaster.get).to.be.a('function');
    expect(plaster.model).to.be.a('function');

    // exported prototype objects
    expect(plaster.Schema).to.be.a('function');
    expect(plaster.Model).to.be.a('function');
  });
});