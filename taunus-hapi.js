'use strict';

var util = require('util');
var pkg = require('./package.json');

function factory (taunus) {
  var plugin = {
    register: register
  };

  function register (plugin, options, next) {
    taunus.mount(addRoute, options);
    next();

    function addRoute (d) {
      plugin.route({
        method: 'GET',
        path: d.route,
        config: d.config,
        handler: function (request, reply) {
          if (d.actionFn) {
            d.actionFn(request, response);
          } else {
            response({});
          }

          function response (vm) {
            var headers = {};
            var statusCode;
            var req = request;
            var res = {
              set: set,
              status: status,
              send: send,
              json: json,
              jsonp: jsonp
            };

            req.url = req.url.path;

            function get (name) {
              return headers[name.toLowerCase()];
            }

            function set (name, value) {
              headers[name.toLowerCase()] = value;
            }

            function status (code) {
              statusCode = code;
            }

            function send (data) {
              respond(data);
            }

            function json (data) {
              respond(data);
            }

            function jsonp (data) {
              var cb = req.query.callback;
              var body = JSON.stringify(data);

              if (!(get('Content-Type'))) {
                set('Content-Type', 'application/json');
              }

              if (typeof cb === 'string' && cb.length !== 0) {
                set('Content-Type', 'text/javascript');
                set('X-Content-Type-Options', 'nosniff');

                // restrict callback charset
                cb = cb.replace(/[^\[\]\w$.]/g, '');

                // replace chars not allowed in JavaScript that are in JSON
                body = body
                  .replace(/\u2028/g, '\\u2028')
                  .replace(/\u2029/g, '\\u2029');

                // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
                // the typeof check is just to reduce client error noise
                body = util.format('/**/ typeof %s === \'function\' && %s(%s);', cb, cb, JSON.stringify(data));
              }

              respond(body);
            }

            function respond (response) {
              var r = reply(response).code(statusCode || 200);
              Object.keys(headers).forEach(function add (key) {
                r.header(key, headers[key]);
              });
            }

            taunus.render(d.action, vm, req, res, next);
          }

          function next (err) {
            if (err) {
              console.warn('Taunus called .next(err), won\'t reply.\n', err.stack || err.message || err);
            } else {
              console.info('Taunus called .next(), won\'t reply.');
            }
          }
        }
      });
    }
  }

  plugin.register.attributes = { pkg: pkg };

  return plugin;
}

module.exports = factory;
