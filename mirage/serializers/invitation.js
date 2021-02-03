// import { JSONAPISerializer } from 'ember-cli-mirage';

import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  include: ['user', 'project']
});
