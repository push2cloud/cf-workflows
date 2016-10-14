const WF = require('push2cloud-workflow-utils');
const diff = WF.diff;

const missing = {
  apps: diff('desired.apps', 'current.apps', 'name')
, routes: diff('desired.routes', 'current.routes', 'hostname')
, unAssociatedRoutes: diff('desired.routes', 'current.routes', (r) => r.app + r.hostname + r.domain + (r.path || ''))
, services: diff('desired.services', 'current.services', 'name')
, serviceBindings: diff('desired.serviceBindings', 'current.serviceBindings', (r) => r.app)
, envVars: diff('desired.envVars', 'current.apps', 'name')
};

module.exports = missing;
