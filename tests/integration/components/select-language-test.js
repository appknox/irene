import { test, moduleForComponent } from 'ember-qunit';
import { startMirage } from 'irene/initializers/ember-cli-mirage';
import { run } from '@ember/runloop';

moduleForComponent('select-language', 'Integration | Component | select language', {
  unit: true,
  needs: [
    'service:ajax',
    'service:session',
    'service:moment',
    'service:intl',
  ],
  beforeEach() {
    // start Mirage
    this.server = startMirage();
  },
  afterEach() {
    // shutdown Mirage
    this.server.shutdown();
  }
});

test('it renders', function (assert) {
  var component = this.subject();
  component.set("intl", {
    locale: ["en"],
    locales: [
      "en", "ja"
    ]
  });
  this.render();

  run(function () {

    assert.deepEqual(component.get("currentLocale"), { "locale": ["en"], "localeString": "English" }, 'message');
    assert.deepEqual(component.get("otherLocales"), [{ "locale": "ja", "localeString": "日本語" }], 'message');

    component.send("setLocale");

  });
});
