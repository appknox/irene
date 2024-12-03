import Controller from '@ember/controller';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { click, currentURL, visit } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

import AkBreadcrumbsRoute from 'irene/utils/ak-breadcrumbs-route';
import { setupRequiredEndpoints } from '../helpers/acceptance-utils';
import { doBreadcrumbItemsCompare } from '../helpers/breadcrumbs-utils';

// Creates Route Classes and Controllers
const createBCRoute = (modelData = null) =>
  class extends AkBreadcrumbsRoute {
    model(params) {
      return modelData ? modelData : params;
    }
  };

const createBCRouteCtrller = (breadcrumbs = {}, empty = false) =>
  empty
    ? class extends Controller {}
    : class extends Controller {
        get breadcrumbs() {
          return breadcrumbs;
        }
      };

// Resgiter a route and its controller and templates
function setupRoute(
  owner,
  { routeName, routeClass, controllerClass, template = null }
) {
  if (routeClass) {
    owner.register(`route:authenticated/${routeName}`, routeClass);
  }

  if (controllerClass) {
    owner.register(`controller:authenticated/${routeName}`, controllerClass);
  }

  if (template) {
    owner.register(`template:authenticated/${routeName}`, template);
  }
}

// Static crumb props
const ROOT_A_CRUMB = {
  title: 'Root A Route',
  route: 'authenticated.tr-a-root.index',
  routeGroup: 'root-a',
  isRootCrumb: true,
  stopCrumbGeneration: true,
};

const ROOT_B_CRUMB = {
  title: 'Root B Route',
  route: 'authenticated.tr-b-root.index',
  routeGroup: 'root-b',
  isRootCrumb: true,
  stopCrumbGeneration: true,
};

const ALL_ROUTE_CRUMB_PROPS = {
  // Roots
  'tr-a-root': ROOT_A_CRUMB,
  'tr-b-root': ROOT_B_CRUMB,

  // Parents
  'tr-a-root/parent-a': {
    title: 'Root A - Parent A Test Route',
    route: 'authenticated.tr-a-root.parent-a.index',
    routeGroup: 'root-a',
    parentCrumb: ROOT_A_CRUMB,
  },

  'tr-a-root/parent-b': {
    title: 'Parent B Test Route',
    route: 'authenticated.tr-a-root.parent-b.index',
    routeGroup: 'root-a',
    parentCrumb: ROOT_A_CRUMB,
  },

  'tr-b-root/parent-a': {
    title: 'Root B - Parent A Test Route',
    route: 'authenticated.tr-b-root.parent-a.index',
    routeGroup: 'root-b',
    parentCrumb: ROOT_B_CRUMB,
  },

  'tr-b-root/parent-with-model': {
    title: 'Root B - Parent With Model Test Route',
    route: 'authenticated.tr-b-root.parent-with-model',
    routeGroup: 'root-b',
    parentCrumb: ROOT_B_CRUMB,
  },

  // Children
  'tr-a-root/parent-a/child-a': {
    title: 'Parent A Child A Test Route',
    route: 'authenticated.tr-a-root.parent-a.child-a',
    routeGroup: 'root-a',

    parentCrumb: {
      title: 'Parent A Test Route',
      route: 'authenticated.tr-a-root.parent-a',
      routeGroup: 'root-a',
    },
  },

  'tr-a-root/parent-b/child-a': {
    title: 'Parent B Child A Test Route',
    route: 'authenticated.tr-a-root.parent-b.child-a',
    routeGroup: 'root-a',

    parentCrumb: {
      title: 'Parent B Test Route',
      route: 'authenticated.tr-a-root.parent-b',
      routeGroup: 'root-a',
    },
  },

  'tr-b-root/parent-with-model/child': {
    title: 'Root B - Parent With Mode - Child Test Route',
    route: 'authenticated.tr-b-root.parent-with-model.child',
    routeGroup: 'root-b',

    parentCrumb: {
      title: 'Root B - Parent With Model Test Route',
      route: 'authenticated.tr-b-root.parent-with-model',
      routeGroup: 'root-b',
    },
  },
};

