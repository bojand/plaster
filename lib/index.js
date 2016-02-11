if (!global._babelPolyfill) {
  // This should be replaced with runtime transformer when this bug is fixed:
  // https://phabricator.babeljs.io/T2877
  require('babel-polyfill');
}

const _ = require('lodash');

// Without the --harmony and --harmony_proxies flags, options strict: false and dotNotation: true will fail with exception
if (typeof(Proxy) !== 'undefined') {
  // Workaround for https://github.com/tvcutsem/harmony-reflect/issues/66
  const warn = console.warn;
  console.warn = function (message) {
    if (message !== 'getOwnPropertyNames trap is deprecated. Use ownKeys instead') {
      warn.apply(console, arguments);
    }
  };
  require('harmony-reflect');
}

import { Schema } from './schema'
import { Model } from './model'
import { ModelArray } from './modelarray'
import { compile } from './compile'

/**
 * Main Plaster class. Use this class to set default options and create schemas and models.
 * @class
 *
 * @example
 * var plaster = require('plaster');
 *
 * var schema = plaster.schema({ name: String });
 * var Cat = plaster.model('Cat', schema);
 * var kitty = new Cat({ name: 'Zildjian' });
 *
 */
class Plaster {
  /**
   * By default we export an instance of Plaster object.
   * Clients can create a new instances using the constructor.
   *
   * @example
   * var plaster = require('plaster');
   * var p2 = new plaster.Plaster();
   *
   * @param {Object} options default schema options
   * @param {Boolean} options.strict - By default (<code>true</code>), allow only values in the schema to be set.
   *                                 When this is <code>false</code>, setting new fields will dynamically add the field
   *                                 to the schema as type "any".
   * @param {Boolean} options.dotNotation - Allow fields to be set via dotNotation. Default: <code>true</code>.
   *                                      <code>obj['user.name'] = 'Joe'; -> obj: { user: 'Joe' }</code>
   *
   */
  constructor(options = {}) {
    this.models = {};
    this.options = options;

    /**
     * Expose the Schema class
     * @member {Schema}
     *
     * @example
     * var schema = new plaster.Schema({ name: String});
     */
    this.Schema = Schema;

    /**
     * Expose the Model class
     * @member {Model}
     *
     * @example
     * var schema = plaster.schema({ name: String });
     * var Cat = plaster.model('Cat', schema);
     * var kitty = new Cat({ name: 'Zildjian' });
     * console.log(kitty insanceof plaster.Model); // true
     */
    this.Model = Model;

    /**
     * Expose the ModelArray class
     * @member {ModelArray}
     */
    this.ModelArray = ModelArray;

    /**
     * Expose Plaster constructor so clients can create new instances.
     * @member {Plaster}
     */
    this.Plaster = Plaster;
  }

  /**
   * Creates a schema. Prefer to use this over Schema constructor as this will pass along Plaster config settings.
   *
   * @api public
   * @param {Object} descriptor the schema descriptor
   * @param {Object} options Schema options
   * @return {Object} created Schema instance
   */
  schema(descriptor, options) {
    let opts = _.defaults(options || {}, this.options);
    return new Schema(descriptor, opts);
  }

  /**
   * Creates a model from a schema.
   *
   * @api public
   * @param {String} name name of the model.
   * @param {Schema} schema instance
   * @param {Object} options - options
   * @param {Boolean} options.freeze - to freeze model. See <code>Object.freeze</code>. Default: <code>true</code>
   */
  model(name, schema, options = {}) {
    if (!(schema instanceof Schema))
      schema = new Schema(schema, options || this.options);

    if (this.models[name])
      return this.models[name];

    const M = compile(schema, options, name);
    this.models[name] = M;
    return M;
  }

  /**
   * Sets Plaster config options
   *
   * @api public
   * @param key {String} the option key
   * @param value {*} option value
   */
  set(key, value) {
    if (arguments.length === 1) {
      return this.options[key];
    }

    this.options[key] = value;
    return this;
  }

  /**
   * Get option.
   * @type {Function|*}
   * @return {*} Option value
   */
  get() {
    this.set.call(this, arguments)
  }

  /**
   * Returns the model given the name.
   * @param name
   * @returns {*}
   */
  getModel(name) {
    return this.models[name];
  }

  /**
   * Returns an array of model names created on this instance of Plaster.
   *
   * @api public
   * @return {Array} Array of model names registered.
   */
  modelNames() {
    return Object.keys(this.models);
  }
}

module.exports = new Plaster();