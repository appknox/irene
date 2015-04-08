import Ember from 'ember';
import Application from 'irene/app';
import Router from 'irene/router';
import ENV from 'irene/config/environment';
import 'simple-auth-testing/test-helpers';

export default function startApp(attrs) {
  var App;

  var attributes = Ember.merge({}, ENV.APP);
  attributes = Ember.merge(attributes, attrs); // use defaults, but you can override;

  Router.reopen({
    location: 'none'
  });

  Ember.run(function() {
    App = Application.create(attributes);
    App.setupForTesting();
    App.injectTestHelpers();
  });

  App.reset(); // this shouldn't be needed, i want to be able to "start an app at a specific URL"

  return App;
}
