import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  enabled: DS.attr('boolean'),
  host: DS.attr('string'),
  port: DS.attr('string'),

  hasProxyUrl: computed('host', 'port', function() {
    const host = this.get('host');
    const port = this.get('port');
    return !!host && !!port;
  })
});
