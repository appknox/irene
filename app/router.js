import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import ENV from 'irene/config/environment';
import $ from 'jquery';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

$('body').addClass('theme-' + ENV.whitelabel.theme);

Router.map(function () {
  this.route('login');
  this.route('saml2', {
    path: '/saml2'
  }, function () {
    this.route('redirect', {
      path: '/redirect'
    });
  });
  if (ENV.isRegistrationEnabled || ENV.registrationLink) {
    this.route('register');
  }
  this.route('register-via-invite', {
    path: 'register-via-invite/:token'
  });
  this.route('activate', {
    path: '/activate/:pk/:token'
  });
  this.route('recover');
  this.route('reset', {
    path: '/reset/:token'
  });
  this.route('authenticated', {
    path: '/'
  }, function () {
    this.route("index", {
      path: '/'
    });
    this.route("organization", {
      path: '/organization'
    }, function () {
      this.route('namespaces', {
        path: '/namespaces'
      });
      this.route('members', {
        path: '/members'
      });
      this.route('teams', {
        path: '/teams'
      });
      this.route('team', {
        path: '/team/:teamid'
      });
      this.route('settings');
    });
    this.route("settings", {
      path: '/settings'
    }, function () {
      this.route('general');
      this.route('security');
      this.route('developersettings');
    });
    this.route("billing", {
      path: '/billing'
    });
    this.route("marketplace", {
      path: '/marketplace'
    });
    this.route('projects', {
      path: '/projects'
    });
    this.route("project", {
      path: '/project/:projectid'
    }, function () {
      this.route('settings');
      this.route('files');
    });
    this.route("file", {
      path: '/file/:fileid'
    });
    this.route("choose", {
      path: '/choose/:fileid'
    });
    this.route('compare', {
      path: '/compare/:files'
    });
    this.route('payment-success');
    this.route('payment-failure');
    this.route('security', function () {
      this.route('projects');
      this.route('downloadapp');
      this.route('purgeanalysis');
      this.route('files', {
        path: '/:projectid/files'
      });
      this.route('file', {
        path: '/file/:fileid'
      });
      this.route('analysis', {
        path: '/analysis/:analysisid'
      });
    });
    this.route('status');
    this.route('analytics');

    this.route('github-cloud', function () {
      this.route('redirect');
    });
    this.route('partner');
    this.route('client', {
      path: '/client/:client_id'
    });
  });

  this.route('partner', {
    path: 'dummy-partner'
  });
  this.route('client', {
    path: '/dummy-client/:client_id'
  });
  this.route('invitation', {
    path: '/invitation/:uuid'
  });
  this.route('invite', {
    path: '/invite/:token'
  });
  this.route('partner-client-registration', {
    path: '/partner-client-registration/:token'
  });

  // 404 path -this should be at the last.
  this.route('not-found', {
    path: '/*path'
  });
  this.route('status');
});

const CSBMap = {
  "authenticated.projects": ENV.csb.navigateToProjects,
  "authenticated.analytics": ENV.csb.navigateToAnalytics,
  "authenticated.file": ENV.csb.clickProjectCard,
  "authenticated.settings": ENV.csb.navigateToSettings,
  "authenticated.project.files": ENV.csb.navigateToAllScans,
  "authenticated.choose": ENV.csb.naigateToCompareScans,
  "authenticated.organization.namespaces": ENV.csb.navigateToOrganization,
  "authenticated.organization.settings": ENV.csb.navigateToOrgSettings,
  "authenticated.settings.index": ENV.csb.navigateToAccountSettings,
  "authenticated.marketplace": ENV.csb.navigateToMarketPlace,
  "authenticated.billing": ENV.csb.navigateToBilling
};


export {
  Router as
  default, CSBMap as CSBMap
};
