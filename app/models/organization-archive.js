/* eslint-disable prettier/prettier, ember/no-classic-classes, ember/no-get */
import Model, { attr, belongsTo }  from '@ember-data/model';
import { computed } from "@ember/object";
import { inject as service } from '@ember/service';

export default Model.extend({
  logger: service('rollbar'),

  EXPIRED: 'Expired',
  INPROGRESS: 'In Progress',
  AVAILABLE: 'Available',
  ERRORED: 'Errored',

  createdOn: attr('date'),
  availableUntil: attr('date'),
  generatedBy: belongsTo('organization-user'),
  fromDate: attr(),
  toDate: attr(),
  progressPercent: attr('number'),

  isAvailable: computed('AVAILABLE', 'status',function() {
    return this.get('status') === this.get('AVAILABLE')
  }),
  isInProgress: computed('INPROGRESS', 'status',function() {
    return this.get('status') === this.get('INPROGRESS')
  }),
  isExpired: computed('EXPIRED', 'status',function() {
    return this.get('status') === this.get('EXPIRED')
  }),
  isErrrored: computed('ERRORED', 'status',function() {
    return this.get('status') === this.get('ERRORED')
  }),

  status: computed('AVAILABLE', 'ERRORED', 'EXPIRED', 'INPROGRESS', 'availableUntil', 'progressPercent',function() {
    const expiryDate = this.get('availableUntil');
    const progressPercent = this.get('progressPercent');

    if (expiryDate < Date.now()) {
      return this.EXPIRED;
    }
    if (progressPercent < 100) {
      return this.INPROGRESS;
    }
    if (progressPercent === 100) {
      return this.AVAILABLE;
    }
    return this.ERRORED;
  }),

  async downloadURL() {
    const adapter = this.store.adapterFor(this.constructor.modelName);
    try {
      const response = await adapter.getDownloadURL(this.get('id'));
      if (response && response.url && response.url.length) {
        return response.url;
      }
    } catch(err) {
      this.get('logger').error('Download organization archive URL network call failed', err);
    }
    return '';
  }
});


