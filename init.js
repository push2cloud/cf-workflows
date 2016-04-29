const WF = require('push2cloud-workflow-utils');

const waterfall = WF.waterfall;
const step = WF.step;
const set = WF.set;

const init = (deploymentConfig, api, log) =>
  waterfall(
    [ step(log('initialize'))
    , step(log('=========='))
    , step((ctx, cb) => api.init(cb), null, 'current')
    , set('desired', deploymentConfig)
    , step(log('initialization done'))
    ]
  );

module.exports = init;
