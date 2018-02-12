/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import config from 'irene/config/environment';
import ScrollTopMixin from 'irene/mixins/scroll-top';

const AuthenticatedCompareRoute = Ember.Route.extend(ScrollTopMixin, {

  title: `File Compare${config.platform}`,
  model(data){
    const files = data.files.split("...");
    return {
      file: this.get('store').find('file', parseInt(files[0])),
      fileOld: this.get('store').find('file', parseInt(files[1]))
    };
  }
});

export default AuthenticatedCompareRoute;
