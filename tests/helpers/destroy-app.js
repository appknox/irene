import Ember from 'ember';

export default function destroyApp(application) {
  Ember.run(application, 'destroy');
  // eslint-disable-next-line
  server.shutdown();
}
