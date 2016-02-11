var plaster = require('../dist/index');
var expect = require('chai').expect;

describe('Schema options', function () {

  beforeEach(function () {
    plaster = new plaster.Plaster(); // recreate it
  });

  describe('toJSON', function () {

    it('Should just work without any options', function () {
      var userSchema = plaster.schema({name: String, email: String});

      var User = plaster.model('User', userSchema);

      var user = new User({name: 'Joe', email: 'joe@gmail.com'});

      var obj = user.toJSON();

      var expected = {
        name: 'Joe',
        email: 'joe@gmail.com'
      };

      expect(obj).to.deep.equal(expected);
    });

    it('Should transform if given the option', function () {
      var userSchema = plaster.schema({
        name: String,
        email: String,
        password: String
      });

      var User = plaster.model('User', userSchema);

      var user = new User({
        name: 'Joe',
        email: 'joe@gmail.com',
        password: 'password'
      });

      var xform = function (doc, ret, options) {
        delete ret.password;
        return ret;
      };

      var obj = user.toJSON({transform: xform});

      var expected = {
        name: 'Joe',
        email: 'joe@gmail.com'
      };

      expect(obj).to.deep.equal(expected);
    });

    it('Should transform if given the option only the specific object', function () {
      var userSchema = plaster.schema({
        name: String,
        email: String,
        password: String
      });

      var User = plaster.model('User', userSchema);

      var user = new User({
        name: 'Joe',
        email: 'joe@gmail.com',
        password: 'password'
      });

      var user2 = new User({
        name: 'Bob',
        email: 'bob@gmail.com',
        password: 'password2'
      });

      var xform = function (doc, ret, options) {
        delete ret.password;
        return ret;
      };

      var obj1 = user.toJSON({transform: xform});
      var obj2 = user2.toJSON();

      var expected1 = {
        name: 'Joe',
        email: 'joe@gmail.com'
      };

      var expected2 = {
        name: 'Bob',
        email: 'bob@gmail.com',
        password: 'password2'
      };

      expect(obj1).to.deep.equal(expected1);
      expect(obj2).to.deep.equal(expected2);
    });

    it('Should transform if given the option at schema level', function () {
      var userSchema = plaster.schema({
        name: String,
        email: String,
        password: String
      });

      var xform = function (doc, ret, options) {
        delete ret.password;
        return ret;
      };

      userSchema.set('toJSON', {transform: xform});

      var User = plaster.model('User', userSchema);

      var user = new User({
        name: 'Joe',
        email: 'joe@gmail.com',
        password: 'password'
      });

      var obj = user.toJSON();

      var expected = {
        name: 'Joe',
        email: 'joe@gmail.com'
      };

      expect(obj).to.deep.equal(expected);
    });

    it('Should not effect toObject if having a transform at schema level', function () {
      var userSchema = plaster.schema({
        name: String,
        email: String,
        password: String
      });

      var xform = function (doc, ret, options) {
        delete ret.password;
        return ret;
      };

      userSchema.set('toJSON', {transform: xform});

      var User = plaster.model('User', userSchema);

      var user = new User({
        name: 'Joe',
        email: 'joe@gmail.com',
        password: 'password'
      });

      var obj = user.toObject();

      var expected = {
        name: 'Joe',
        email: 'joe@gmail.com',
        password: 'password'
      };

      expect(obj).to.deep.equal(expected);
    });

    it('Should perform transform correctly on nested objects', function () {
      var userSchema = plaster.schema({name: String, email: String, password: String});

      var xform = function (doc, ret, options) {
        delete ret.password;
        return ret;
      };

      userSchema.set('toJSON', {transform: xform});

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({owner: User, content: String});
      var Post = plaster.model('Post', postSchema);

      var user = new User({name: 'Joe', email: 'joe@gmail.com', password: 'password'})
        , post = new Post({owner: user, content: 'I like plaster :)'});

      var obj = post.toJSON();

      var expected = {
        content: 'I like plaster :)',
        owner: {
          name: 'Joe',
          email: 'joe@gmail.com'
        }
      };

      expect(obj.owner).to.be.ok;
      expect(obj.owner).to.be.an('object');

      expect(obj).to.deep.equal(expected);
    });

    it.skip('Should perform transform correctly on nested objects when using inline tranform on one of them', function () {
      var userSchema = plaster.schema({name: String, email: String, password: String})

      var userxform = function (doc, ret, options) {
        delete ret.password;
        return ret;
      };

      userSchema.set('toJSON', {transform: userxform});

      var postxform = function (doc, ret, options) {
        ret.content = doc.content.toUpperCase();
        return ret;
      };

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({owner: User, content: String});
      var Post = plaster.model('Post', postSchema);

      var user = new User({name: 'Joe', email: 'joe@gmail.com', password: 'password'})
        , post = new Post({owner: user, content: 'I like plaster :)'});

      var obj = post.toJSON({transform: postxform});

      var expected = {
        content: 'I LIKE PLASTER :)',
        owner: {
          name: 'Joe',
          email: 'joe@gmail.com'
        }
      };

      expect(obj.owner).to.be.ok;
      expect(obj.owner).to.be.an('object');

      expect(obj).to.deep.equal(expected);
    });

    it('Should perform transform correctly on nested objects when using schema tranform on both of them', function () {
      var userSchema = plaster.schema({name: String, email: String, password: String})

      var userxform = function (doc, ret, options) {
        delete ret.password;
        return ret;
      };

      userSchema.set('toJSON', {transform: userxform});

      var postxform = function (doc, ret, options) {
        ret.content = doc.content.toUpperCase();
        return ret;
      };

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({owner: User, content: String});
      postSchema.set('toJSON', {transform: postxform});
      var Post = plaster.model('Post', postSchema);

      var user = new User({name: 'Joe', email: 'joe@gmail.com', password: 'password'})
        , post = new Post({owner: user, content: 'I like plaster :)'});

      var obj = post.toJSON();

      var expected = {
        content: 'I LIKE PLASTER :)',
        owner: {
          name: 'Joe',
          email: 'joe@gmail.com'
        }
      };

      expect(obj.owner).to.be.ok;
      expect(obj.owner).to.be.an('object');

      expect(obj).to.deep.equal(expected);
    });

    it('Should not get virtuals if not given the option', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        password: String
      });

      userSchema.virtual('fullName', {
        get: function () {
          return this.firstName + ' ' + this.lastName;
        }
      });

      var User = plaster.model('User', userSchema);

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      });

      var obj = user.toJSON();

      var expected = {
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      };

      expect(obj).to.deep.equal(expected);
    });

    it('Should get virtuals if given the option at schema level', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        password: String
      });

      userSchema.virtual('fullName', {
        get: function () {
          return this.firstName + ' ' + this.lastName;
        }
      });

      userSchema.set('toJSON', {virtuals: true});

      var User = plaster.model('User', userSchema);

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      });

      var obj = user.toJSON();

      var expected = {
        firstName: 'Joe',
        lastName: 'Smith',
        fullName: 'Joe Smith',
        password: 'password'
      };

      expect(obj).to.deep.equal(expected);
    });

    it('Should get virtuals if given the option at inline level', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        password: String
      });

      userSchema.virtual('fullName', {
        get: function () {
          return this.firstName + ' ' + this.lastName;
        }
      });

      var User = plaster.model('User', userSchema);

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      });

      var obj = user.toJSON({virtuals: true});

      var expected = {
        firstName: 'Joe',
        lastName: 'Smith',
        fullName: 'Joe Smith',
        password: 'password'
      };

      expect(obj).to.deep.equal(expected);
    });

    it('Should perform correctly on nested objects when using virtuals on both models inline option', function () {
      var userSchema = plaster.schema({firstName: String, lastName: String, password: String})

      userSchema.virtual('fullName', {
        get: function () {
          return this.firstName + ' ' + this.lastName;
        }
      });

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({owner: User, content: String});
      postSchema.virtual('capContent', {
        get: function () {
          return this.content.toUpperCase();
        }
      });

      var Post = plaster.model('Post', postSchema);

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      });

      var post = new Post({owner: user, content: 'I like plaster :)'});

      var obj = post.toJSON({virtuals: true});

      var expected = {
        owner: {
          firstName: 'Joe',
          lastName: 'Smith',
          password: 'password',
          fullName: 'Joe Smith'
        },
        content: 'I like plaster :)',
        capContent: 'I LIKE PLASTER :)'
      };

      expect(obj.owner).to.be.ok;
      expect(obj.owner).to.be.an('object');

      expect(obj).to.deep.equal(expected);
    });

    it('Should perform correctly on nested objects when using virtuals on both models and setting schema option for one model', function () {
      var userSchema = plaster.schema({firstName: String, lastName: String, password: String});

      userSchema.virtual('fullName', {
        get: function () {
          return this.firstName + ' ' + this.lastName;
        }
      });

      userSchema.set('toJSON', {virtuals: true});

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({owner: User, content: String});
      postSchema.virtual('capContent', {
        get: function () {
          return this.content.toUpperCase();
        }
      });
      var Post = plaster.model('Post', postSchema);

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      });

      var post = new Post({owner: user, content: 'I like plaster :)'});

      var obj = post.toJSON();

      var expected = {
        owner: {
          firstName: 'Joe',
          lastName: 'Smith',
          password: 'password',
          fullName: 'Joe Smith'
        },
        content: 'I like plaster :)'
      };

      expect(obj.owner).to.be.ok;
      expect(obj.owner).to.be.an('object');

      expect(obj).to.deep.equal(expected);
    });

    it('Should perform correctly on nested objects when using virtuals on both models and setting schema option for one and false for other', function () {
      var userSchema = plaster.schema({firstName: String, lastName: String, password: String});

      userSchema.virtual('fullName', {
        get: function () {
          return this.firstName + ' ' + this.lastName;
        }
      });

      userSchema.set('toJSON', {virtuals: true});

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({owner: User, content: String});
      postSchema.virtual('capContent', {
        get: function () {
          return this.content.toUpperCase();
        }
      });

      postSchema.set('toJSON', {virtuals: false});
      var Post = plaster.model('Post', postSchema);

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      });

      var post = new Post({owner: user, content: 'I like plaster :)'});

      var obj = post.toJSON();

      var expected = {
        owner: {
          firstName: 'Joe',
          lastName: 'Smith',
          password: 'password',
          fullName: 'Joe Smith'
        },
        content: 'I like plaster :)'
      };

      expect(obj.owner).to.be.ok;
      expect(obj.owner).to.be.an('object');

      expect(obj).to.deep.equal(expected);
    });

    it('Should perform correctly on nested objects when using virtuals on both models and setting schema option for one and false for other', function () {
      var userSchema = plaster.schema({firstName: String, lastName: String, password: String});

      userSchema.virtual('fullName', {
        get: function () {
          return this.firstName + ' ' + this.lastName;
        }
      });

      userSchema.set('toJSON', {virtuals: false});

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({owner: User, content: String});
      postSchema.virtual('capContent', {
        get: function () {
          return this.content.toUpperCase();
        }
      });

      postSchema.set('toJSON', {virtuals: true});
      var Post = plaster.model('Post', postSchema);

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        password: 'password'
      });

      var post = new Post({owner: user, content: 'I like plaster :)'});

      var obj = post.toJSON();

      var expected = {
        owner: {
          firstName: 'Joe',
          lastName: 'Smith',
          password: 'password'
        },
        content: 'I like plaster :)',
        capContent: 'I LIKE PLASTER :)'
      };

      expect(obj.owner).to.be.ok;
      expect(obj.owner).to.be.an('object');

      expect(obj).to.deep.equal(expected);
    });
  });
});