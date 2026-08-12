import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import type EmberFreestyleService from 'ember-freestyle/services/ember-freestyle';

export default class FreestyleRoute extends Route {
  @service('ember-freestyle') declare emberFreestyle: EmberFreestyleService;

  activate() {
    this.emberFreestyle.showCode = true;
    this.emberFreestyle.showLabels = true;
  }

  deactivate() {
    this.emberFreestyle.showCode = true;
  }
}
