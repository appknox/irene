/* eslint-disable ember/no-classic-components, ember/no-classic-classes, ember/require-tagless-components, ember/no-get */
import Component from '@ember/component';
import { task } from 'ember-concurrency';

const ConfirmBoxComponent = Component.extend({
  isActive: false,
  layoutName: 'components/confirm-box',
  delegate: null,

  confirmAction() {},
  cancelAction() {},

  clearModal: task(function* () {
    this.set('isActive', false);
    yield this.get('cancelAction')();
  }),

  sendCallback: task(function* () {
    const delegate = this.get('delegate');

    yield this.get('confirmAction')();

    if (delegate && delegate.confirmCallback) {
      yield delegate.confirmCallback(this.get('key'));
    }
  }),
});

export default ConfirmBoxComponent;
