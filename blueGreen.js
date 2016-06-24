const _ = require('lodash');
const cf = require('push2cloud-cf-adapter');
const WF = require('push2cloud-workflow-utils');
const init = require('./init');
const switchRoutes = require('./switchRoutes');
const old = require('./old');
const missing = require('./missing');

const waterfall = WF.waterfall;
const map = WF.map;
const mapSeries = WF.mapSeries;
const mapLimit = WF.mapLimit(4);
const combine = WF.combine;
const packageApp = WF.packageApp;


const blueGreen = (deploymentConfig, api, log) =>
  waterfall(
    [ init(deploymentConfig, api, log)
    , map(packageApp, missing.apps)
    , mapSeries(api.createServiceInstance, missing.services)
    , map(api.createRoute, missing.routes)
    , map(api.createApp, missing.apps)
    , mapLimit(api.uploadApp, missing.apps)
    , map(api.setEnv, missing.envVars)
    , map(api.stageApp, missing.apps)
    , map(api.bindService, missing.serviceBindings)
    , map(api.startAppAndWaitForInstances, missing.apps)
    , map(api.associateRoute, missing.unAssociatedRoutes)
    , map(switchRoutes(api), combine('desired.routes', old.associatedRoutes, (r) => (r.unversionedName + r.hostname + r.domain)))
    , map(api.stopApp, old.apps)
    , map(api.unbindService, old.serviceBindings)
    , map(api.deleteApp, old.apps)
    ]
 );


module.exports = function(config, log, cb) {
  const api = cf(_.assign({
    username: process.env.CF_USER
  , password: process.env.CF_PWD
  }
  , config.target));

  return blueGreen(config, api, log)({}, cb);
};
