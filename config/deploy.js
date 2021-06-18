module.exports = function (deployTarget) {
  const local_plugins = [
    'build',
    'gzip',
    'manifest',
    'display-revisions',
    'revision-data',
  ];
  var ENV = {
    build: {
      outputPath: 'build',
      environment: 'production',
    },
    gzip: {
      keep: true,
    },
  };
  ENV.s3 = {
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION,
  };

  ENV['s3-index'] = {
    bucket: process.env.AWS_BUCKET,
    region: process.env.AWS_REGION,
    allowOverwrite: true,
  };

  if (deployTarget === 'development') {
    ENV.build.environment = 'development';
  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'staging';
    ENV.s3 = {
      bucket: process.env.STAGING_AWS_BUCKET,
      region: process.env.AWS_REGION,
    };

    ENV['s3-index'] = {
      bucket: process.env.STAGING_AWS_BUCKET,
      region: process.env.AWS_REGION,
      allowOverwrite: true,
    };

    ENV.cloudfront = {
      distribution: 'E2YVUU4RPYNUI2',
      objectPaths: ['/*'],
    };
  }

  if (deployTarget === 'production') {
    ENV.s3 = {
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION,
    };

    ENV['s3-index'] = {
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION,
      allowOverwrite: true,
    };

    ENV.cloudfront = {
      distribution: 'E17GXVYW7G712O',
    };
  }

  if (deployTarget === 'local') {
    ENV.pipeline = {
      disabled: {
        allExcept: local_plugins,
      },
    };
  }

  if (deployTarget === 'server') {
    ENV.build.outputPath = 'staticserver/dist';
    ENV.pipeline = {
      disabled: {
        allExcept: local_plugins,
      },
    };
  }
  return ENV;
};
