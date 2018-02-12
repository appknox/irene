/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import Ember from 'ember';
import config from 'irene/config/environment';

const ResetRoute = Ember.Route.extend({
  title: `Reset Password${config.platform}`,
  model(params) {
    return params;
  }
});

export default ResetRoute;
