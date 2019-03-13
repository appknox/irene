import EmberRouter from '@ember/routing/router';
import config from './config/environment';
import ENV from 'irene/config/environment';
import $ from 'jquery';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

$('body').addClass('theme-' + ENV.whitelabel.theme);

Router.map(function() {
  this.route('freestyle');
  this.route('login');
  this.route('saml2', {path: '/saml2'}, function() {
    this.route('redirect', {path: '/redirect'});
  });
  if(ENV.isRegistrationEnabled) {
    this.route('register');
  }
  this.route('activate', {path: '/activate/:pk/:token'});
  this.route('recover');
  this.route('reset', {path: '/reset/:uuid/:token'});
  this.route('setup', {path: '/setup/:uuid/:token'});
  this.route('authenticated', {path: '/'}, function() {
    this.route("index", {path: '/'});
    this.route("organization", {path: '/organization'}, function() {
      this.route('namespaces', {path: '/namespaces'});
      this.route('members', {path: '/members'});
      this.route('teams', {path: '/teams'});
      this.route('team', {path: '/team/:teamid'});
      this.route('settings');
    });
    this.route("settings", {path: '/settings'}, function() {
      this.route('general');
      this.route('security');
      this.route('developersettings');
    });
    this.route("billing", {path: '/billing'});
    this.route('projects', {path: '/projects'});
    this.route("project", {path: '/project/:projectid'}, function() {
      this.route('settings');
      this.route('files');
    });
    this.route("file", {path: '/file/:fileid'});
    this.route("choose",{path: '/choose/:fileid'});
    this.route('compare', {path: '/compare/:files'});
    this.route('payment-success');
    this.route('payment-failure');
    this.route('security', function() {
      this.route('projects');
      this.route('downloadapp');
      this.route('purgeanalysis');
      this.route('files', {path: '/:projectid/files'});
      this.route('file', {path: '/file/:fileid'});
      this.route('analysis', {path: '/analysis/:analysisid'});
    });
    this.route('status');
  });
  this.route('invitation', {path: '/invitation/:uuid'});
  this.route('invite', {path: '/invite/:token'});

  // 404 path -this should be at the last.
  this.route('not-found', {path: '/*path'});
  this.route('status');
});

const CSBMap = {
  "authenticated.settings": {feature: "Account Settings", module: "Setup", product: "Appknox" },
  "authenticated.project.files": { feature: "All Scans", module: "Security", product: "Appknox" },
  "authenticated.choose": { feature: "Compare Scans", module: "Security", product: "Appknox" }
};


export { Router as default, CSBMap as CSBMap};
