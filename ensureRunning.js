const _ = require('lodash');
const _fp = require('lodash/fp');
const map = require('push2cloud-workflow-utils').map;

const stopped = (ctx) => {
  return _fp.filter((a) => {
    if (a.state === 'STOPPED' || a.state === 'STAGED') {
      return _.some(ctx.desired.apps, { name: a.name });
    }
  });
};
const ensureRunning = (api) => map(api.startAppAndWaitForInstances, (ctx) => stopped(ctx)(api.actualDeploymentConfig.apps));

module.exports = ensureRunning;
