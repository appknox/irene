/**
 * Type declarations for
 *    import config from 'irene/config/environment'
 */
declare const config: {
  ENVHandlerCONST: ENVHandlerCONST;
  productVersions: ProductVersions;
  version: number;
  isDevknox: boolean;
  isAppknox: boolean;
  isEnterprise: boolean;
  ireneHost: string;
  showLicense: boolean;
  exportApplicationGlobal: boolean;
  devknoxPrice: number;
  platform: string;
  paginate: Paginate;
  'ember-websockets': EmberWebsockets;
  pace: Pace;
  rootURL: string;
  favicon: string;
  locationType: string;
  modulePrefix: string;
  environment: string;
  enableHotjar: boolean;
  enablePendo: boolean;
  enableCSB: boolean;
  enableMarketplace: boolean;
  emberRollbarClient: EmberRollbarClient;
  notifications: Notifications;
  deviceFarmPassword: string;
  namespace: string;
  namespace_v2: string;
  host: string;
  'ember-cli-mirage': EmberCLIMirage;
  emblemOptions: EmblemOptions;
  EmberENV: EmberENV;
  APP: App;
  'ember-simple-auth': EmberSimpleAuth;
  endpoints: { [key: string]: string };
  csb: { [key: string]: Csb };
  whitelabel: Whitelabel;
  gReCaptcha: GReCAPTCHA;
  'ember-modal-dialog': object;
  product: number;
  iconifyProviderName: string;
};

export interface App {
  name: string;
  version: string;
  API_HOST: string;
  API_NAMESPACE: string;
  API_ADD_TRAILING_SLASHES: boolean;
}

export interface ENVHandlerCONST {
  possibleENVS: string[];
  defaults: Defaults;
  processENV: ProcessENV;
}

export interface Defaults {
  IRENE_API_HOST: string;
  IRENE_ICON_API_HOST: string;
  IRENE_SHOW_LICENSE: boolean;
  IRENE_ENABLE_HOTJAR: boolean;
  IRENE_ENABLE_PENDO: boolean;
  IRENE_ENABLE_CSB: boolean;
  IRENE_ENABLE_MARKETPLACE: boolean;
  IRENE_ENABLE_ROLLBAR: boolean;
  ENTERPRISE: boolean;
  WHITELABEL_ENABLED: boolean;
  WHITELABEL_NAME: string;
  WHITELABEL_LOGO: string;
  WHITELABEL_THEME: string;
}

export interface ProcessENV {
  IRENE_ENABLE_ROLLBAR: string;
  IRENE_ENABLE_PENDO: string;
  IRENE_ENABLE_HOTJAR: string;
  IRENE_ENABLE_MARKETPLACE: string;
}

export interface EmberENV {
  FEATURES: object;
  _APPLICATION_TEMPLATE_WRAPPER: boolean;
  _DEFAULT_ASYNC_OBSERVERS: boolean;
  _JQUERY_INTEGRATION: boolean;
  _TEMPLATE_ONLY_GLIMMER_COMPONENTS: boolean;
}

export interface Csb {
  feature: string;
  module: Module;
  product: Product;
}

export enum Module {
  Navigation = 'Navigation',
  Organization = 'Organization',
  Projects = 'Projects',
  Report = 'Report',
  Security = 'Security',
  Setup = 'Setup',
}

export enum Product {
  Appknox = 'Appknox',
}

export interface EmberCLIMirage {
  enabled: boolean;
  usingProxy: boolean;
  useDefaultPassthroughs: boolean;
}

export interface EmberSimpleAuth {
  authenticationRoute: string;
  loginEndPoint: string;
  checkEndPoint: string;
  logoutEndPoint: string;
  routeAfterAuthentication: string;
  routeIfAlreadyAuthenticated: string;
  rootURL: string;
}

export interface EmberWebsockets {
  socketIO: boolean;
}

export interface EmberRollbarClient {
  enabled: boolean;
}

export interface EmblemOptions {
  blueprints: boolean;
}

export interface GReCAPTCHA {
  jsUrl: string;
  siteKey: string;
}

export interface Notifications {
  autoClear: boolean;
  duration: number;
}

export interface Pace {
  theme: string;
  color: string;
  catchupTime: number;
  initialRate: number;
  minTime: number;
  ghostTime: number;
  maxProgressPerFrame: number;
  easeFactor: number;
  startOnPageLoad: boolean;
  restartOnPushState: boolean;
  restartOnRequestAfter: number;
  target: string;
  elements: Elements;
  eventLag: EventLag;
  ajax: Ajax;
}

export interface Ajax {
  trackMethods: string[];
  trackWebSockets: boolean;
  ignoreURLs: string[];
}

export interface Elements {
  checkInterval: number;
  selectors: string[];
}

export interface EventLag {
  minSamples: number;
  sampleCount: number;
  lagThreshold: number;
}

export interface Paginate {
  perPageLimit: number;
  pagePadding: number;
  offsetMultiplier: number;
}

export interface ProductVersions {
  appknox: string;
  storeknox: string;
}

export interface Whitelabel {
  theme: string;
  enabled: boolean;
}

export default config;
