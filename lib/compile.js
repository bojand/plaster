const _ = require('lodash');
const hooks = require('hooks-fixed');

import _privateKey from './privatekey'
import { Model } from './model'
import { Schema } from './schema'

/**
 * Compiles a schema into a Model
 * @param descriptor
 * @param options
 * @param name
 * @returns {ModelInstance}
 * @private
 */
export function compile(descriptor, options = {}, name = undefined) {

  var schema = descriptor;
  if (!(schema instanceof Schema)) {
    schema = new Schema(schema, options);
  }

  // Some of the options require the reflection.
  if (typeof(Proxy) === 'undefined') {

    // If strict mode is off but the --harmony flag is not, fail.
    if (!options.strict) {
      throw new Error('Turning strict mode off requires --harmony flag.');
    }

    // If dot notation is on but the --harmony flag is not, fail.
    if (options.dotNotation) {
      throw new Error('Dot notation support requires --harmony flag.');
    }
  }

  /**
   * ModelInstance class is the compiled class from a schema definition. It extends <code>Model</code>.
   * All models generated are an instance of ModelInstance. It also inherits <code>hooks-fixed</code>
   * See {@link https://www.npmjs.com/package/hooks-fixed hooks-fixed} for pre and post hooks.
   * @class
   * @augments Model
   *
   */
  class ModelInstance extends Model {
    /**
     * This would be the constructor for the generated models.
     * @param {Object} data - the model instance data
     * @param {Object} options - optional creation options
     * @param {Boolean} options.clone - Whether to deep clone the incoming data. Default: <code>false</code>.
     *                                  Make sure you wish to do this as it has performance implications. This is
     *                                  useful if you are creating multiple instances from same base data and then
     *                                  wish to modify each instance.
     *
     */
    constructor(data, options = {}) {
      super(data, options, schema, name);
    }
  }

  var k;
  for (k in hooks) {
    ModelInstance.prototype[k] = ModelInstance[k] = hooks[k];
  }

  /**
   * @name schema
   * @static {Schema}
   * @memberof ModelInstance
   * @description Schema the schema of this model.
   */
  ModelInstance.schema = schema;

  /**
   * @name modelName
   * @static {String}
   * @memberof ModelInstance
   * @description The name of the model.
   */
  ModelInstance.modelName = name;

  // Add custom methods to generated class.
  _.each(schema.methods, (method, key) => {
    if (ModelInstance.prototype[key]) {
      throw new Error(`Cannot overwrite existing ${key} method with custom method.`);
    }
    ModelInstance.prototype[key] = method;
  });

  // Add custom static methods to generated class.
  _.each(schema.statics, (method, key) => {
    if (ModelInstance[key]) {
      throw new Error(`Cannot overwrite existing ${key} static with custom method.`);
    }
    ModelInstance[key] = method;
  });

  setupHooks(ModelInstance);

  // if the user wants to allow modifications
  if (options.freeze !== false) Object.freeze(ModelInstance);

  return ModelInstance;
}

/*!
 * Sets up hooks for the new Model
 * @param InstanceModel
 */
function setupHooks(InstanceModel) {
  // set up hooks
  var ourHookedFnNames = ['save', 'remove'];
  ourHookedFnNames.forEach(function (fnName) {
    InstanceModel.hook(fnName, InstanceModel.prototype[fnName]);
  });

  var q = InstanceModel.schema && InstanceModel.schema.callQueue;

  if (q) {
    for (var i = 0, l = q.length; i < l; i++) {
      var hookFn = q[i].hook;
      var args = q[i].args;

      var hookedFnName = args[0];
      if (ourHookedFnNames.indexOf(hookedFnName) === -1) {
        InstanceModel.hook(hookedFnName, InstanceModel.prototype[hookedFnName]);
      }

      function wrapPostHook(fnArgs, index) {
        var mwfn = fnArgs[index];

        function hookCb(next) {
          mwfn.apply(this);
          next(undefined, this);
        }

        fnArgs[index] = hookCb;
      }

      // wrap post
      if (hookFn === 'post' && ourHookedFnNames.indexOf(hookedFnName) >= 0) {
        if (args.length === 2 && typeof args[1] === 'function') {
          wrapPostHook(args, 1);
        }
        else if (args.length === 3 && typeof args[2] === 'function') {
          wrapPostHook(args, 2);
        }
      }

      InstanceModel[hookFn].apply(InstanceModel, args);
    }
  }
}