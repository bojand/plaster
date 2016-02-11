# Plaster

Simple Mongoose-inspired schema based Javascript object modelling

**NodeJS >= 0.10 supported. For all features, run node with the harmony proxies ````--harmony_proxies```` and harmony collections ````--harmony```` flags.**

## Installation

`npm install plaster`

## Overview

Plaster is a simple, Mongoose-inspired schema based Javascript object modelling library. Just define your schemas and
create Javascript classes from them.

```js
var plaster = require('plaster');
var schema = plaster.schema({ name: String });
var Cat = plaster.model('Cat', schema);

var kitty = new Cat({ name: 'Zildjian' });
console.log(kitty);
```

#### Features:

* Schema definition
* Strict modelling based on schema
* Schema extension
* Automatic type validation and custom validation
* Middleware including pre and post hooks

## Guide

* [Modelling](#model)
* [Middleware](#middleware)
* [Types](#types)
* [Schema Extending](#extend)
* [Errors](#errors)

## Modelling <a id="model"></a>

**Basics**

We begin defining a data model using a schema.

```js
var userSchema = plaster.schema({
  firstName: String,
  lastName: String,
  age: Number,
  usernames: [String],
  setup: Boolean
  metadata: {
    createdAt: Date,
    updatedAt: Date
  }
});
```

We can add additional properties using `add` function:

```js
userSchema.add('name', String);
```

Alternatively we can explicitly specify the type using `type` property:

```js
var catSchema = plaster.schema({
  name: { type: String }
  breed: String,
});

catSchema.add('age', {type: String});
```

Schema options can be set at construction or using the `set` function.
 
```js
var catSchema = plaster.schema({
  name: { type: String }
  breed: String,
});

catSchema.set('minimize', false);
```

**Validation**

Plaster does automatic validation against input data using the type information specified in the schema definition.
We can provide custom validation in schema definition by providing `validator` function.
 
```js
var validator = require('validator'); // Node validator module

var userSchema = plaster.schema({
  name: String
  email: {type: String, validate: validator.isEmail}
});

var User = plaster.model('User', userSchema);
var user = new User({ name: 'Bob Smith' });

user.email = 'bob@gmail.com'; // OK
user.email = 'bsmith'; // Nope
console.log(user.email); // 'bob@gmail.com'
```

**Virtuals**

Virtuals are document properties that you can get and set but that do not get persisted to the database. 
The getters are useful for formatting or combining fields, while setters are useful for de-composing a single value 
into multiple values for storage.

```js
var userSchema = plaster.schema({
  firstName: String, 
  lastName: String
});

userSchema.virtual('fullName', {
  get: function () {
    return this.firstName + ' ' + this.lastName;
  },
  set: function (v) {
    if (v !== undefined) {
      var parts = v.split(' ');
      this.firstName = parts[0];
      this.lastName = parts[1];
    }
  }
});

var User = plaster.model('User', userSchema);
var user = new User({firstName: 'Bob', lastName: 'Smith'});
console.log(user.firstName); // Bob Smith
```

If no `set` function is defined the virtual is read-only.

**Statics**

Adding static methods to Models can be accomplished using `static()` schema function

```js
var userSchema = plaster.schema({
  firstName: String, 
  lastName: String
});

userSchema.static('foo', function(p, q) {
  return p + q;
});

var User = plaster.model('User', userSchema);
User.foo(1, 2); // 3
```

We can also pass an object of function keys and function values, and they will all be added.

**Methods**

Similarly adding instance methods to Models can be done using `method()` schema function. 

```js
var userSchema = plaster.schema({
  firstName: String, 
  lastName: String
});

userSchema.method('fullName', function() {
  return this.firstName + ' ' + this.lastName;
});

var User = plaster.model('User', userSchema);
var user = new User({firstName: 'Bob', lastName: 'Smith'});
user.fullName(); // 'Bob Smith'
```

We can also pass an object of function keys and function values, and they will all be added.

**init() method**

There is a special `init` method that if specified in schema definition will be called at the end of model creation. 
You can do additional setup here. This method is not passed in any arguments.

**toObject()**

Model instances come with `toObject` function that is automatically used for `console.log` inspection. 

Options:

* `transform` - function used to transform an object once it's been converted to plain javascript representation from a
model instance.
* `minimize` - to "minimize" the document by removing any empty properties. Default: `true`
* `virtuals` - to apply virtual getters

These settings can be applied on any invocation of `toObject` as well they can be set at schema level.

```js
var userSchema = plaster.schema({
  name: String,
  email: String,
  password: String
});

var xform = function (doc, ret, options) {
  delete ret.password;
  return ret;
};

userSchema.set('toObject', {transform: xform});

var User = plaster.model('User', userSchema);

var user = new User({
  name: 'Joe',
  email: 'joe@gmail.com',
  password: 'password'
});

console.log(user); // { name: 'Joe', email: 'joe@gmail.com' }
```

**toJSON()**

Similar to `toObject`. The return value of this method is used in calls to `JSON.stringify`.

## Middleware <a id="middleware"></a>

Similar to Mongoose middleware, we exposes `pre` and `post` [hooks](https://www.npmjs.com/package/hooks-fixed).

**onBeforeValueSet(key, value) / onValueSet(key, value)**

`onBeforeValueSet` / `onValueSet` allow you to bind an event handler to all write operations on an object. 
Currently, it will only notify of write operations on the object itself and will not notify you when child objects are 
written to. If you return false or throw an error within the onBeforeValueSet handler, the write operation will be 
cancelled. Throwing an error will add the error to the error stack.

```js
var User = plaster.schema({ name: String }, {
  onBeforeValueSet: function(key, value) {
    if(key === 'name' && value.indexOf('Joe') >= 0) {
      return false;
    });
  }
});

var User = plaster.model('User', schema);
var user = new User();
user.name = 'Bill'; // { name: undefined }
user.name = 'Joe Smith'; //  { name: 'Joe Smith' }
```

## Types <a id="types"></a>

Supported types:
- String
- Number
- Boolean
- Date
- Array (including types within Array)
- Object (including typed Models for sub-schemas)
- 'any'

When a type is specified, it will be enforced. Typecasting is enforced on all types except 'any'. If a value cannot be typecasted to the correct type, the original value will remain untouched.

Types can be extended with a variety of attributes. Some attributes are type-specific and some apply to all types.

Custom types can be created by defining an object with type properties.

```js
var NotEmptyString = {type: String, minLength: 1};
country: {type: NotEmptyString, default: 'USA'}
```

#### General attributes

**transform**
Called immediately when value is set and before any typecast is done.

```js
name: {type: String, transform: function(value) {
  // Modify the value here...
  return value;
}}
```

**validate**
Called immediately when value is set and before any typecast is done. Can be used for validating input data.
If you return `false` the write operation will be cancelled.

```js
name: {type: String, validate: function(value) {
  // check
  return value;
}}
```

**default**
Provide default value. You may pass value directly or pass a function which will be executed when the object is initialized. The function is executed in the context of the object and can use "this" to access other properties (which .

```js
country: {type: String, default: 'USA'}
```

**get**
Provide function to transform value when retrieved. Executed in the context of the object and can use "this" to access properties.

```js
string: {type: String, getter: function(value) { return value.toUpperCase(); }}
```

**readOnly**
If true, the value can be read but cannot be written to. This can be useful for creating fields that reflect other values.

```js
fullName: {type: String, readOnly: true, default: function(value) {
  return (this.firstName + ' ' + this.lastName).trim();
}}
```

**invisible**
If true, the value can be written to but isn't outputted as an index when `toObject()` is called. 
This can be useful for hiding internal variables.


#### String

**stringTransform**
Called after value is typecast to string **if** value was successfully typecast but called before all validation.

```js
postalCode: {type: String, stringTransform: function(string) {
  // Type will ALWAYS be String, so using string prototype is OK.
  return string.toUpperCase();
}}
```

**regex**
Validates string against Regular Expression. If string doesn't match, it's rejected.

```js
memberCode: {type: String, regex: new RegExp('^([0-9A-Z]{4})$')}
```

**enum**
Validates string against array of strings. If not present, it's rejected.

```js
gender: {type: String, enum: ['m', 'f']}
```

**minLength**
Enforces minimum string length.

```js
notEmpty: {type: String, minLength: 1}
```

**maxLength**
Enforces maximum string length.

```js
stateAbbrev: {type: String, maxLength: 2}
```

**clip**
If true, clips string to maximum string length instead of rejecting string.

```js
bio: {type: String, maxLength: 255, clip: true}
```

#### Number

**min**
Number must be > min attribute or it's rejected.

```js
positive: {type: Number, min: 0}
```

**max**
Number must be < max attribute or it's rejected.

```js
negative: {type: Number, max: 0}
```

#### Array

**unique**
Ensures duplicate-free array, using === to test object equality.

```js
emails: {type: Array, unique: true, arrayType: String}
```

**arrayType**
Elements within the array will be typed to the attributes defined.

```js
aliases: {type: Array, arrayType: {type: String, minLength: 1}}
```

An alternative shorthand version is also available -- wrap the properties within array brackets.

```js
aliases: [{type: String, minLength: 1}]
```

#### Object

**objectType**
Allows you to define a typed object.

```js
company: {type: Object, objectType: {
  name: String
}}
```

An alternative shorthand version is also available -- simply pass a descriptor.

```js
company: {
  name: String
}
```

#### Alias

**index (required)**

The index key of the property being aliased.

```js
zip: String,
postalCode: {type: 'alias', index: 'zip'}
// this.postalCode = 12345 -> this.toObject() -> {zip: '12345'}
```

## Schema Extension <a id="extend"></a>

It is useful to have a common base schema, that all other schemas / models would extend or "inherit" properties from.
This can be accomplished by using the `Schema.extend` function. When used all properties, virtuals,
methods, statics, and middleware that are present in the base schema **but not** present in destination schema are copied 
into the destination schema.

```js
 var baseSchema = plaster.schema({
  metadata: {
    doc_type: String,
    createdAt: Date,
    updatedAt: Date
  }
});

baseSchema.method('save', function(fn) {
  // simulate some async operation 
  var self = this;
  process.nextTick(function() {
    return fn(null, self);
  });
});

baseSchema.pre('save', function (next) {
  if (!this.metadata) {
    this.metadata = {};
  }

  var now = new Date();

  if (!this.metadata.createdAt) {
    this.metadata.createdAt = now;
  }

  this.metadata.updatedAt = now;
  this.metadata.doc_type = this.modelName;

  next();
});

baseSchema.method('baseFoo', function () {
  console.log('base foo');
});

var userSchema = plaster.schema({
  name: String,
  email: String,
});

userSchema.method('save', function(fn) {
  // simulate some other async operation 
  var self = this;
  process.nextTick(function() {
    return fn(null, self);
  });
});

userSchema.pre('save', function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }

  next();
});

userSchema.method('userFoo', function () {
  console.log('user foo');
});

// make user schema extend the base schema 
userSchema.extend(baseSchema);
var User = plaster.model('User', userSchema);

user = new User({
  name: 'Bob Smith',
  email: 'BSmith@gmail.com'
});

user.baseFoo() // prints 'base foo'
user.userFoo() // prints 'user foo'

user.save(function(err, savedDoc) {
  console.log(user.metadata.updatedAt); // Sat Dec 29 2015 03:30:00 GMT-0400 (AST)
  console.log(user.metadata.doc_type); // 'user'
  console.log(user.email); // 'bsmith@gmail.com'
});
```

## Errors <a id="errors"></a>

When setting a value fails, an error is generated silently. Errors can be retrieved with `getErrors()` and cleared with `clearErrors()`.

```js
var schema = new plaster.schema({
  id: {type: String, minLength: 5}
});

var Profile = plaster.model('Profile', schema);

var profile = new Profile();
profile.id = '1234';

console.log(profile.hasErrors()); // true

console.log(profile.getErrors());

// Prints:
[ { errorMessage: 'String length too short to meet minLength requirement.',
    setValue: '1234',
    originalValue: undefined,
    fieldSchema: { name: 'id', type: 'string', minLength: 5 } } ]

// Clear all errors.
profile.clearErrors();
```

## Tests

Module automated tests can be run using `npm test` command.

## Credits

Lots of code and design inspired by [Mongoose](http://mongoosejs.com/).
Uses modified code from [node-schema-object](https://github.com/scotthovestadt/node-schema-object) for modelling.

## License

Copyright 2016 Bojan Djurkovic

Licensed under the MIT License.