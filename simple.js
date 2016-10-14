const _ = require('lodash');
const cf = require('push2cloud-cf-adapter');
const WF = require('push2cloud-workflow-utils');

const waterfall = WF.waterfall;
const map = WF.map;
const mapLimit = WF.mapLimit(4);
const mapSeries = WF.mapSeries;
const packageApp = WF.packageApp;
const step = WF.step;
const set = WF.set;
const diff = WF.diff;


const appsToDeploy = diff('desired.apps', 'current.apps', 'name');
const routes = diff('desired.routes', 'current.routes', 'hostname');
const unAssociatedRoutes = diff('desired.routes', 'current.routes', (r) => r.app + r.hostname + r.domain + (r.path || ''));
const services = diff('desired.services', 'current.services', 'name');
const serviceBindings = diff('desired.serviceBindings', 'current.apps', (r) => r.app || r.name);
const envVars = diff('desired.envVars', 'current.apps', 'name');

const simple = (deploymentConfig, api, log) =>
  waterfall(
    [ step(log('initialize'))
    , step((ctx, cb) => api.init(cb), null, 'current')
    , set('desired', deploymentConfig)
    , step(log('package apps'))
    , map(packageApp, appsToDeploy)
    , step(log('create service instances'))
    , mapSeries(api.createServiceInstance, services)
    , step(log('create routes'))
    , map(api.createRoute, routes)
    , step(log('create apps'))
    , mapLimit(api.pushApp, appsToDeploy)
    , step(log('set environement'))
    , map(api.setEnv, envVars)
    , step(log('bind services'))
    , map(api.bindService, serviceBindings)
    , step(log('start apps'))
    , map(api.startApp, appsToDeploy)
    , step(log('associate rouets'))
    , map(api.associateRoute, unAssociatedRoutes)
    , step(log('done'))
    ]
 );


module.exports = function(config, log, cb) {
  const connection = _.assign({ username: process.env.CF_USER
                              , password: process.env.CF_PWD
                              }
                              , config.target);
  const api = cf(connection);

  return simple(config, api, log)({}, cb);
};
