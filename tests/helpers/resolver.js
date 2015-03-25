import Resolver from 'ember/resolver';
import ENV from 'irene/config/environment';

var resolver = Resolver.create();

resolver.namespace = {
  modulePrefix: ENV.modulePrefix,
  podModulePrefix: ENV.podModulePrefix
};

export default resolver;
