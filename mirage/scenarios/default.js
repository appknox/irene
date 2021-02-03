/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function (server) {
  var
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
    projectCount = 0,
    project = null,
    file = null,
    projectIds = [],
    currentUserId = 1,
    deviceCount = 30,
    invoiceCount = 3;
  var users = server.createList('user', 15);
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
  server.createList('client', 50);
  server.createList('client-invite', 30);
  server.createList('credits/overall-usage', 10);
  server.create('credits/compound');
  server.createList('client-upload', 18);
  server.create('credits/client-compound');
  projectCount = getRandomInt(4, 5);
  for (var teamId = 1; teamId <= teamCount; teamId++) {
    server.create('team', {
      users: users
    });
  }
  for (var projectId = 1; projectId <= projectCount; projectId++) {
    projectIds.push(projectId);
    var fileCount = getRandomInt(1, 4);
    project = server.create('project', {
      userId: currentUserId
    });
    server.create('invitation', {
      projectId: projectId,
      userId: currentUserId
    });
    var fileIds = [];
    for (var fileId = 1; fileId <= fileCount; fileId++) {
      file = server.create('file', {
        projectId: projectId
      });
      server.create('manualscan', {
        projectId: projectId
      });
      fileIds.push(file.id);
      for (var vulnerabilityId = 1; vulnerabilityId <= vulnerabilityCount; vulnerabilityId++) {
        server.create('analysis', {
          file: file,
          vulnerabilityId: vulnerabilityId
        });
      }
    }
    project.fileIds = fileIds;
  }
  var currentUser = server.db.users.get(currentUserId);
  currentUser.projectIds = projectIds;
}
