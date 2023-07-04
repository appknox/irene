import EmberRouter from '@ember/routing/router';
import ENV from 'irene/config/environment';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('login');
  this.route('saml2', function () {
    this.route('redirect');
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
      this.route('index', {
        path: '/',
      });

      this.route('organization', function () {
        this.route('namespaces');
        this.route('users');
        this.route('teams');
      });

      this.route('organization-settings', { path: '/organization/settings' });

      this.route('settings', function () {
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
          this.route('settings');
          this.route('files');
        }
      );

      this.route('file', { path: '/file/:fileid' });

      this.route('choose', {
        path: '/choose/:fileid',
      });
      this.route('compare', {
        path: '/compare/:files',
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

      this.route('dashboard', function () {
        this.route('file', { path: '/file/:fileid' }, function () {
          this.route('analysis', { path: '/analysis/:analysis_id' });
        });

        this.route('notifications');

        this.route(
          'app-monitoring',
          { path: '/store-monitoring' },
          function () {
            this.route(
              'monitoring-details',
              { path: '/monitoring-details/:am_app_id' },
              function () {}
            );
          }
        );

        this.route('sbom', function () {
          this.route('apps');

          this.route('app-scans', {
            path: 'apps/:sbom_project_id/scans',
          });

          this.route('scan-details', {
            path: 'apps/:sbom_project_id/scans/:sbom_file_id',
          });
        });
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
  this.route('status');
});

export const CSBMap = {
  'authenticated.projects': ENV.csb.navigateToProjects,
  'authenticated.analytics': ENV.csb.navigateToAnalytics,
  'authenticated.dashboard.file': ENV.csb.clickProjectCard,
  'authenticated.settings': ENV.csb.navigateToSettings,
  'authenticated.project.files': ENV.csb.navigateToAllScans,
  'authenticated.choose': ENV.csb.naigateToCompareScans,
  'authenticated.organization.namespaces': ENV.csb.navigateToOrganization,
  'authenticated.organization-settings': ENV.csb.navigateToOrgSettings,
  'authenticated.settings.index': ENV.csb.navigateToAccountSettings,
  'authenticated.marketplace': ENV.csb.navigateToMarketPlace,
  'authenticated.billing': ENV.csb.navigateToBilling,
};
