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
    ENV.build.environment = 'staging';
    // configure other plugins for staging deploy target here

    ENV.cloudfront = {
      distribution: 'E2YVUU4RPYNUI2',
      objectPaths: ['/*']
    }
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    // configure other plugins for production deploy target here

    ENV.cloudfront = {
      distribution: 'E1SR2PB8XTR9RC'
    }
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
