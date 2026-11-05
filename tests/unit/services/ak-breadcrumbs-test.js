import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

const GROUP = 'offensive-security';
const NEW_ASSESSMENT = 'authenticated.offensive-security.new-assessment';
const SCAN = 'authenticated.offensive-security.scan';
const RUNS = 'authenticated.offensive-security.index';

module('Unit | Service | ak-breadcrumbs', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.service = this.owner.lookup('service:ak-breadcrumbs');

    const runsCrumb = { title: 'Runs', route: RUNS, routeGroup: GROUP };

    this.scanCrumb = {
      title: 'Scan',
      route: SCAN,
      models: ['1'],
      routeGroup: GROUP,
      fallbackCrumbs: [
        runsCrumb,
        { title: 'Scan', route: SCAN, models: ['1'] },
      ],
    };

    // The crumbs saved by the page the user came from: Runs > New Assessment
    this.service.window.sessionStorage.setItem(
      'lastBreadcrumbsState',
      JSON.stringify({
        route: NEW_ASSESSMENT,
        items: [
          runsCrumb,
          { title: 'New', route: NEW_ASSESSMENT, routeGroup: GROUP },
        ],
      })
    );
  });

  hooks.afterEach(function () {
    this.service.window.sessionStorage.removeItem('lastBreadcrumbsState');
  });

  // Builds the trail for the scan page reached from the new assessment page
  function trailFor(context, { isTransientCrumb }) {
    const newAssessmentCrumb = {
      title: 'New',
      route: NEW_ASSESSMENT,
      routeGroup: GROUP,
      isTransientCrumb,
    };

    const route = {
      routeName: SCAN,
      controller: { breadcrumbs: context.scanCrumb },
      controllerFor: (name) =>
        name === NEW_ASSESSMENT
          ? { breadcrumbs: newAssessmentCrumb }
          : undefined,
    };

    context.service.generateBreadcrumbItems({ name: SCAN }, route, {
      name: NEW_ASSESSMENT,
    });

    return context.service.breadcrumbItems.map((it) => it.title);
  }

  test('a page reached from a transient crumb starts from its own fallback crumbs', function (assert) {
    assert.deepEqual(trailFor(this, { isTransientCrumb: true }), [
      'Runs',
      'Scan',
    ]);
  });

  test('a page reached from a normal crumb keeps the earlier trail', function (assert) {
    assert.deepEqual(trailFor(this, { isTransientCrumb: false }), [
      'Runs',
      'New',
      'Scan',
    ]);
  });
});
