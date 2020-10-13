module.exports = function(deployTarget) {
  const local_plugins = [
    'build',
    'gzip',
    'manifest',
    'display-revisions',
    'revision-data'
  ]
  var ENV = {
    build: {
      outputPath: 'build',
      environment: 'production'
    },
    gzip: {
      keep: true
    }
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

  }

  if (deployTarget === 'staging') {
    ENV.build.environment = 'staging';
    ENV.s3 = {
      bucket: process.env.STAGING_AWS_BUCKET,
      region: process.env.AWS_REGION
    };

    ENV['s3-index'] = {
      bucket: process.env.STAGING_AWS_BUCKET,
      region: process.env.AWS_REGION,
      allowOverwrite: true
    };

    ENV.cloudfront = {
      distribution: 'E2YVUU4RPYNUI2',
      objectPaths: ['/*']
    };
  }

  if (deployTarget === 'production') {
    ENV.s3 = {
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION
    };

    ENV['s3-index'] = {
      bucket: process.env.AWS_BUCKET,
      region: process.env.AWS_REGION,
      allowOverwrite: true
    };

    ENV.cloudfront = {
      distribution: 'E17GXVYW7G712O'
    };
  }

  if (deployTarget === 'sequelstring') {
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

    ENV.cloudfront = {
      distribution: 'E1R9ZLGFEM1TTU'
    };
  }

  if (deployTarget === 'gbm') {
    process.env["ENTERPRISE"] = true
    process.env["WHITELABEL_ENABLED"] = true
    process.env["WHITELABEL_LOGO"] = "https://appknox-production-public.s3.amazonaws.com/gbm_logo1.png"
    process.env["WHITELABEL_NAME"] = "GBM"
    process.env["WHITELABEL_THEME"] = "light"

    ENV.s3 = {
      bucket: process.env.GBM_AWS_BUCKET,
      region: process.env.AWS_REGION
    };

    ENV['s3-index'] = {
      bucket: process.env.GBM_AWS_BUCKET,
      region: process.env.AWS_REGION,
      allowOverwrite: true
    };

    ENV.cloudfront = {
      distribution: 'E1R9ZLGFEM1TTU'
    };
  }

  if (deployTarget === 'local') {
    ENV.pipeline =  {
      disabled: {
        allExcept: local_plugins
      },
    };
  }
  if (deployTarget === 'server') {
    ENV.build.outputPath = 'staticserver/dist';
    ENV.pipeline =  {
      disabled: {
        allExcept: local_plugins
      },
    };
  }
  return ENV;
};
