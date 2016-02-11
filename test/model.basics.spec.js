var _ = require('lodash');
var expect = require('chai').expect;
var plaster = require('../dist/index');
//var Schema = plaster.Schema;

describe('Model basics', function () {
  describe('Model creation', function () {
    beforeEach(function () {
      plaster = new plaster.Plaster(); // recreate it
    });

    it('should populate object', function () {
      var schema = new plaster.schema({
        firstName: String,
        lastName: String
      });

      var User = plaster.model('suser', schema);
      var user = new User();
      user.set({firstName: 'Bob', lastName: 'Smith'});
      expect(user.firstName).to.equal('Bob');
      expect(user.lastName).to.equal('Smith');
    });

    it('Should properly create a model', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob
      });

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));

      // should not be able to change modelName property
      expect(user.modelName).to.equal('User');
      user.modelName = 'Foo';
      expect(user.modelName).to.equal('User');
    });

    it('Should properly create multiple models from same source data', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var data = {
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob
      };

      var user = new User(data);

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));

      // should not be able to change modelName property
      expect(user.modelName).to.equal('User');
      user.modelName = 'Foo';
      expect(user.modelName).to.equal('User');

      var user2 = new User(data);

      expect(user2 instanceof User).to.be.ok;
      expect(user2 instanceof plaster.Model).to.be.ok;

      expect(user2.firstName).to.equal('Joe');
      expect(user2.lastName).to.equal('Smith');
      expect(user2.email).to.equal('joe@gmail.com');
      expect(user2.dateOfBirth).to.be.ok;
      expect(user2.dateOfBirth).to.be.an.instanceof(Date);
      expect(user2.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));

      // should not be able to change modelName property
      expect(user2.modelName).to.equal('User');
      user2.modelName = 'Foo';
      expect(user2.modelName).to.equal('User');
    });

    it('Should properly create a model with sub documents and arrays', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date,
        foo: Number,
        favourites: [String],
        boolProp: Boolean,
        someProp: Object
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob,
        foo: 5,
        boolProp: true,
        favourites: [
          'fav0', 'fav1', 'fav2'
        ],
        someProp: {
          abc: 'xyz',
          sbp: false,
          snp: 11
        }
      });

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
      expect(user.foo).to.equal(5);
      expect(user.boolProp).to.equal(true);
      expect(user.favourites.toArray()).to.deep.equal(['fav0', 'fav1', 'fav2']);
      expect(user.someProp).to.deep.equal({abc: 'xyz', sbp: false, snp: 11});
    });

    it('Should properly create multiple models from same source data with sub documents and arrays', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date,
        foo: Number,
        favourites: [String],
        boolProp: Boolean,
        someProp: {
          abc: String,
          foo: Boolean,
          bar: Number
        }
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var data = {
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob,
        foo: 5,
        boolProp: true,
        favourites: [
          'fav0', 'fav1', 'fav2'
        ],
        someProp: {
          abc: 'xyz',
          foo: false,
          bar: 11
        }
      };

      var user = new User(data, {clone: true});

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
      expect(user.foo).to.equal(5);
      expect(user.boolProp).to.equal(true);
      expect(user.favourites.toArray()).to.deep.equal(['fav0', 'fav1', 'fav2']);
      expect(user.someProp).to.deep.equal({abc: 'xyz', foo: false, bar: 11});


      var user2 = new User(data, {clone: true});

      expect(user2 instanceof User).to.be.ok;
      expect(user2 instanceof plaster.Model).to.be.ok;

      expect(user2.firstName).to.equal('Joe');
      expect(user2.lastName).to.equal('Smith');
      expect(user2.email).to.equal('joe@gmail.com');
      expect(user2.dateOfBirth).to.be.ok;
      expect(user2.dateOfBirth).to.be.an.instanceof(Date);
      expect(user2.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
      expect(user2.foo).to.equal(5);
      expect(user2.boolProp).to.equal(true);
      expect(user2.favourites.toArray()).to.deep.equal(['fav0', 'fav1', 'fav2']);
      expect(user2.someProp).to.deep.equal({abc: 'xyz', foo: false, bar: 11});
    });

    it('Should properly create a model with embedded document', function () {
      var userSchema = plaster.schema({
        email: {type: String, key: true, prefix: 'user:'},
        firstName: String, lastName: String
      });

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({
        owner: User, content: String
      });
      var Post = plaster.model('Post', postSchema);

      var user = new User({email: 'joe@gmail.com', firstName: 'Joe', lastName: 'Smith'});
      var post = new Post({owner: user, content: 'Lorem ipsum'});

      expect(user).to.be.ok;
      expect(user).to.be.an.instanceof(User);
      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');

      expect(post).to.be.ok;
      expect(post.content).to.equal('Lorem ipsum');
      expect(post.owner).to.be.ok;
      expect(post.owner).to.be.an.instanceof(User);
      expect(post.owner.email).to.equal('joe@gmail.com');
      expect(post.owner.firstName).to.equal('Joe');
      expect(post.owner.lastName).to.equal('Smith');
    });

    it('Should properly create multiple models with embedded document from same source', function () {
      var userSchema = plaster.schema({
        email: {type: String, key: true, prefix: 'user:'},
        firstName: String, lastName: String
      });

      var User = plaster.model('User', userSchema);

      var postSchema = plaster.schema({
        owner: User, content: String
      });
      var Post = plaster.model('Post', postSchema);

      var userData = {email: 'joe@gmail.com', firstName: 'Joe', lastName: 'Smith'};

      var user = new User(userData);
      var postData = {owner: user, content: 'Lorem ipsum'};

      var post = new Post(postData);

      expect(user).to.be.ok;
      expect(user).to.be.an.instanceof(User);
      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');

      expect(post).to.be.ok;
      expect(post.content).to.equal('Lorem ipsum');
      expect(post.owner).to.be.ok;
      expect(post.owner).to.be.an.instanceof(User);
      expect(post.owner.email).to.equal('joe@gmail.com');
      expect(post.owner.firstName).to.equal('Joe');
      expect(post.owner.lastName).to.equal('Smith');

      var user2 = new User(userData);
      var post2 = new Post(postData);

      expect(user2).to.be.ok;
      expect(user2).to.be.an.instanceof(User);
      expect(user2.firstName).to.equal('Joe');
      expect(user2.lastName).to.equal('Smith');
      expect(user2.email).to.equal('joe@gmail.com');

      expect(post2).to.be.ok;
      expect(post2.content).to.equal('Lorem ipsum');
      expect(post2.owner).to.be.ok;
      expect(post2.owner).to.be.an.instanceof(User);
      expect(post2.owner.email).to.equal('joe@gmail.com');
      expect(post2.owner.firstName).to.equal('Joe');
      expect(post2.owner.lastName).to.equal('Smith');
    });

    it('Should ignore unknown properties', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date,
        foo: Number,
        favourites: [String],
        boolProp: Boolean,
        someProp: Object
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob,
        foo: 5,
        unpa: 'something',
        boolProp: true,
        favourites: [
          'fav0', 'fav1', 'fav2'
        ],
        someProp: {
          abc: 'xyz',
          sbp: false,
          snp: 11
        }
      });

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
      expect(user.foo).to.equal(5);
      expect(user.boolProp).to.equal(true);
      expect(user.favourites.toArray()).to.deep.equal(['fav0', 'fav1', 'fav2']);
      expect(user.someProp).to.deep.equal({abc: 'xyz', sbp: false, snp: 11});
      expect(user.unpa).to.not.be.ok;
    });

    it('Should properly coerse string to Date when needed', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob.toISOString()
      });

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
    });

    it('Should properly change array property', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: {type: String, key: true, generate: false},
        usernames: [{type: String}]
      });

      var User = plaster.model('User', userSchema);

      var usernames1 = ['js1', 'js2', 'js3'].sort();
      var usernames2 = ['jsnew1', 'js2', 'jsnew3'].sort();
      var usernames3 = ['jsnew4', 'js5', 'jsnew6'].sort();

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        usernames: usernames1
      });

      expect(user.usernames.sort().toArray()).to.deep.equal(usernames1);

      user.set('usernames', usernames2);

      expect(user.usernames.sort().toArray()).to.deep.equal(usernames2);

      user.usernames = usernames3;

      expect(user.usernames.sort().toArray()).to.deep.equal(usernames3);

      user.set({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bjones@gmail.com',
        usernames: usernames1
      });

      var expectedData = {
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bjones@gmail.com',
        usernames: usernames1
      };

      expect(user.toObject()).to.deep.equal(expectedData);
    });

    it('Should properly change array ref property', function () {
      var fooSchema = plaster.schema({
        a: String,
        b: String
      });

      var Foo = plaster.model('Foo', fooSchema);

      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        foos: [Foo]
      });

      var User = plaster.model('User', userSchema);

      var foos1 = _.sortBy([
        new Foo({
          a: 'a1',
          b: 'b1'
        }),
        new Foo({
          a: 'a2',
          b: 'b2'
        })
      ], 'a');

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        foos: foos1
      });

      expect(user.foos.toArray()).to.deep.equal(foos1);

      user.foos.push(new Foo({
        a: 'a3',
        b: 'b3'
      }));

      foos1.push(new Foo({
        a: 'a3',
        b: 'b3'
      }));

      user.foos.forEach(function (f, i) {
        expect(f.a).to.equal(foos1[i].a);
        expect(f.b).to.equal(foos1[i].b);
      });

      var foos2 = [
        'newFooId1',
        new Foo({
          a: 'newa1',
          b: 'newb1'
        }),
        new Foo({
          a: 'newa2',
          b: 'newb2'
        })];

      user.foos = foos2;

      user.foos.forEach(function (f, i) {
        expect(f.a).to.equal(foos1[i].a);
        expect(f.b).to.equal(foos1[i].b);
      });
    });

    it('should properly create a model with manual ref of a model that is later defined', function () {
      var siteSchema = plaster.schema({
        owner: {type: plaster.Model, modelName: 'User'},
        url: String
      });

      var Site = plaster.model('Site', siteSchema);

      var userSchema = plaster.schema({
        email: String,
        name: String
      });

      var User = plaster.model('User', userSchema);

      var user = new User({
        name: 'Joe Smith',
        email: 'jsmith@gmail.com'
      });

      var site = new Site({
        url: 'http://wwww.mysite.org',
        owner: user
      });

      expect(site).to.be.instanceof(Site);
      expect(site.owner).to.be.ok;
      expect(site.owner).to.be.instanceof(User);
      expect(site.url).to.equal('http://wwww.mysite.org');
      expect(site.owner.name).to.equal('Joe Smith');
      expect(site.owner.email).to.equal('jsmith@gmail.com');
    });

    it('custom methods added to factory', function () {
      var PersonSchema = plaster.schema({
        firstName: String,
        lastName: String
      });

      PersonSchema.method('getFullName', function () {
        return this.firstName + ' ' + this.lastName;
      });

      var Person = plaster.model('person', PersonSchema);

      var person = new Person({firstName: 'Joe', lastName: 'Smith'});
      var fullName = person.getFullName();
      expect(fullName).to.equal('Joe Smith');
    });

    it('custom methods added through object', function () {
      var PersonSchema = plaster.schema({
        firstName: String,
        lastName: String
      });

      PersonSchema.method({
        getFullName: function () {
          return this.firstName + ' ' + this.lastName;
        },
        foo: function () {
          return 'foo';
        }
      });

      var Person2 = plaster.model('person2', PersonSchema);

      var person = new Person2({firstName: 'Joe', lastName: 'Smith'});
      var fullName = person.getFullName();
      var r = person.foo();
      expect(fullName).to.equal('Joe Smith');
      expect(r).to.equal('foo');
    });

    it('static method', function () {
      var schema = plaster.schema({
        firstName: String,
        lastName: String
      });

      schema.static('foo', function () {
        return 'bar';
      });

      var User = plaster.model('staticuser', schema);

      var r = User.foo();
      expect(r).to.equal('bar');
    });

    if (typeof(Proxy) !== 'undefined') {

      it('strict: true should not allow you to set any index', function () {
        var schema = plaster.schema({}, {
          strict: true
        });

        var M = plaster.model('m', schema);

        var o = new M();
        o.unknownIndex = 'a string';
        expect(o.unknownIndex).to.not.be.ok;
      });

      it('strict: false should allow you to initialize with any indexes', function () {
        var SubSchema = plaster.schema({
          aNum: Number
        }, {
          strict: false
        });

        var SubObj = plaster.model('SubObj', SubSchema);

        var MainSchema = plaster.schema({
          aNumber: Number,
          subObj: SubObj,
          subShorthand: {
            aNum: Number
          },
          subObjs: [SubObj]
        }, {
          strict: false
        });

        var MainObj = plaster.model('MainObj', MainSchema);

        var sourceObj = {
          unknownIndex: 'a string',
          aNumber: 123,
          subObj: {
            aString: 'hello'
          },
          subShorthand: {
            aString: 'hi'
          },
          subObjs: [{
            aString: 'hey'
          }]
        };

        var o = new MainObj(sourceObj);

        expect(o.unknownIndex).to.be.a('string');
        expect(o.unknownIndex).to.equal('a string');

        expect(o.aNumber).to.be.a('number');
        expect(o.aNumber).to.equal(123);

        expect(o.subObj).to.be.an('object');
        expect(o.subObj).to.be.instanceOf(SubObj);
        expect(o.subObj.aString).to.be.a('string');
        expect(o.subObj.aString).to.to.equal('hello');

        expect(o.subShorthand).to.be.an('object');

        expect(o.subShorthand).to.deep.equal({
          aString: 'hi'
        });

        expect(o.subShorthand.aString).to.be.a('string');
        expect(o.subShorthand.aString).to.equal('hi');

        expect(o.subObjs).to.be.an('array');
        expect(o.subObjs[0]).to.deep.equal({
          aString: 'hey'
        });

        expect(o.subObjs[0].aString).to.be.a('string');
        expect(o.subObjs[0].aString).to.equal('hey');

        expect(o.toObject()).to.deep.equal(sourceObj)
      });

      it('strict: false should allow you to set any index (but behave normally for schema-fields)', function () {
        var schema = plaster.schema({
          aNumber: Number
        }, {
          strict: false
        });

        var SModel = plaster.model('SModel', schema);

        var o = new SModel();

        o.unknownIndex = 'a string';
        expect(o.unknownIndex).to.be.a('string');
        expect(o.unknownIndex).to.equal('a string');

        o.aNumber = 123;
        expect(o.aNumber).to.be.a('number');
        expect(o.aNumber).to.equal(123);
      });

      it('dotNotation: true should allow you to set and get deep value with dot notation ("data.stuff" = data: {stuff: value}', function () {
        var schema = plaster.schema({
          profile: {
            name: String
          }
        }, {
          dotNotation: true,
          strict: false
        });

        var SModel = plaster.model('SModel', schema);

        var o = new SModel();

        o['profile.name'] = 'Joe';
        expect(o.profile.name).to.be.a('string');
        expect(o.profile.name).to.equal('Joe');
        expect(o['profile.name']).to.be.a('string');
        expect(o['profile.name']).to.equal('Joe');

        o['notstrict.name'] = 'Joe';
        expect(o.notstrict.name).to.be.a('string');
        expect(o.notstrict.name).to.equal('Joe');
        expect(o['notstrict.name']).to.be.a('string');
        expect(o['notstrict.name']).to.equal('Joe');
      });

      it('dotNotation: false should allow you to set and get named values with dot notation ("data.stuff" = "data.stuff": value}', function () {
        var schema = plaster.schema({
          "profile.name": String
        }, {
          dotNotation: false,
          strict: false
        });

        var SModel = plaster.model('SModel', schema);

        var o = new SModel();

        o['profile.name'] = 'Joe';
        expect(o.profile).to.not.be.ok;
        expect(o['profile.name']).to.be.a('string');
        expect(o['profile.name']).to.equal('Joe');

        o['notstrict.name'] = 'Joe';
        expect(o.notstrict).to.not.be.ok;
        expect(o['notstrict.name']).to.be.a('string');
        expect(o['notstrict.name']).to.equal('Joe');
      });

      it('onBeforeValueSet: should be notified before all write operations and cancel them with return false or exception', function () {
        var onValueSetTriggered = {};

        var schema = plaster.schema({
          name: String
        }, {
          onBeforeValueSet: function (value, key) {
            onValueSetTriggered.value = value;
            onValueSetTriggered.key = key;

            if (value === 'Smith') {
              return false;
            }
            if (value === 'ErrorTest') {
              throw 'Test error';
            }
          },
          strict: false
        });

        var SModel = plaster.model('SModel', schema);

        var o = new SModel();

        o.name = 'Joe';
        expect(onValueSetTriggered.value).to.equal('Joe');
        expect(onValueSetTriggered.key).to.equal('name');
        expect(o.name).to.equal('Joe');

        o.notstrict = 'Smith';
        expect(onValueSetTriggered.value).to.equal('Smith');
        expect(onValueSetTriggered.key).to.equal('notstrict');
        expect(o.notstrict).to.not.be.ok;

        o.errortest = 'ErrorTest';
        expect(o.errortest).to.not.be.ok;
        expect(o.getErrors().length).to.equal(1);
        expect(o.hasErrors()).equal(true);
      });

      it('onValueSet: should be notified of all write operations', function () {
        var onValueSetTriggered = {};

        var schema = plaster.schema({
          name: String
        }, {
          onValueSet: function (value, key) {
            onValueSetTriggered.value = value;
            onValueSetTriggered.key = key;
          },
          strict: false
        });

        var SModel = plaster.model('SModel', schema);

        var o = new SModel();

        o.name = 'Joe';
        expect(onValueSetTriggered.value).to.equal('Joe');
        expect(onValueSetTriggered.key).to.equal('name');
        expect(o.name).to.equal('Joe');


        o.notstrict = 'Smith';
        expect(onValueSetTriggered.value).to.equal('Smith');
        expect(onValueSetTriggered.key).to.equal('notstrict');
        expect(o.notstrict).to.equal('Smith');
      });
    }
  });

  describe('Nested properties tests', function () {
    beforeEach(function () {
      plaster = new plaster.Plaster(); // recreate it
    });

    it('Should properly get and set nested properties', function () {
      var userSchema = plaster.schema({
        name: String,
        profile: {
          email: String,
          age: Number
        }
      });

      var User = plaster.model('User', userSchema);
      var user = new User({
        name: 'Bob Smith',
        profile: {
          email: 'p1@p1.com',
          age: 10
        }
      });

      expect(user.name).to.equal(user.name);
      expect(user.profile).to.deep.equal({email: 'p1@p1.com', age: 10});

      // this should work
      user.set('profile', {
        email: 'bsmith5@gmail.com',
        age: 25
      });

      expect(user.profile.email).to.equal('bsmith5@gmail.com');
      expect(user.profile.age).to.equal(25);

      user.profile.email = 'bsmith@gmail.com';
      user.profile.age = 20;

      expect(user.profile.email).to.equal('bsmith@gmail.com');
      expect(user.profile.age).to.equal(20);

      user.profile = {
        email: 'bsmith2@gmail.com',
        age: 22,
        foo: 'bar'
      };

      expect(user.profile).to.deep.equal({
        email: 'bsmith2@gmail.com',
        age: 22
      });

      user.profile.email = 123;

      expect(user.profile).to.deep.equal({
        email: '123',
        age: 22
      });

      // this should work
      user.set('profile', {
        email: 'bsmith3@gmail.com',
        age: 23
      });

      expect(user.profile).to.deep.equal({
        email: 'bsmith3@gmail.com',
        age: 23
      });

      user.profile.set({
        email: 'bsmith3@gmail.com',
        age: 23
      });

      expect(user.profile).to.deep.equal({
        email: 'bsmith3@gmail.com',
        age: 23
      });
    });

    it('Should properly get and set nested properties 2', function () {
      var userSchema = plaster.schema({
        name: String,
        profile: {
          email: String,
          age: Number
        }
      });

      var User = plaster.model('User', userSchema);
      var user = new User({
        name: 'Bob Smith',
        profile: {
          email: 'bsmith2@gmail.com',
          age: 22
        }
      });

      expect(user.name).to.equal(user.name);
      expect(user.profile).to.deep.equal({email: 'bsmith2@gmail.com', age: 22});

      user.profile.set({
        email: 'bsmith@gmail.com',
        age: 20,
        foo: 'bar'
      });

      expect(user.profile).to.deep.equal({
        email: 'bsmith@gmail.com',
        age: 20
      });

      user.profile.email = 123;

      expect(user.profile).to.deep.equal({
        email: '123',
        age: 20
      });
    });

    it('Should properly work with object in an array', function () {
      var userSchema = plaster.schema({
        name: String,
        profiles: [{
          email: String,
          age: Number
        }]
      });

      var User = plaster.model('User', userSchema);
      var user = new User({
        name: 'Bob Smith'
      });

      expect(user.name).to.equal(user.name);
      expect(user.profiles.toArray()).to.deep.equal([]);

      user.profiles.push({
        email: 'bsmith@gmail.com',
        age: 20
      });

      expect(user.profiles.toArray()).to.deep.equal([{email: 'bsmith@gmail.com', age: 20}]);

      user.profiles = [
        {
          email: 'bsmith2@gmail.com',
          age: 21
        },
        {
          email: 'bsmith3@gmail.com',
          age: 22
        }
      ];

      expect(user.profiles.toArray()).to.deep.equal([
        {
          email: 'bsmith2@gmail.com',
          age: 21
        },
        {
          email: 'bsmith3@gmail.com',
          age: 22
        }
      ]);
    });

    it('Should properly work with basic types in an array', function () {
      var userSchema = plaster.schema({
        name: String,
        usernames: [String]
      });

      var User = plaster.model('User', userSchema);
      var user = new User({
        name: 'Bob Smith'
      });

      expect(user.name).to.equal(user.name);
      expect(user.usernames.toArray()).to.deep.equal([]);

      // should not work
      user.usernames.push({
        email: 'bsmith@gmail.com',
        age: 20
      });

      expect(user.usernames.toArray()).to.deep.equal([]);

      user.usernames.push('user1');

      expect(user.usernames.toArray()).to.deep.equal(['user1']);

      // should not work
      user.usernames = [
        {
          email: 'bsmith2@gmail.com',
          age: 21
        },
        {
          email: 'bsmith3@gmail.com',
          age: 22
        }
      ];

      expect(user.usernames.toArray()).to.deep.equal(['user1']);

      // should not work
      user.usernames.set([
        {
          email: 'bsmith2@gmail.com',
          age: 21
        },
        {
          email: 'bsmith3@gmail.com',
          age: 22
        }
      ]);

      expect(user.usernames.toArray()).to.deep.equal(['user1']);

      user.usernames.set(['user2', 'user3']);

      expect(user.usernames.toArray()).to.deep.equal(['user2', 'user3']);

      user.usernames = ['user4', 'user5', 'user6'];

      expect(user.usernames.toArray()).to.deep.equal(['user4', 'user5', 'user6']);

      // should work because we cast boolean to string
      user.usernames = ['user7', 'user8', true, 'user8'];

      expect(user.usernames.toArray()).to.deep.equal(['user7', 'user8', 'true', 'user8']);
    })
  });

  describe('clear()', function () {

    beforeEach(function () {
      plaster = new plaster.Plaster(); // recreate it
    });

    it('should return array elements to their original state, which is an empty array', function () {
      var schema = plaster.schema({
        strings: [String]
      });

      var CModel = plaster.model('cmodel', schema);

      var o = new CModel();
      o.strings.push('hello');
      expect(o.strings).to.have.lengthOf(1);
      o.clear();
      expect(o.strings).to.be.ok;
      expect(o.strings).to.have.lengthOf(0);
    });

    it('should clear a simple document', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob
      });

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));

      user.clear();

      expect(user.firstName).to.not.be.ok;
      expect(user.lastName).to.not.be.ok;
      expect(user.email).to.not.be.ok;
      expect(user.dateOfBirth).to.not.be.ok;
    });

    it('should be able to set after clear a simple document', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var d = {
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob
      };

      var user = new User(d);

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));

      user.clear();

      expect(user.firstName).to.not.be.ok;
      expect(user.lastName).to.not.be.ok;
      expect(user.email).to.not.be.ok;
      expect(user.dateOfBirth).to.not.be.ok;

      user.set(d);

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
    });

    it('Should properly clear a model with sub documents and arrays', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date,
        foo: Number,
        favourites: [String],
        boolProp: Boolean,
        someProp: Object
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var user = new User({
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob,
        foo: 5,
        boolProp: true,
        favourites: [
          'fav0', 'fav1', 'fav2'
        ],
        someProp: {
          abc: 'xyz',
          sbp: false,
          snp: 11
        }
      });

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
      expect(user.foo).to.equal(5);
      expect(user.boolProp).to.equal(true);
      expect(user.favourites.toArray()).to.deep.equal(['fav0', 'fav1', 'fav2']);
      expect(user.someProp).to.deep.equal({abc: 'xyz', sbp: false, snp: 11});

      user.clear();

      expect(user.firstName).to.not.be.ok;
      expect(user.lastName).to.not.be.ok;
      expect(user.email).to.not.be.ok;
      expect(user.dateOfBirth).to.not.be.ok;
      expect(user.foo).to.not.be.ok;
      expect(user.boolProp).to.not.be.ok;
      expect(user.favourites).to.be.empty;
      expect(user.someProp).to.not.be.ok;
    });

    it('Should be able to set after clear a model with sub documents and arrays', function () {
      var userSchema = plaster.schema({
        firstName: String,
        lastName: String,
        email: String,
        dateOfBirth: Date,
        foo: Number,
        favourites: [String],
        boolProp: Boolean,
        someProp: Object
      });

      var User = plaster.model('User', userSchema);

      var dob = new Date('December 10, 1990 03:33:00');

      var d = {
        firstName: 'Joe',
        lastName: 'Smith',
        email: 'joe@gmail.com',
        dateOfBirth: dob,
        foo: 5,
        boolProp: true,
        favourites: [
          'fav0', 'fav1', 'fav2'
        ],
        someProp: {
          abc: 'xyz',
          sbp: false,
          snp: 11
        }
      };

      var user = new User(d);

      expect(user instanceof User).to.be.ok;
      expect(user instanceof plaster.Model).to.be.ok;

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
      expect(user.foo).to.equal(5);
      expect(user.boolProp).to.equal(true);
      expect(user.favourites.toArray()).to.deep.equal(['fav0', 'fav1', 'fav2']);
      expect(user.someProp).to.deep.equal({abc: 'xyz', sbp: false, snp: 11});

      user.clear();

      expect(user.firstName).to.not.be.ok;
      expect(user.lastName).to.not.be.ok;
      expect(user.email).to.not.be.ok;
      expect(user.dateOfBirth).to.not.be.ok;
      expect(user.foo).to.not.be.ok;
      expect(user.boolProp).to.not.be.ok;
      expect(user.favourites).to.be.empty;
      expect(user.someProp).to.not.be.ok;

      user.set(d);

      expect(user.firstName).to.equal('Joe');
      expect(user.lastName).to.equal('Smith');
      expect(user.email).to.equal('joe@gmail.com');
      expect(user.dateOfBirth).to.be.ok;
      expect(user.dateOfBirth).to.be.an.instanceof(Date);
      expect(user.dateOfBirth.toString()).to.equal((new Date('December 10, 1990 03:33:00').toString()));
      expect(user.foo).to.equal(5);
      expect(user.boolProp).to.equal(true);
      expect(user.favourites.toArray()).to.deep.equal(['fav0', 'fav1', 'fav2']);
      expect(user.someProp).to.deep.equal({abc: 'xyz', sbp: false, snp: 11});
    });
  });
});