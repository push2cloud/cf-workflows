const _ = require('lodash');
const cf = require('push2cloud-cf-adapter');
const WF = require('push2cloud-workflow-utils');
const init = require('push2cloud-cf-workflows/init');
const switchRoutes = require('push2cloud-cf-workflows/switchRoutes');
const old = require('push2cloud-cf-workflows/old');
const missing = require('push2cloud-cf-workflows/missing');

const waterfall = WF.waterfall;
const map = WF.map;
const mapSeries = WF.mapSeries;
const mapLimit = WF.mapLimit(4);
const combine = WF.combine;
const packageApp = WF.packageApp;


const redeployAllApps = (deploymentConfig, api, log) =>
  waterfall(
    [ init(deploymentConfig, api, log)
    , map(packageApp, 'desired.apps')
    , map(api.unbindService, 'current.serviceBindings')
    , map(api.deleteApp, 'current.apps')
    , mapSeries(api.createServiceInstance, missing.services)
    , map(api.createRoute, missing.routes)
    , map(api.createApp, 'desired.apps')
    , mapLimit(api.uploadApp, 'desired.apps')
    , map(api.setEnv, 'desired.envVars')
    , map(api.stageApp, 'desired.apps')
    , map(api.bindService, 'desired.serviceBindings')
    , map(api.startAppAndWaitForInstances, 'desired.apps')
    , map(api.associateRoute, 'desired.routes')
    ]
 );


module.exports = function(config, log, cb) {
  const api = cf(_.assign({
    username: process.env.CF_USER
  , password: process.env.CF_PWD
  }
  , config.target));

  return redeployAllApps(config, api, log)({}, cb);
};
