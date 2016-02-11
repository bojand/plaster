const _ = require('lodash');

// Returns typecasted value if possible. If rejected, originalValue is returned.
export function typecast(value, originalValue, properties) {
  // Allow transform to manipulate raw properties.
  if (properties.transform) {
    value = properties.transform.call(this, value, originalValue, properties);
  }

  // Property types are always normalized as lowercase strings despite shorthand definitions being available.
  switch (properties.type) {
    case 'string':
      // Reject if object or array.
      if (_.isObject(value) || _.isArray(value)) {
        throw new SetterError('String type cannot typecast Object or Array types.', value, originalValue, properties);
      }

      // If index is being set with null or undefined, set value and end.
      if (value === undefined || value === null) {
        return value;
      }

      // Typecast to String.
      value = value + '';

      // If stringTransform function is defined, use.
      // This is used before we do validation checks (except to be sure we have a string at all).
      if (properties.stringTransform) {
        value = properties.stringTransform.call(this, value, originalValue, properties);
      }

      // If clip property & maxLength properties are set, the string should be clipped.
      // This is basically a shortcut property that could be done with stringTransform.
      if (properties.clip !== undefined && properties.maxLength !== undefined) {
        value = value.substr(0, properties.maxLength);
      }

      // If enum is being used, be sure the value is within definition.
      if (_.isArray(properties.enum) && properties.enum.indexOf(value) === -1) {
        throw new SetterError('String does not exist in enum list.', value, originalValue, properties);
      }

      // If minLength is defined, check to be sure the string is > minLength.
      if (properties.minLength !== undefined && value.length < properties.minLength) {
        throw new SetterError('String length too short to meet minLength requirement.', value, originalValue, properties);
      }

      // If maxLength is defined, check to be sure the string is < maxLength.
      if (properties.maxLength !== undefined && value.length > properties.maxLength) {
        throw new SetterError('String length too long to meet maxLength requirement.', value, originalValue, properties);
      }

      // If regex is defined, check to be sure the string matches the regex pattern.
      if (properties.regex && !properties.regex.test(value)) {
        throw new SetterError('String does not match regular expression pattern.', value, originalValue, properties);
      }

      return value;
      break;

    case 'number':
      // If index is being set with null, undefined, or empty string: clear value.
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      // Set values for boolean.
      if (_.isBoolean(value)) {
        //value = value ? 1 : 0;
        throw new SetterError('Number type cannot typecast Boolean types.', value, originalValue, properties);
      }

      // Reject if array, object, or not numeric.
      if (_.isArray(value) || _.isObject(value) || !isNumeric(value)) {
        throw new SetterError('Number type cannot typecast Array or Object types.', value, originalValue, properties);
      }

      // Typecast to number.
      value = value * 1;

      // Transformation after typecasting but before validation and filters.
      if (properties.numberTransform) {
        value = properties.numberTransform.call(this, value, originalValue, properties);
      }

      if (properties.min !== undefined && value < properties.min) {
        throw new SetterError('Number is too small to meet min requirement.', value, originalValue, properties);
      }

      if (properties.max !== undefined && value > properties.max) {
        throw new SetterError('Number is too big to meet max requirement.', value, originalValue, properties);
      }

      return value;
      break;

    case 'boolean':
      // If index is being set with null, undefined, or empty string: clear value.
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      // If is String and is 'false', return false.
      if (_.isString(value)) {
        if (value.toLowerCase() === 'false') {
          return false;
        }
        else if (value.toLowerCase() === 'true') {
          return true;
        }
        throw new SetterError('Cannot typecast to Boolean.', value, originalValue, properties);
      }

      // If is Number, <0 is true and >0 is false.
      //if (isNumeric(value)) {
      //return (value * 1) > 0 ? true : false;
      //}
      if (_.isArray(value) || _.isObject(value) || isNumeric(value)) {
        throw new SetterError('Cannot typecast to Boolean.', value, originalValue, properties);
      }

      if (value === undefined) {
        return value;
      }

      // Use Javascript to eval and return boolean.
      value = value ? true : false;

      // Transformation after typecasting but before validation and filters.
      if (properties.booleanTransform) {
        value = properties.booleanTransform.call(this, value, originalValue, properties);
      }

      return value;
      break;

    case 'array':
      // If it's an object, typecast to an array and return array.
      if (_.isObject(value)) {
        value = _.toArray(value);
      }

      // Reject if not array.
      if (!_.isArray(value)) {
        throw new SetterError('Array type cannot typecast non-Array types.', value, originalValue, properties);
      }

      // Arrays are never set directly.
      // Instead, the values are copied over to the existing SchemaArray instance.
      // The SchemaArray is initialized immediately and will always exist.
      if (_.isFunction(originalValue.set)) {
        originalValue.set(value);
      }
      else {
        originalValue.length = 0;
        _.each(value, (arrayValue) => {
          originalValue.push(arrayValue);
        });
      }

      return originalValue;
      break;

    case 'object':
      // If it's not an Object, reject.
      if (!_.isObject(value)) {
        throw new SetterError('Object type cannot typecast non-Object types.', value, originalValue, properties);
      }

      // If object is schema object and an entirely new object was passed, clear values and set.
      // This preserves the object instance.
      if (properties.objectType) {
        // The object will usually exist because it's initialized immediately for deep access within Model.
        // However, in the case of Array elements, it will not exist.
        let object;
        if (originalValue !== undefined) {
          // Clear existing values.
          object = originalValue;
          object.clear();
        } else {
          // The Model doesn't exist yet. Let's initialize a new one.
          // This is used for Array types.
          object = new properties.objectType;
        }

        for (const key in value) {
          object[key] = value[key];
        }
        value = object;
      }

      // Otherwise, it's OK.
      return value;
      break;

    case 'date':
      // If index is being set with null, undefined, or empty string: clear value.
      if (value === undefined || value === null || value === '') {
        return undefined;
      }

      // Reject if object, array or boolean.
      if (!_.isDate(value) && !_.isString(value) && !_.isNumber(value)) {
        throw new SetterError('Date type cannot typecast Array or Object types.', value, originalValue, properties);
      }

      // Attempt to parse string value with Date.parse (which returns number of milliseconds).
      if (_.isString(value)) {
        value = Date.parse(value);
      }

      // If is timestamp, convert to Date.
      if (_.isNumber(value)) {
        value = new Date((value + '').length > 10 ? value : value * 1000);
      }

      // If the date couldn't be parsed, do not modify index.
      if (value == 'Invalid Date' || !_.isDate(value)) {
        throw new SetterError('Could not parse date.', value, originalValue, properties);
      }

      // Transformation after typecasting but before validation and filters.
      if (properties.dateTransform) {
        value = properties.dateTransform.call(this, value, originalValue, properties);
      }

      return value;
      break;

    default: // 'any'
      return value;
      break;
  }
}

// Is a number (ignores type).
export function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function getFunctionName(fn) {
  if (fn.name) {
    return fn.name;
  }
  return (fn.toString().trim().match(/^function\s*([^\s(]+)/) || [])[1];
}

// Represents an error encountered when trying to set a value.
export class SetterError {
  constructor(errorMessage, setValue, originalValue, fieldSchema) {
    this.errorMessage = errorMessage;
    this.setValue = setValue;
    this.originalValue = originalValue;
    this.fieldSchema = fieldSchema;
  }
}