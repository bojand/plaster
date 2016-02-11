const _ = require('lodash');
const clone = require('clone');

import { normalizeProperties } from './normalize'

export class Schema {
  /**
   * @classdesc Schema class represents the schema definition. It includes properties, methods, static methods, and any
   * middleware we want to define.
   *
   * @description Creates an object schema
   * @class
   * @api public
   * @param {Object} descriptor
   * @param {Object} options
   * @param {Boolean} options.strict - By default (<code>true</code>), allow only values in the schema to be set.
   *                                   When this is <code>false</code>, setting new fields will dynamically add the field
   *                                   to the schema as type "any".
   * @param {Boolean} options.dotNotation - Allow fields to be set via dot notation. Default: <code>true</code>.
   *                                      <code>obj['user.name'] = 'Joe'; -> obj: { user: 'Joe' }<code>
   *
   * @param {Boolean} options.minimize - "minimize" schemas by removing empty objects. Default: <code>true</code>
   * @param {Object} options.toObject - <code>toObject</code> method options.
   * @param {Boolean} options.toObject.minimize - "minimize" schemas by removing empty objects. Default: <code>true</code>
   * @param {Function} options.toObject.transform - transform function
   * @param {Boolean} options.toObject.virtuals - whether to include virtual properties. Default: <code>false</code>
   * @param {Boolean} options.toObject.dateToISO - convert dates to string in ISO format using <code>Date.toISOString()</code>. Default:  <code>false</code>
   * @param {Object} options.toJSON - options for <code>toJSON</code> method options, similar to above
   * @param {Boolean} options.strict - ensures that value passed in ot assigned that were not specified in our
   *                                   schema do not get saved
   * @param {Function} options.onBeforeValueSet - function called when write operations on an object takes place. Currently,
   * it will only notify of write operations on the object itself and will not notify you when child objects are written to.
   * If you return false or throw an error within the onBeforeValueSet handler, the write operation will be cancelled.
   * Throwing an error will add the error to the error stack.
   * @param {Function} options.onValueSet - Similar to <code>onBeforeValueSet</code>, but called after we've set a value on the key,
   *
   * @example
   * var schema = new plaster.Schema({ name: String });
   * @example <caption>with <code>onBeforeValueSet</code></caption>
   * var User = plaster.schema({ name: String }, {
   *   onBeforeValueSet: function(key, value) {
   *     if(key === 'name' && value.indexOf('Joe') >= 0) {
   *       return false;
   *     });
   *   }
   * });
   *
   * var User = plaster.model('User', schema);
   * var user = new User();
   * user.name = 'Bill'; // name not set
   * user.name = 'Joe Smith'; //  { name: 'Joe Smith' }
   */
  constructor(descriptor, options = {}) {
    // Create object for options if doesn't exist and merge with defaults.
    this.options = _.extend({
      strict: true,
      dotNotation: true
    }, options);

    this.methods = {};
    this.statics = {};
    this.callQueue = [];

    this.add(descriptor);
  }

  /**
   * Creates a instance method for the created model.
   * An object of function names and functions can also be passed in.
   *
   * @api public
   * @param {String} name the name of the method
   * @param {Function} func the actual function implementation
   *
   * @example
   * var userSchema = plaster.schema({
   *   firstName: String,
   *   lastName: String
   * });
   *
   * userSchema.method('getFullName', function () {
   *   return this.firstName + ' ' + this.lastName
   * });
   *
   * var User = plaster.model('User', userSchema);
   * var user = new User({
   *   firstName: 'Joe',
   *   lastName: 'Smith'
   * });
   *
   * console.log(user.getFullName()); // Joe Smith
   *
   */
  method(name, func) {
    if (_.isPlainObject(name)) {
      for (func in name) {
        this.method(func, name[func]);
      }
    }
    else {
      if (!_.isString(name)) throw new TypeError('Schema#method expects a string identifier as a function name');
      else if (!_.isFunction(func)) throw new TypeError('Schema#method expects a function as a handle');

      this.methods[name] = func;
    }
  }

  /**
   * Creates a static function for the created model.
   * An object of function names and functions can also be passed in.
   *
   * @api public
   * @param {String} name name of the statuc function
   * @param {Function} func the actual function
   *
   * * @example
   * var userSchema = plaster.schema({ name: String });
   *
   * userSchema.static('foo', function () {
   *   return 'bar';
   * });
   *
   * var User = plaster.model('User', userSchema);
   *
   * console.log(User.foo()); // 'bar'
   *
   */
  static(name, func) {
    if (_.isPlainObject(name)) {
      for (func in name) {
        this.statics(func, name[func]);
      }
    }
    else {
      if (!_.isString(name)) throw new TypeError('Schema#statics expects a string identifier as a function name');
      else if (!_.isFunction(func)) throw new TypeError('Schema#statics expects a function as a handle');

      this.statics[name] = func;
    }
  }

