const _ = require('lodash');
const step = require('push2cloud-workflow-utils').step;

const ensure = step((ctx, cb) => {
  _.forEach(ctx.desired.apps, (a) => {
    var ca = _.find(ctx.current.apps, { unversionedName: a.unversionedName });
    if (ca) {
      if (ca.memory > a.memory) a.memory = ca.memory;
      if (ca.disk > a.disk) a.disk = ca.disk;
      if (ca.instances > a.instances) a.instances = ca.instances;
    }
  });
  cb(null, ctx.desired);
}, null, 'desired');

module.exports = ensure;