// Test body
module('Acceptance | Breadcrumbs Test', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await setupRequiredEndpoints(this.server);

    // Clear breadcrumbs in local storage
    this.window = this.owner.lookup('service:browser/window');
    this.window.localStorage.removeItem('lastBreadcrumbsState');
  });

  test('forward navigation crumbs generation to registered routes (Root A -> Parent A -> Child A)', async function (assert) {
    assert.expect(25);

    const routesConfig = [
      {
        routeName: 'tr-a-root/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root']
        ),
      },
      {
        routeName: 'tr-a-root',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
        template: hbs`
          <AkStack @spacing="1" @direction="column" data-test-rootTemplate-container>
            Root A Route

            <AkDivider @color='dark' />
            
            <AkLink @route="authenticated.tr-a-root.parent-a" data-test-LinkToRootAParentA>
              Link to Parent A
            </AkLink>
          </AkStack>

          <AkDivider @color='dark' />

          {{outlet}}
        `,
      },
      {
        routeName: 'tr-a-root/parent-a/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a']
        ),
      },
      {
        routeName: 'tr-a-root/parent-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
            Root A - Parent A Route 

            <AkDivider @color='dark' />
            
            <AkLink @route="authenticated.tr-a-root.parent-a.child-a" data-test-LinkToRootAParentAChildA>
              Link to Child A
            </AkLink>
          </AkStack>

          {{outlet}}
        `,
      },
      {
        routeName: 'tr-a-root/parent-a/child-a/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a/child-a']
        ),
      },
      {
        routeName: 'tr-a-root/parent-a/child-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a/child-a']
        ),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
           Root A - Parent A - Child A Route

            <AkStack @spacing="1" @direction="column">
              Breadcrumb Items

              <AkBreadcrumbs::AutoTrail />
            </AkStack>
          </AkStack>
        `,
      },
    ];

    routesConfig.forEach((route) => setupRoute(this.owner, route));

    // Start of test
    await visit('/tr-a-root');

    let akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');
    let expectedBreadcrumbItems = [];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert
    );

    assert.dom('[data-test-LinkToRootAParentA]').exists();

    await click('[data-test-LinkToRootAParentA]');

    assert.strictEqual(
      currentURL(),
      '/tr-a-root/parent-a',
      'Route is at Parent A'
    );

    // Breadcrumbs should have updated
    akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    expectedBreadcrumbItems = [
      ...expectedBreadcrumbItems,
      ALL_ROUTE_CRUMB_PROPS['tr-a-root'],
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert,
      true
    );

    // Go to Child A
    assert.dom('[data-test-LinkToRootAParentAChildA]').exists();

    await click('[data-test-LinkToRootAParentAChildA]');

    assert.strictEqual(
      currentURL(),
      '/tr-a-root/parent-a/child-a',
      'Route is at Root A - Parent A - Child A '
    );

    // Breadcrumbs should have updated
    akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    expectedBreadcrumbItems = [
      ...expectedBreadcrumbItems,
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a/child-a'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert
    );
  });

  test('backward navigation generation from a registered route (Root A -> Parent B -> [Parent B - Child A] -> Parent B)', async function (assert) {
    assert.expect(50);

    const routesConfig = [
      {
        routeName: 'tr-a-root/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root']
        ),
      },
      {
        routeName: 'tr-a-root',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
        template: hbs`
          <AkStack @spacing="1" @direction="column" data-test-rootATemplate-container>
            Root A Route
    
            <AkDivider @color='dark' />
            
            <AkLink @route="authenticated.tr-a-root.parent-b" data-test-LinkToRootAParentB>
              Link to Parent B
            </AkLink>
          </AkStack>
    
          <AkDivider @color='dark' />
    
          {{outlet}}
        `,
      },
      {
        routeName: 'tr-a-root/parent-b/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b']
        ),
      },
      {
        routeName: 'tr-a-root/parent-b',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b']
        ),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
            Parent B Route
    
            <AkDivider @color='dark' />
    
            <AkStack @spacing="1" @direction="column">
              Parent B Route Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>
    
            <AkDivider @color='dark' />
    
            <AkLink @route="authenticated.tr-a-root.parent-b.child-a" data-test-LinkToRootAParentBChildA>
              Link to Parent B - Child A
            </AkLink>

            <AkLink @route="authenticated.tr-a-root.parent-a.child-a" data-test-LinkToRootAParentAChildA>
              Link to Parent A - Child A
            </AkLink>
    
            {{outlet}}
          </AkStack>
        `,
      },
      {
        routeName: 'tr-a-root/parent-b/child-a/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b/child-a']
        ),
      },
      {
        routeName: 'tr-a-root/parent-b/child-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b/child-a']
        ),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
            Parent B Child A Route
    
            <AkStack @spacing="1" @direction="column">
              Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>
    
            <AkDivider @color='dark' />
    
            <AkLink @route="authenticated.tr-a-root.parent-b" data-test-LinkToRootAParentB>
                Link to Parent B
            </AkLink>
          </AkStack>
        `,
      },
      {
        routeName: 'tr-a-root/parent-a/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a']
        ),
      },
      {
        routeName: 'tr-a-root/parent-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
            Root A - Parent A Route 

            <AkDivider @color='dark' />
            
            <AkLink @route="authenticated.tr-a-root.parent-a.child-a" data-test-LinkToRootAParentAChildA>
              Link to Child A
            </AkLink>
          </AkStack>

          {{outlet}}
        `,
      },
      {
        routeName: 'tr-a-root/parent-a/child-a/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a/child-a']
        ),
      },
      {
        routeName: 'tr-a-root/parent-a/child-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a/child-a']
        ),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
           Root A - Parent A - Child A Route

            <AkStack @spacing="1" @direction="column">
              Breadcrumb Items

              <AkBreadcrumbs::AutoTrail />
            </AkStack>
          </AkStack>
        `,
      },
    ];

    routesConfig.forEach((route) => setupRoute(this.owner, route));

    // Start of test
    await visit('/tr-a-root');

    let akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');
    let expectedBreadcrumbItems = [];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert
    );

    assert.dom('[data-test-LinkToRootAParentB]').exists();

    // Go to Parent B
    await click('[data-test-LinkToRootAParentB]');

    assert.strictEqual(
      currentURL(),
      '/tr-a-root/parent-b',
      'Route is at Parent B'
    );

    // Breadcrumbs should have updated
    akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    expectedBreadcrumbItems = [
      ...expectedBreadcrumbItems,
      ALL_ROUTE_CRUMB_PROPS['tr-a-root'],
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert,
      true
    );

    // Go to Parent B - Child A
    assert.dom('[data-test-LinkToRootAParentBChildA]').exists();

    await click('[data-test-LinkToRootAParentBChildA]');

    assert.strictEqual(
      currentURL(),
      '/tr-a-root/parent-b/child-a',
      'Route is Parent B - Child A'
    );

    akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    expectedBreadcrumbItems = [
      ...expectedBreadcrumbItems,
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b/child-a'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert
    );

    assert.dom('[data-test-LinkToRootAParentB]').exists();

    // Go back to Parent B
    await click('[data-test-LinkToRootAParentB]');

    assert.strictEqual(
      currentURL(),
      '/tr-a-root/parent-b',
      'Route is Parent B'
    );

    akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');
    expectedBreadcrumbItems = expectedBreadcrumbItems.slice(0, -1);

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert
    );

    assert.dom('[data-test-LinkToRootAParentAChildA]').exists();

    // Go back to Parent A Child A
    await click('[data-test-LinkToRootAParentAChildA]');

    expectedBreadcrumbItems = [
      ...expectedBreadcrumbItems,
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-a/child-a'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedBreadcrumbItems,
      assert
    );
  });

  test('resets breadcrumbs when navigating to a root route ([Root A - Parent B - Child A] -> Root A)', async function (assert) {
    assert.expect(16);

    const fallbackCrumbs = [
      ALL_ROUTE_CRUMB_PROPS['tr-a-root'],
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b'],
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b/child-a'],
    ];

    // Register routes to be tested
    const routesConfig = [
      {
        routeName: 'tr-a-root/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root']
        ),
      },
      {
        routeName: 'tr-a-root',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
        template: hbs`
          <AkStack @spacing="1" @direction="column" data-test-rootTemplate-container>
            Root A Route
          </AkStack>
    
          {{outlet}}
        `,
      },
      {
        routeName: 'tr-a-root/parent-b/child-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({
          ...ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b/child-a'],
          fallbackCrumbs,
        }),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
            Parent B Child A Route
    
            <AkStack @spacing="1" @direction="column">
              Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>
    
            <AkDivider @color='dark' />
    
            <AkLink @route="authenticated.tr-a-root" data-test-LinkToRootA>
                Link to Root A
            </AkLink>
          </AkStack>
        `,
      },
    ];

    routesConfig.forEach((route) => setupRoute(this.owner, route));

    // Start of test
    await visit('/tr-a-root/parent-b/child-a');

    assert.strictEqual(
      currentURL(),
      '/tr-a-root/parent-b/child-a',
      'Route is Parent B - Child A'
    );

    let akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      fallbackCrumbs,
      assert
    );

    // Go to Parent B - Child A
    assert.dom('[data-test-LinkToRootA]').exists();

    await click('[data-test-LinkToRootA]');

    // Breadcrumbs should be reset
    akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    doBreadcrumbItemsCompare(akBreadcrumbsService.breadcrumbItems, [], assert);
  });

  test('It restores fallback crumbs when visiting a registered route without prior in app navigation to that route ([Root A - Parent B - Child A] )', async function (assert) {
    assert.expect(14);

    const fallbackCrumbs = [
      ALL_ROUTE_CRUMB_PROPS['tr-a-root'],
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b'],
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b/child-a'],
    ];

    // Register routes to be tested
    const routesConfig = [
      {
        routeName: 'tr-a-root/parent-b/child-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({
          ...ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b/child-a'],
          fallbackCrumbs,
        }),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
            Parent B Child A Route
    
            <AkStack @spacing="1" @direction="column">
              Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>
    
            <AkDivider @color='dark' />
    
            <AkLink @route="authenticated.tr-a-root.parent-b" data-test-LinkToParentB>
                Link to Parent B
            </AkLink>
          </AkStack>
        `,
      },
    ];

    routesConfig.forEach((route) => setupRoute(this.owner, route));

    // Start of test
    await visit('/tr-a-root/parent-b/child-a');

    assert.strictEqual(
      currentURL(),
      '/tr-a-root/parent-b/child-a',
      'Route is Parent B - Child A'
    );

    const akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      fallbackCrumbs,
      assert
    );
  });

  test('It defaults to route fallback crumbs when switching between route groups', async function (assert) {
    assert.expect(19);

    // Register routes to be tested
    const routesConfig = [
      {
        routeName: 'tr-a-root/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root']
        ),
      },
      {
        routeName: 'tr-a-root',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
      },
      {
        routeName: 'tr-a-root/parent-b/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b']
        ),
      },
      {
        routeName: 'tr-a-root/parent-b',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b']
        ),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootAParentBTemplate-container>
            Root A - Parent B Route
    
            <AkDivider @color='dark' />
    
            <AkStack @spacing="1" @direction="column">
              Parent B Route Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>
          </AkStack>
        `,
      },
      {
        routeName: 'tr-b-root/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-b-root']
        ),
      },
      {
        routeName: 'tr-b-root',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
      },
      {
        routeName: 'tr-b-root/parent-a/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-a']
        ),
      },
      {
        routeName: 'tr-b-root/parent-a',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-a']
        ),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootTemplate-container>
            Root B - Parent A Route
    
            <AkDivider @color='dark' />
    
            <AkStack @spacing="1" @direction="column">
              Parent B Route Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>
    
            <AkDivider @color='dark' />
    
            <AkLink @route="authenticated.tr-a-root.parent-b" data-test-LinkToRootAParentB>
              Link to Root A - Parent B 
            </AkLink>
          </AkStack>
        `,
      },
    ];

    routesConfig.forEach((route) => setupRoute(this.owner, route));

    // Start of test
    await visit('/tr-b-root/parent-a');

    assert.strictEqual(
      currentURL(),
      '/tr-b-root/parent-a',
      'Route is Root B - Parent A'
    );

    let akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    let expectedCrumbs = [
      ALL_ROUTE_CRUMB_PROPS['tr-b-root'],
      ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-a'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedCrumbs,
      assert
    );

    await click('[data-test-LinkToRootAParentB]');

    // Breadcrumbs should recompute to root-a routes
    akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    expectedCrumbs = [
      ALL_ROUTE_CRUMB_PROPS['tr-a-root'],
      ALL_ROUTE_CRUMB_PROPS['tr-a-root/parent-b'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedCrumbs,
      assert
    );
  });

  test('It recalculates breadcrumbs if visiting existing route in crumbs but with different models', async function (assert) {
    assert.expect(35);

    const parentWithModelRouteFallbackCrumbs = (id) => [
      ALL_ROUTE_CRUMB_PROPS['tr-b-root'],
      { ...ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-with-model'], models: [id] },
    ];

    class ParentWithModelController extends Controller {
      get breadcrumbs() {
        return {
          ...ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-with-model'],
          models: [this.model.id],
          fallbackCrumbs: parentWithModelRouteFallbackCrumbs(this.model.id),
        };
      }
    }

    // Register routes to be tested
    const routesConfig = [
      {
        routeName: 'tr-b-root/index',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-b-root']
        ),
      },
      {
        routeName: 'tr-b-root',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller({}, true),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2" data-test-rootBTemplate-container>
            Root B

            <AkLink @route="authenticated.tr-b-root.parent-with-model" @model={{"1"}} data-test-linkToRootBParentWithModel1>
              Link to Root B - Parent With Model 1
            </AkLink>

            <AkLink @route="authenticated.tr-b-root.parent-with-model" @models={{array 2}} data-test-linkToRootBParentWithModel2>
              Link to Root B - Parent With Model 2
            </AkLink>

            {{outlet}}
          </AkStack>
        `,
      },
      {
        routeName: 'tr-b-root/parent-with-model',
        routeClass: createBCRoute(),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2 my-2" data-test-rootAParentBTemplate-container>
            Root B - Parent With Model - {{@model.id}}
    
            <AkDivider @color='dark' />
    
            <AkStack @spacing="1" @direction="column">
              Parent With Model ({{@model.id}}) - Route Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>

            <AkLink @route="authenticated.tr-b-root.parent-with-model.child" @models={{array 2}} data-test-linkToRootBParentWithModel2>
              Parent With Model ({{@model.id}}) Child
            </AkLink>

            {{outlet}}
          </AkStack>

        `,
      },
      {
        routeName: 'tr-b-root/parent-with-model',
        routeClass: createBCRoute(),
        controllerClass: ParentWithModelController,
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2 my-2" data-test-rootAParentBTemplate-container>
            Root B - Parent With Model - {{@model.id}}
    
            <AkDivider @color='dark' />
    
            <AkStack @spacing="1" @direction="column">
              Parent With Model ({{@model.id}}) - Route Breadcrumb Items
    
              <AkBreadcrumbs::AutoTrail />
            </AkStack>

            <AkLink @route="authenticated.tr-b-root.parent-with-model.child" @models={{array @model.id}} data-test-LinkToRootBParentWithModelChild>
              Link to Parent With Model ({{@model.id}}) Child
            </AkLink>

            {{outlet}}
          </AkStack>

        `,
      },
      {
        routeName: 'tr-b-root/parent-with-model/child',
        routeClass: createBCRoute(),
        controllerClass: createBCRouteCtrller(
          ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-with-model/child']
        ),
        template: hbs`
          <AkStack @spacing="1" @direction="column" class="px-2 my-2" data-test-rootAParentBTemplate-container>
            Root B - Parent With Model - Child {{@model.id}}
          </AkStack>
        `,
      },
    ];

    routesConfig.forEach((route) => setupRoute(this.owner, route));

    // Start of test
    await visit('/tr-b-root');

    assert.strictEqual(currentURL(), '/tr-b-root', 'Route is at Root B');

    assert.dom('[data-test-linkToRootBParentWithModel1]').exists();
    assert.dom('[data-test-linkToRootBParentWithModel2]').exists();

    // Go to route with model with ID of 1
    await click('[data-test-linkToRootBParentWithModel1]');

    let akBreadcrumbsService = this.owner.lookup('service:ak-breadcrumbs');

    let expectedCrumbs = [
      ALL_ROUTE_CRUMB_PROPS['tr-b-root'],
      {
        ...ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-with-model'],
        models: [1],
      },
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedCrumbs,
      assert
    );

    // Go to child route with model with ID of 1
    await click('[data-test-LinkToRootBParentWithModelChild]');

    expectedCrumbs = [
      ...expectedCrumbs,
      ALL_ROUTE_CRUMB_PROPS['tr-b-root/parent-with-model/child'],
    ];

    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      expectedCrumbs,
      assert
    );

    assert.dom('[data-test-linkToRootBParentWithModel2]').exists();

    // Go to back to parent route with model with ID of 2
    await click('[data-test-linkToRootBParentWithModel2]');

    // Defaults to fallback crumbs
    doBreadcrumbItemsCompare(
      akBreadcrumbsService.breadcrumbItems,
      parentWithModelRouteFallbackCrumbs(2),
      assert
    );
  });
});
