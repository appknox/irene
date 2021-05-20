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
  this.route('saml2', function () {
    this.route('redirect');
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
    this.route("organization", function () {
      this.route('namespaces');
      this.route('members');
      this.route('teams');
      this.route('team', {
        path: '/team/:teamid'
      });
      this.route('settings');
    });
    this.route("settings", function () {
      this.route('general');
      this.route('security');
      this.route('developersettings');
    });
    this.route("billing");
    this.route("marketplace");
    this.route('projects');
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
        path: '/client/:id'
      });
    });
  });
  this.route('invitation', {
    path: '/invitation/:uuid'
  });
  this.route('invite', {
    path: '/invite/:token'
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
