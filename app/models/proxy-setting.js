/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr }  from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  enabled: attr('boolean'),
  host: attr('string'),
  port: attr('string'),

  hasProxyUrl: computed('host', 'port', function() {
    const host = this.get('host');
    const port = this.get('port');
    return !!host && !!port;
  })
});
