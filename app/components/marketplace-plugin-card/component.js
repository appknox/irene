import Component from '@ember/component';
import {
  task
} from 'ember-concurrency';

export default Component.extend({
  showInstructionsModal: false,
  toggleInstructionsModal: task(function* () {
    yield this.set('showInstructionsModal', !this.get('showInstructionsModal'));
  }),
});
