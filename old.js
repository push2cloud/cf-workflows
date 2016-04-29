const WF = require('push2cloud-workflow-utils');
const diff = WF.diff;

const old = {
  apps : diff('current.apps', 'desired.apps', 'name')
, associatedRoutes : diff('current.routes', 'desired.routes', (r) => r.app + r.hostname + r.domain)
, serviceBindings : diff('current.serviceBindings', 'desired.serviceBindings', (b) => b.app + b.service)
, services : diff('current.services', 'desired.services', (s) => s.name)
};

module.exports = old;
