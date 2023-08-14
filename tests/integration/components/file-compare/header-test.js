import { module, test } from 'qunit';
import { setupIntl } from 'ember-intl/test-support';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

class RouterStub extends Service {
  currentRouteName = 'authenticated.dashboard.compare';

  transitionTo(routeName) {
    this.currentRouteName = routeName;
  }
}

module('Integration | Component | file-compare/header', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    // Server Mocks
    this.server.get('/v2/projects/:id', (schema, req) => {
      return schema.projects.find(req.params.id).toJSON();
    });

    this.store = this.owner.lookup('service:store');
    this.owner.register('service:router', RouterStub);

    const files = this.server.createList('file', 6);
    const project = this.server.create('project');

    const normalizedFiles = files.map((file) =>
      this.store.normalize('file', { ...file.toJSON(), project: project.id })
    );
    const fileModels = normalizedFiles.map((file) => this.store.push(file));

    const file1 = fileModels[0];
    const file2 = fileModels[5];

    this.setProperties({
      file1,
      file2,
      project: file1.project,
    });
  });

  test('it renders', async function (assert) {
    await render(
      hbs`<FileCompare::Header 
          @file1={{this.file1}} 
          @file2={{this.file2}} 
        />`
    );

    assert.dom('[data-test-fileCompare-header-root]').exists();
    assert.dom('[data-test-fileCompare-headerBreadcrumbs]').exists();

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-fileIconUrl]')
      .exists()
      .hasAttribute('src', this.file1.iconUrl);

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-fileName]')
      .exists()
      .containsText(this.file1.name);

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-packageName]')
      .exists()
      .containsText(this.file1.project.get('packageName'));

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-projectID]')
      .doesNotExist();

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-settingsBtn]')
      .doesNotExist();

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-settingsBtn-icon]')
      .doesNotExist();

    assert
      .dom('[data-test-fileCompareHeader-fileCompare-content]')
      .exists()
      .containsText('t:compare:()')
      .containsText('t:fileCompare.summary1:()')
      .containsText('t:fileCompare.summary2:()');
  });

  test('it shows settings redirect button and project details in overview if project exists', async function (assert) {
    await render(
      hbs`<FileCompare::Header 
          @file1={{this.file1}} 
          @file2={{this.file2}} 
          @project={{this.project}}
        />`
    );

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-projectID]')
      .exists()
      .containsText('t:projectID:()')
      .containsText(this.file1.project.get('id'));

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-settingsBtn]')
      .exists()
      .containsText('t:settings:()');

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-settingsBtn-icon]')
      .exists();
  });

  test('it redirects to settings page if button is clicked', async function (assert) {
    await render(
      hbs`<FileCompare::Header 
          @file1={{this.file1}} 
          @file2={{this.file2}} 
          @project={{this.project}}
        />`
    );

    assert
      .dom('[data-test-fileCompareHeader-projectOverview-settingsBtn]')
      .exists();

    await click('[data-test-fileCompareHeader-projectOverview-settingsBtn]');

    const router = this.owner.lookup('service:router');

    assert.strictEqual(
      router.currentRouteName,
      'authenticated.project.settings'
    );
  });

  test('it toggles file overview cards', async function (assert) {
    // Common server mocks
    this.server.get('/profiles/:id/unknown_analysis_status', (_, req) => {
      return {
        id: req.params.id,
        status: true,
      };
    });

    this.set('expandFilesOverview', false);

    await render(
      hbs`<FileCompare::Header 
          @file1={{this.file1}} 
          @file2={{this.file2}} 
          @project={{this.project}}
          @expandFilesOverview={{this.expandFilesOverview}}
        />`
    );

    assert.dom('[data-test-fileCompareHeader-file1Overview]').doesNotExist();
    assert.dom('[data-test-fileCompareHeader-file2Overview]').doesNotExist();

    this.set('expandFilesOverview', true);

    assert.dom('[data-test-fileCompareHeader-file1Overview]').exists();
    assert.dom('[data-test-fileCompareHeader-file2Overview]').exists();
  });

  test('it yielded header replaces default header content if block is provided', async function (assert) {
    await render(
      hbs`
        <FileCompare::Header 
          @file1={{this.file1}} 
          @file2={{this.file2}}
        > 
          <:header>
            <div data-test-yielded-customHeader>
              breadcrumbs
            </div>
          </:header>

        </FileCompare::Header>`
    );

    assert.dom('[data-test-yielded-customHeader]').exists();
    assert
      .dom('[data-test-fileCompareHeader-fileCompare-content]')
      .doesNotExist();
  });

  test('it renders yielded blocks if provided', async function (assert) {
    await render(
      hbs`
        <FileCompare::Header 
          @file1={{this.file1}} 
          @file2={{this.file2}}
        > 
          <:breadcrumbs>
            <div data-test-yielded-breadcrumbs>
              breadcrumbs
            </div>
          </:breadcrumbs>

          <:file1Content>
            <div data-test-yielded-file1Content>
              file1Content
            </div>
          </:file1Content>

          <:file2Content>
            <div data-test-yielded-file2Content>
              file2Content
            </div>
          </:file2Content>
        
          <:headerCTA>
            <div data-test-yielded-headerCTA>
              headerCTA
            </div>
          </:headerCTA>
        </FileCompare::Header>`
    );

    assert.dom('[data-test-yielded-breadcrumbs]').exists();
    assert.dom('[data-test-yielded-file1Content]').exists();
    assert.dom('[data-test-yielded-headerCTA]').exists();
  });
});
