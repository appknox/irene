/* jshint node: true */

module.exports = function(deployTarget) {
  var ENV = {
    build: {}
    // include other plugin configuration that applies to all deploy targets here
  };
  ENV.s3 = {
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION
  };

  ENV['s3-index'] = {
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION,
    allowOverwrite: true
  };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
    // configure other plugins for development deploy target here
  }

  if (deployTarget === 'staging') {
    ENV.s3 = {
      bucket: process.env.STAGING_AWS_BUCKET,
      region: process.env.AWS_REGION
    };

    ENV['s3-index'] = {
      bucket: process.env.STAGING_AWS_BUCKET,
      region: process.env.AWS_REGION,
      allowOverwrite: true
    };

    ENV.build.environment = 'staging';

    // configure other plugins for staging deploy target here

    ENV.cloudfront = {
      distribution: 'E2YVUU4RPYNUI2',
      objectPaths: ['/*']
    };
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    // configure other plugins for production deploy target here

    ENV.cloudfront = {
      distribution: 'E17GXVYW7G712O'
    };
  }

  if (deployTarget === 'whitelabel') {
    ENV.build.environment = 'whitelabel';
    // configure other plugins for production deploy target here

    ENV.cloudfront = {
      distribution: 'E1SR2PB8XTR9RC',
      objectPaths: ['/*']
    };
  }

  if (deployTarget === 'sequelstring') {
    ENV.build.environment = 'sequelstring';

    process.env["ENTERPRISE"] = true
    process.env["WHITELABEL_ENABLED"] = true
    process.env["WHITELABEL_LOGO"] = "https://s3.amazonaws.com/appknox-production-public/sequelstring_logo.jpg"
    process.env["WHITELABEL_NAME"] = "Sequelstring Solutions"
    process.env["WHITELABEL_THEME"] = "light"

    ENV.s3 = {
      bucket: process.env.SEQUELSTRING_AWS_BUCKET,
      region: process.env.AWS_REGION
    };

    ENV['s3-index'] = {
      bucket: process.env.SEQUELSTRING_AWS_BUCKET,
      region: process.env.AWS_REGION,
      allowOverwrite: true
    };

    // configure other plugins for production deploy target here

    ENV.cloudfront = {
      distribution: 'E1R9ZLGFEM1TTU'
    };
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