  /**
   * Creates a virtual property for the created model with the given object
   * specifying the get and optionally set function
   *
   * @api public
   * @param {String} name name of the virtual property
   * @param {String|Function|Object} type optional type to be used for the virtual property. If not provided default is
   *                                      'any' type.
   * @param {Object} options virtual options
   * @param {Function} options.get - the virtual getter function
   * @param {Function} options.set - the virtual setter function. If not provided the virtual becomes read-only.
   *
   * @example
   * var userSchema = plaster.schema({firstName: String, lastName: String});
   *
   * userSchema.virtual('fullName', String, {
   *   get: function () {
   *     return this.firstName + ' ' + this.lastName;
   *   },
   *   set: function (v) {
   *     if (v !== undefined) {
   *       var parts = v.split(' ');
   *       this.firstName = parts[0];
   *       this.lastName = parts[1];
   *     }
   *   }
   * });
   *
   * var User = plaster.model('User', userSchema);
   *
   * var user = new User({firstName: 'Joe', lastName: 'Smith'});
   * console.log(user.fullName); // Joe Smith
   * user.fullName = 'Bill Jones';
   * console.log(user.firstName); // Bill
   * console.log(user.lastName); // Jones
   * console.log(user.fullName); // Bill Jones
   */
  virtual(name, type, options) {
    if (!_.isString(name)) throw new TypeError('Schema#virtual expects a string identifier as a property name');

    if (_.isPlainObject(type) && !options) {
      options = type;
      type = 'any';
    }

    else if (!_.isPlainObject(options)) throw new TypeError('Schema#virtual expects an object as a handle');
    else if (!_.isFunction(options.get)) throw new TypeError('Schema#virtual expects an object with a get function');

    var virtualType = {
      type: type,
      virtual: true,
      get: options.get,
      invisible: true
    };

    if (options.set) {
      virtualType.set = options.set;
    }
    else {
      virtualType.readOnly = true;
    }

    this.descriptor[name] = virtualType;
  }

  /**
   * Sets/gets a schema option.
   *
   * @param {String} key option name
   * @param {Object} [value] if not passed, the current option value is returned
   * @api public
   */
  set(key, value) {
    if (1 === arguments.length) {
      return this.options[key];
    }

    this.options[key] = value;

    return this;
  }

  /**
   * Gets a schema option.
   *
   * @api public
   * @param {String} key option name
   * @return {*} the option value
   */
  get(key) {
    return this.options[key];
  }

  /**
   * Defines a pre hook for the schema.
   * See {@link https://www.npmjs.com/package/hooks-fixed hooks-fixed}.
   */
  pre() {
    return this.queue('pre', arguments);
  }

  /**
   * Defines a post hook for the schema.
   * See {@link https://www.npmjs.com/package/hooks-fixed hooks-fixed}.
   */
  post() {
    return this.queue('post', arguments);
  }

  /**
   * Adds a method call to the queue.
   *
   * @param {String} name name of the document method to call later
   * @param {Array} args arguments to pass to the method
   * @api private
   */
  queue(name, args) {
    var q = {hook: name, args: args};
    if (args[0] && typeof args[0] === 'string') {
      q.hooked = args[0];
    }

    this.callQueue.push(q);
  }

  /**
   * Adds the descriptor to the schema at the given key
   * @param key the property key
   * @param descriptor the property descriptor
   *
   * @example
   * var userSchema = plaster.schema({firstName: String });
   * userSchema.add('lastName', String);
   */
  add(key, descriptor) {
    if (!this.descriptor) {
      this.descriptor = {};
    }

    // adjust our descriptor
    if (key && descriptor) {
      this.descriptor[key] = normalizeProperties.call(this, descriptor, key)
    }
    else if (typeof key === 'object' && !descriptor) {
      if (!this.descriptor) {
        this.descriptor = {};
      }

      _.each(key, (properties, index) => {
        this.descriptor[index] = normalizeProperties.call(this, properties, index);
      });
    }
  }

  /**
   * Clones property from other to us
   * @param {Schema} other - other schema
   * @param {String} prop - property name
   * @param {Boolean} add - whether to add() or assign. if true will do deep clone.
   * @private
   */
  _cloneProp(other, prop, add) {
    if (other && other[prop]) {
      let p;
      for (p in other[prop]) {
        if (other[prop].hasOwnProperty(p) && !this[prop][p]) {
          if (add) {
            this.add(p, clone(other.descriptor[p]));
          }
          else {
            this[prop][p] = other[prop][p];
          }
        }
      }
    }
  }

  /**
   * Extends other schema. Copies descriptor properties, methods, statics, virtuals and middleware.
   * If this schema has a named property already, the property is not copied.
   * @param {Schema} other the schema to extend.
   */
  extend(other) {
    if (other && other instanceof Schema) {
      this._cloneProp(other, 'descriptor', true);
      this._cloneProp(other, 'statics');
      this._cloneProp(other, 'methods');

      var self = this;
      other.callQueue.forEach(function (e) {
        self.callQueue.unshift(e);
      });
    }

    return this;
  }
}