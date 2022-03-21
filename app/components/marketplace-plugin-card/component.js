/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components */
import Component from '@ember/component';
import { task } from 'ember-concurrency';

export default Component.extend({
  showInstructionsModal: false,
  openInstructionsModal: task(function* () {
    yield this.set('showInstructionsModal', true);
  }),
});
