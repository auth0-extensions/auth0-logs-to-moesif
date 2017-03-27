/**
 * Created by Xingheng on 8/17/16.
 */
const async = require('async');

function buildParams(prefix, obj, add) {
  var name, i, l, rbracket;
  rbracket = /\[\]$/;
  if (obj instanceof Array) {
    for (i = 0, l = obj.length; i < l; i++) {
      if (rbracket.test(prefix)) {
        add(prefix, obj[i]);
      } else {
        buildParams(prefix + '[' + ( typeof obj[i] === 'object' ? i : '' ) + ']', obj[i], add);
      }
    }
  } else if (typeof obj == 'object') {
    // Serialize object item.
    for (name in obj) {
      buildParams(prefix + '[' + name + ']', obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}

module.exports.objectToQueryString = function(a) {
  var prefix, s, add, name, r20, output;
  s = [];
  r20 = /%20/g;
  add = (key, value) => {
    // If value is a function, invoke it and return its value
    value = ( typeof value == 'function' ) ? value() : ( value == null ? '' : value );
    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  };
  if (a instanceof Array) {
    for (name in a) {
      add(name, a[name]);
    }
  } else {
    for (prefix in a) {
      buildParams(prefix, a[prefix], add);
    }
  }
  output = s.join('&').replace(r20, '+');
  return output;
};

module.exports.getNewUsers = function(client, logs, callback) {
  async.eachLimit(logs, 10, (log, next) =>
      client.users.get({ id: log.user_id })
        .then(() => next())
        .catch(() => next()),
    callback);
};
