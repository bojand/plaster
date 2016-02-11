const _ = require('lodash');

import _privateKey from './privatekey'

import { typecast } from './utils';
import { normalizeProperties } from './normalize'

export class ModelArray extends Array {
  /**
   * @classdesc Represents a basic array with typecasted values. Inherits <code>Array</code>
   * Clients to not need to manually create instances of this class.
   *
   * @description Clients to not need to manually create instances of this class.
   * @class
   * @param self
   * @param properties
   */
  constructor(self, properties) {
    super();

    // Store all internals.
    const _private = this[_privateKey] = {};

    // Store reference to self.
    _private._self = self;

    // Store properties (arrayType, unique, etc).
    _private._properties = properties;

    // Normalize our own properties.
    if (properties.arrayType) {
      properties.arrayType = normalizeProperties.call(self, properties.arrayType);
    }
  }

  push(...args) {
    // Values are passed through the typecast before being allowed onto the array if arrayType is set.
    // In the case of rejection, the typecast returns undefined, which is not appended to the array.
    let values;
    if (this[_privateKey]._properties.arrayType) {
      values = [].map.call(args, (value) => {
        try {
          return typecast.call(this[_privateKey]._self, value, undefined, this[_privateKey]._properties.arrayType);
        }
        catch (error) {
          // set it the root parent object
          if (this[_privateKey]._self && this[_privateKey]._self[_privateKey] && this[_privateKey]._self[_privateKey]._errors) {
            this[_privateKey]._self[_privateKey]._errors.push(error);
          }
          return undefined;
        }
      }, this);

      // remove undefined and nulls
      values = _.compact(values);
    } else {
      values = args;
    }

    if (this[_privateKey]._properties.unique) {
      values = _.difference(values, _.toArray(this));
    }

    return Array.prototype.push.apply(this, values);
  }

  concat(...args) {
    // Return new instance of SchemaArray.
    const schemaArray = new ModelArray(this[_privateKey]._self, this[_privateKey]._properties);

    // Create primitive array with all elements.
    let array = this.toArray();

    for (const i in args) {
      if (args[i].toArray) {
        args[i] = args[i].toArray();
      }
      array = array.concat(args[i]);
    }

    // Push each value in individually to typecast.
    for (const i in array) {
      schemaArray.push(array[i]);
    }

    return schemaArray;
  }

  toArray() {
    // Create new Array to hold elements.
    const array = [];

    // Loop through each element, clone if necessary.
    _.each(this, (element) => {
      // Call toObject() method if defined (this allows us to return primitive objects instead of Model instances).
      if (_.isObject(element) && _.isFunction(element.toObject)) {
        element = element.toObject();

        // If is non-SchemaType object, shallow clone so that properties modification don't have an affect on the original object.
      } else if (_.isObject(element)) {
        element = _.clone(element);
      }

      array.push(element);
    });

    return array;
  }

  set(array) {
    let ok = true;
    _.each(array, (arrayValue) => {
      try {
        typecast.call(this[_privateKey]._self, arrayValue, undefined, this[_privateKey]._properties.arrayType);
      }
      catch (error) {
        ok = false;
        // set it the root parent object
        if (this[_privateKey]._self && this[_privateKey]._self[_privateKey] && this[_privateKey]._self[_privateKey]._errors) {
          this[_privateKey]._self[_privateKey]._errors.push(error);
        }
      }
    });

    if (ok) {
      this.length = 0;
      this.push.apply(this, array);
    }
  }

  toJSON() {
    return this.toArray();
  }

  /**
   *  Used to detect instance of SchemaArray internally.
   * @returns {boolean}
   * @private
   */
  _isModelArray() {
    return true;
  }
}