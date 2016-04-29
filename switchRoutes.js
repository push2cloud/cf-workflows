const async = require('async');
const _ = require('lodash');

const switchRoutes = (api) => (routes, cb) => {
  async.series([
    (next) => {
      _.isEmpty(routes[0]) ? next() : api.associateRoute(routes[0], next);
    },
    (next) => {
      _.isEmpty(routes[1]) ? next() : api.disassociateRoute(routes[1], next);
    }
  ], (err) => cb(err, routes));
};

module.exports = switchRoutes;
