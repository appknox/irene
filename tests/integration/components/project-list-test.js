import {
  module,
  test
} from 'qunit';
import {
  render
} from '@ember/test-helpers';
import {
  hbs
} from 'ember-cli-htmlbars';
import {
  setupRenderingTest
} from 'ember-qunit';
import {
  setupMirage
} from "ember-cli-mirage/test-support";
import {
  startMirage
} from 'irene/initializers/ember-cli-mirage';


module('Integration | Component | project-list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  // const server = startMirage();
  // server.createList('project', 10)
  let server = null;

  hooks.beforeEach(() => {
    console.log('before')
    server = startMirage();
  })

  hooks.afterEach(() => {
    console.log('after')
    // this.server.shutdown();
  })

  test('it renders', async function (assert) {

    const someThing = this.owner.lookup('service:organization');
    console.log('this', this)

    // someThing.load();
    someThing.set('selected', server.create('organization'))
    this.set('projects', server.createList('project', 10));
    console.log('file', this.projects[0].files)

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs `<ProjectList @projects={{this.projects}}/>`);

  });

  test('10 projects', async function (assert) {
    console.log('this in sec', this)
  })
});
