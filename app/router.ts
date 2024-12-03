import EmberRouter from '@ember/routing/router';
import ENV from 'irene/config/environment';
import config from './config/environment';

type RouterLocationType = 'history' | 'hash' | 'none' | 'auto';

export default class Router extends EmberRouter {
  location = config.locationType as RouterLocationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');

  this.route('saml2', function () {
    this.route('redirect');
  });

  this.route('oidc', { path: 'dashboard/oidc' }, function () {
    this.route('redirect');
    this.route('authorize');
  });

  this.route('register');

  this.route('register-via-invite', {
    path: 'register-via-invite/:token',
  });

  this.route('recover');

  this.route('reset', {
    path: '/reset/:token',
  });

  this.route(
    'authenticated',
    {
      path: '/',
    },
    function () {
      /*
       * DO NOT REMOVE!. For Test purposes
       * Ref: tests/acceptance/breadcrumbs-test.js
       * ============ START ===============
       */
      this.route('tr-a-root', function () {
        this.route('parent-a', function () {
          this.route('child-a');
          this.route('child-b');
        });

        this.route('parent-b', function () {
          this.route('child-a');
        });
      });

      this.route('tr-b-root', function () {
        this.route('parent-a', function () {
          this.route('child-a');
        });

        this.route(
          'parent-with-model',
          { path: '/parent-with-model/:id' },
          function () {
            this.route('child');
          }
        );
      });

      // ============ END ===============

      this.route('index', {
        path: '/',
      });

      this.route('home', { path: '/dashboard/home' });

      this.route('organization', function () {
        this.route('namespaces');
        this.route('users');
        this.route('teams');
      });

      this.route('organization-settings', { path: '/organization/settings' });

      this.route('account-settings', { path: '/settings' }, function () {
        this.route('general');
        this.route('security');
        this.route('developersettings');
      });

      this.route('billing');
      this.route('marketplace');
      this.route('projects');

      this.route(
        'project',
        {
          path: '/project/:projectid',
        },
        function () {
          this.route('settings', function () {
            this.route('analysis');

            this.route('dast-automation-scenario', {
              path: '/dast-automation-scenario/:scenario_id',
            });
          });

          this.route('files');
        }
      );

      this.route('file', { path: '/file/:fileid' });

      this.route('choose', {
        path: '/choose/:fileid',
      });

      this.route('payment-success');
      this.route('payment-failure');

      this.route('security', function () {
        this.route('projects');
        this.route('downloadapp');
        this.route('purgeanalysis');

        this.route('files', {
          path: '/:projectid/files',
        });

        this.route('file', {
          path: '/file/:fileid',
        });

        this.route('analysis', {
          path: '/analysis/:analysisid',
        });
      });

      this.route('analytics');

      this.route('github-cloud', function () {
        this.route('redirect');
      });

      this.route('partner', function () {
        this.route('clients', function () {
          this.route('overview');
          this.route('invitations');
          this.route('registration-requests');
        });

        this.route('client', {
          path: '/clients/:id',
        });

        this.route('project', {
          path: '/clients/:client_id/projects/:project_id',
        });

        this.route('analytics');
      });

      // Appknox routes
      this.route('dashboard', function () {
        this.route('projects');

        this.route(
          'project',
          {
            path: '/project/:projectid',
          },
          function () {
            this.route('settings', function () {
              this.route('analysis');

              this.route('dast-automation-scenario', {
                path: '/dast-automation-scenario/:scenario_id',
              });
            });

            this.route('files');
          }
        );

        this.route('file', { path: '/file/:fileid' }, function () {
          this.route('api-scan', function () {
            this.route('index', { path: '/' });
            this.route('results');
          });

          this.route('manual-scan', function () {
            this.route('index', { path: '/' });
            this.route('results');
          });

          this.route('analysis', { path: '/analysis/:analysis_id' });

          this.route('static-scan');

          this.route('dynamic-scan', function () {
            this.route('manual');
            // this.route('automated');
            this.route('results');
          });
        });

        this.route('choose', {
          path: '/choose/:fileid',
        });

        this.route('notifications');

        this.route('billing');

        this.route('account-settings', { path: '/settings' }, function () {
          this.route('general');
          this.route('security');
          this.route('developersettings');
        });

        this.route(
          'app-monitoring',
          { path: '/store-monitoring' },
          function () {
            this.route(
              'monitoring-details',
              { path: '/monitoring-details/:am_app_id' },
              function () {
                this.route('history');
              }
            );
          }
        );

        this.route('marketplace');

        this.route('analytics');

        this.route('sbom', function () {
          this.route('apps');

          this.route('app-scans', {
            path: 'apps/:sbom_project_id/scans',
          });

          this.route('scan-details', {
            path: 'apps/:sbom_project_id/scans/:sbom_file_id',
          });

          this.route('component-details', {
            path: 'apps/:sbom_project_id/scans/:sbom_file_id/components/:sbom_component_id',
          });
        });

        this.route(
          'compare',
          {
            path: '/compare/:files',
          },
          function () {
            this.route('new-issues');
            this.route('untested-cases');
            this.route('resolved-test-cases');
          }
        );

        this.route('file-vul-compare', {
          path: '/file-vul-compare/:files/:vulnerability_id',
        });

        this.route('organization', function () {
          this.route('namespaces');
          this.route('users');
          this.route('teams');
        });

        this.route(
          'organization-settings',
          { path: '/organization/settings' },
          function () {
            this.route('index', { path: '/' });
            this.route('service-account');
          }
        );

        this.route('service-account-details', {
          path: '/organization/settings/service-account/:id',
        });

        this.route('service-account-create', {
          path: '/organization/settings/service-account/create',
        });

        this.route('public-api', function () {
          this.route('docs');
        });
      });

      // Storeknox routes
      this.route('storeknox', { path: '/dashboard/storeknox' }, function () {
        this.route('index', { path: '/' });

        this.route('discover', function () {
          this.route('result');
          this.route('requested');
          this.route('review');
        });

        this.route('inventory');
      });
    }
  );

  this.route('invitation', {
    path: '/invitation/:uuid',
  });

  this.route('invite', {
    path: '/invite/:token',
  });

  // 404 path -this should be at the last.
  this.route('not-found', {
    path: '/*path',
  });

  this.route('status', { path: 'dashboard/status' });

  this.route('old-status', { path: 'status' });
});

export const CSBMap = {
  'authenticated.dashboard.analytics': ENV.csb['navigateToAnalytics'],
  'authenticated.dashboard.projects': ENV.csb['navigateToProjects'],
  'authenticated.dashboard.file': ENV.csb['clickProjectCard'],
  'authenticated.dashboard.settings': ENV.csb['navigateToSettings'],
  'authenticated.dashboard.project.files': ENV.csb['navigateToAllScans'],
  'authenticated.dashboard.choose': ENV.csb['naigateToCompareScans'],
  'authenticated.dashboard.organization.namespaces':
    ENV.csb['navigateToOrganization'],
  'authenticated.dashboard.organization-settings':
    ENV.csb['navigateToOrgSettings'],
  'authenticated.dashboard.marketplace': ENV.csb['navigateToMarketPlace'],
  'authenticated.dashboard.account-settings.index':
    ENV.csb['navigateToAccountSettings'],
  'authenticated.dashboard.billing': ENV.csb['navigateToBilling'],
};
