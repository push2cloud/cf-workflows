const WF = require('push2cloud-workflow-utils');
const _fp = require('lodash/fp');

const waterfall = WF.waterfall;
const step = WF.step;
const map = WF.map;
const from = WF.from;

const deleter = (api, log) =>
  waterfall(
    [ step(log('delete apps'))
    , step(log('==========='))
    , map(api.disassociateRoute, from('current.routes', _fp.filter((r) => r.app || r.appGuid)))
    , map(api.stopApp, from('current.apps', _fp.filter((a) => a.state !== 'STOPPED')))
    , map(api.unbindService, from('current.serviceBindings', _fp.filter((a) => a.guid)))
    , map(api.deleteApp, 'current.apps')
    , map(api.deleteRoute, 'current.routes')
    , step(log('apps deleted'))
    ]
 );

module.exports = deleter;
