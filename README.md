# taunus-hapi

> Taunus plugin for Hapi

# Install

```shell
npm install taunus-hapi --save
```

# Use

```js
var Hapi = require('hapi');
var taunus = require('taunus');
var taunusHapi = require('taunus-hapi')(taunus);
var pack = new Hapi.Pack();

pack.register({
  plugin: taunusHapi,
  options: {
    // ...
  }
});
```

Note that the `options` object is configured as [documented by the Taunus API documentation](http://taunus.io/api#using-taunus-hapi-).

# License

MIT
