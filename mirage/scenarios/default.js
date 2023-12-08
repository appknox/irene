/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function (server) {
  var userCount = getRandomInt(3, 5),
    pricingCount = getRandomInt(3, 3),
    planCount = getRandomInt(3, 3),
    subscriptionCount = getRandomInt(1, 1),
    analyticsCount = getRandomInt(1, 1),
    vulnerabilityCount = getRandomInt(5, 15),
    submissionCount = getRandomInt(3, 3),
    personalTokenCount = getRandomInt(3, 3),
    invitationCount = getRandomInt(1, 1),
    availableDeviceCount = getRandomInt(3, 3),
    organizationCount = getRandomInt(1, 1),
    teamCount = 3,
    githubCount = 1,
    jiraCount = 1,
    vulnerabilityPreferenceCount = 10,
    projectCount = getRandomInt(10, 15),
    project = null,
    file = null,
    projectIds = [],
    currentUserId = 1,
    deviceCount = 30,
    invoiceCount = 3;
  var users = server.createList('user', userCount);
  server.createList('pricing', pricingCount);
  server.createList('plan', planCount);
  server.createList('subscription', subscriptionCount);
  server.createList('vulnerability', vulnerabilityCount);
  server.createList('submission', submissionCount);
  server.createList('device', deviceCount);
  server.createList('invoice', invoiceCount);
  server.createList('analytic', analyticsCount);
  server.createList('personaltoken', personalTokenCount);
  server.createList('invitation', invitationCount);
  server.createList('github-integration', githubCount);
  server.createList('jira-integration', jiraCount);
  server.createList('vulnerability-preference', vulnerabilityPreferenceCount);
  server.createList('available-device', availableDeviceCount);
  server.createList('organization', organizationCount);

  server.create('organization-me');
  server.create('organization-member');

  for (var teamId = 1; teamId <= teamCount; teamId++) {
    server.create('team', {
      users: users,
    });
  }

  for (var projectId = 1; projectId <= projectCount; projectId++) {
    projectIds.push(projectId);

    var fileCount = getRandomInt(1, 4);

    project = server.create('project', {
      userId: currentUserId,
      last_file_id: fileCount,
    });

    server.create('invitation', {
      projectId: projectId,
      userId: currentUserId,
    });

    var fileIds = [];

    for (var fileId = 1; fileId <= fileCount; fileId++) {
      file = server.create('file', {
        projectId: projectId,
      });

      server.create('manualscan', {
        projectId: projectId,
      });

      fileIds.push(file.id);

      for (
        var vulnerabilityId = 1;
        vulnerabilityId <= vulnerabilityCount;
        vulnerabilityId++
      ) {
        server.create('analysis', {
          file: file.id,
          vulnerability: vulnerabilityId,
        });
      }
    }

    project.fileIds = fileIds;
  }

  // DAST Automation Scenarios
  server.create('scan-parameter-group', {
    id: 'default',
    project: 1,
    name: 'Default Scenario',
  });

  [
    {
      hasRead: true,
      messageCode: 'NF_SYSTM_FILE_UPLOAD_SUCCESS',
      context: {
        file_id: 450,
        version: '1.0',
        platform: 0,
        package_name: 'com.appknox.mfva',
        version_code: '6',
        platform_display: 'Android',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_UPLOAD_SUCCESS',
      context: {
        file_id: 450,
        version: '1.0',
        platform: 0,
        package_name: 'com.appknox.mfva',
        version_code: '6',
        platform_display: 'Android',
        store_url: 'https://play.google.com/mfva',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_VLDTN_ERR',
      context: {
        store_url: 'https://apps.apple.com/mfva',
        error_message: 'Invalid URL. URL is not valid',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_UPLDFAILPAYRQ1',
      context: {
        package_name: 'com.appknox.mfva',
        store_url: 'https://play.google.com/mfva',
        error_message: 'failed due to Insufficient Credits Error',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_UPLDFAILPAY2',
      context: {
        package_name: 'com.appknox.mfva',
        requester_username: 'test_user',
        store_url: 'https://play.google.com/mfva',
        error_message: 'failed due to Insufficient Credits Error',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_UPLDFAILNSUNAPRV1',
      context: {
        namespace_value: 'com.appknox.mfva',
        platform_display: 'Andriod',
        platform: 0,
        store_url: 'https://play.google.com/mfva',
        error_message: 'failed due to unapproved namespace',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_UPLDFAILNSCREATD1',
      context: {
        namespace_value: 'com.appknox.mfva',
        platform_display: 'Andriod',
        platform: 0,
        store_url: 'https://play.google.com/mfva',
        error_message: 'failed due to non-existent namespace',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_UPLDFAILNPRJDENY2',
      context: {
        project_id: 1,
        package_name: 'com.appknox.mfva',
        platform_display: 'Andriod',
        platform: 0,
        requester_username: 'test_user',
        requester_role: 'Admin',
        store_url: 'https://play.google.com/mfva',
        error_message: 'User does not have access to the project',
      },
    },
    {
      hasRead: true,
      messageCode: 'NF_STR_URL_UPLDFAILNPRJDENY1',
      context: {
        package_name: 'com.appknox.mfva',
        platform_display: 'Andriod',
        platform: 0,
        store_url: 'https://play.google.com/mfva',
        error_message: "You don't have permission to upload to project",
      },
    },
  ].forEach((notification) => {
    server.create('nf-in-app-notification', notification);
  });

  const org_user_requestedby = server.create('organization-user', {
    username: 'appknox_requester',
    email: 'appknox_requester@test.com',
    isActive: true,
  });

  const namespace = server.create('organization-namespace', {
    value: 'com.mfva.test',
    createdOn: new Date(),
    approvedOn: null,
    isApproved: false,
    requestedBy: org_user_requestedby,
    approvedBy: null,
    platform: 1,
  });

  server.create('nf-in-app-notification', {
    hasRead: true,
    messageCode: 'NF_STR_URL_NSREQSTD1',
    context: {
      namespace_id: namespace.id,
      namespace_created_on: new Date(),
      namespace_value: 'com.mfva.test',
      platform: 1,
      platform_display: 'android',
      requester_username: 'appknox_requester',
      // initial_requester_username: 'appknox_requester_previous',
      // current_requester_username: 'appknox_requester',
      store_url: 'https://play.google.com/mfva',
    },
  });

  var currentUser = server.db.users.get(currentUserId);

  currentUser.projectIds = projectIds;
}
