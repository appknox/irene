import Application from '../../app';
import config from '../../config/environment';
import { merge } from '@ember/polyfills';

export default function startApp(attrs) {
  let attributes = merge({}, config.APP);
  attributes.autoboot = true;

  attributes = merge(attributes, attrs); // use defaults, but you can override;

  let application = Application.create(attributes);

  application.setupForTesting();
  application.injectTestHelpers();

  return application;
}
