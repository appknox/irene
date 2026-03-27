import Route from '@ember/routing/route';

const FIRST_COMPONENT = 'ak-accordion';

export default class FreestyleIndexRoute extends Route {
  model() {
    return FIRST_COMPONENT;
  }
}
