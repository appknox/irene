import { isToken } from'../helpers/scroll-to';
import Mixin from '@ember/object/mixin'
//  const { inject } = Ember;
import { inject as service } from '@ember/service';

 const LinkComponentMixin = Mixin.create({
  scrollToken: false,
  scrollTo: service('scroll-to'),

  willRender () {
    this._super(...arguments);

    let models = this.get('models', models);
    if (!models.length) {
      return;
    }

    for (let i in models) {
      if (isToken(models[i])) {
        this.set('scrollToken', models[i]);
        models.splice(i, 1);
        break;
      }
    }
  },

  _invoke() {
    this.get('scrollTo').set('afterTransition', this.get('scrollToken'));
    this._super(...arguments);
  }
});
export default LinkComponentMixin
