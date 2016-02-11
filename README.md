# Plaster

Simple Mongoose-inspired Schema based Javascript Object Modelling

**NodeJS >= 0.12 supported. For all features, run node with the harmony proxies ````--harmony_proxies```` and harmony collections ````--harmony```` flags.**

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

## Documentation

[Full documentation](https://bojand.github.com/plaster)

## Tests

Module automated tests can be run using `npm test` command.

## Credits

Lots of code and design inspired by [Mongoose](http://mongoosejs.com/).
Uses modified code from [node-schema-object](https://github.com/scotthovestadt/node-schema-object) for modelling.

## License

Copyright 2016 Bojan D

Licensed under the MIT License.