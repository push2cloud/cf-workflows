const _ = require('lodash');
const cf = require('push2cloud-cf-adapter');
const WF = require('push2cloud-workflow-utils');

const waterfall = WF.waterfall;
const map = WF.map;
const step = WF.step;
const set = WF.set;
const intersection = WF.intersection;


const apps = intersection('desired.apps', 'current.apps', 'name');
const routes = intersection('desired.routes', 'current.routes', 'hostname');
const associatedRoutes = intersection('desired.routes', 'current.routes', (r) => r.app + r.hostname + r.domain + (r.path || ''));
const serviceBindings = intersection('desired.serviceBindings', 'current.serviceBindings', (b) => b.app + b.service);


const deleter = (deploymentConfig, api, log) =>
  waterfall(
    [ step((ctx, cb) => api.init(cb), null, 'current')
    , set('desired', deploymentConfig)
    , map(api.disassociateRoute, associatedRoutes)
    , map(api.stopApp, apps)
    , map(api.unbindService, serviceBindings)
    , map(api.deleteApp, apps)
    // TODO: @swisscom please fix me , map(api.deleteServiceInstance, services)
    , map(api.deleteRoute, routes)
    ]
 );


module.exports = function(config, log, cb) {
  const connection = _.assign({ username: process.env.CF_USER
                              , password: process.env.CF_PWD }
                              , config.target);
  const api = cf(connection);

  return deleter(config, api, log)({}, cb);
};
