var validator = require('validator');
var expect = require('chai').expect;
var plaster = require('../dist/index');
var Schema = plaster.Schema;

describe('Schema basics', function () {
  describe('Should only accept a plain object or undefined as an argument', function () {

    beforeEach(function () {
      plaster = new plaster.Plaster(); // recreate it
    });

    it('Should accept a \'undefined\'', function () {
      expect(function () {
        new Schema(undefined);
      }).to.not.throw(TypeError);
    });

    it('Should accept a plain object', function () {
      try {
        var sh = new Schema({property: String});
      }
      catch (e) {
        console.log(e.stack);
      }
      expect(function () {
        new Schema({property: String});
      }).to.not.throw(TypeError);
    });
  });

  describe('add', function () {
    beforeEach(function () {
      plaster = new plaster.Plaster(); // recreate it
    });

    it('Should accept a key and a descriptor object', function () {
      schema = new Schema();
      schema.add('name', String);
      schema.add('age', {type: Number});
      expect(schema.descriptor.name).to.deep.equal({ type: 'string', name: 'name' });
      expect(schema.descriptor.age).to.deep.equal({ type: 'number', name: 'age' });
    });
  });

  describe('init()', function () {
    beforeEach(function () {
      plaster = new plaster.Plaster(); // recreate it
    });

    it('should call init function after if defined as a method as part of construction', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        $_data: {type: Object, invisible: true }
      });

      userSchema.method('init', function () {
        this.$_data.initialEmal = this.email;
      });

      var User = plaster.model('User', userSchema);

      expect(User.init).to.not.be.ok;

      var user = new User({
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bsmith@gmail.com'
      });

      expect(user.init).to.be.ok;
      expect(user.init).to.be.instanceof(Function);
      expect(user.$_data).to.be.ok;
      expect(user.$_data).to.be.an('object');
      expect(user.$_data.initialEmal).to.equal('bsmith@gmail.com');

      user.email = 'bobsmith@gmail.com';

      expect(user.email).to.equal('bobsmith@gmail.com');
      expect(user.$_data.initialEmal).to.equal('bsmith@gmail.com');
    });
  });

  describe('custom validate', function () {
    beforeEach(function () {
      plaster = new plaster.Plaster(); // recreate it
    });

    it('should use custom validate function', function () {
      var userSchema = new plaster.Schema({
        firstName: String,
        lastName: String,
        email: {type: String, validate: validator.isEmail}
      });

      var User = plaster.model('User', userSchema);
      var user = new User();

      user.email = 'joe@gmail.com';

      expect(user.email).to.equal('joe@gmail.com');

      user.email = 'jsmith';

      expect(user.email).to.equal('joe@gmail.com');
    });
  });
});

