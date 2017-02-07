/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function(server) {
  var userCount = getRandomInt(3, 5),
    pricingCount = getRandomInt(3, 3),
    vulnerabilityCount = getRandomInt(5, 15),
    submissionCount = getRandomInt(0,3),
    projectCount = 0, project = null, file = null, projectIds = [],
    currentUserId = 1, deviceCount=30, invoiceCount=1;
  server.createList('user', userCount);
  server.createList('pricing', pricingCount);
  server.createList('vulnerability', vulnerabilityCount);
  server.createList('submission', submissionCount);
  server.createList('device', deviceCount);
  server.createList('invoice', invoiceCount);
  projectCount =  getRandomInt(1, 5);
  for (var projectId = 1; projectId <= projectCount; projectId++) {
    projectIds.push(projectId);
    var fileCount = getRandomInt(1,4);
    project = server.create('project', {userId: currentUserId});
    server.create('invitation', {projectId: projectId, userId:currentUserId});
    var fileIds = [];
    for (var fileId = 1; fileId <= fileCount; fileId++) {
      file = server.create('file', {projectId: projectId});
      fileIds.push(file.id);
      for (var vulnerabilityId = 1; vulnerabilityId <= vulnerabilityCount; vulnerabilityId++) {
        server.create('analysis', {file: file, vulnerabilityId: vulnerabilityId});
      }
    }
    project.fileIds = fileIds;
    var collaborationCount = getRandomInt(0, userCount);
    var collaborationIds = [];
    for (var userId = 1; userId <= collaborationCount; userId++) {
      var collaboration = server.create('collaboration', {projectId: projectId, userId: userId});
      collaborationIds.push(collaboration.id);
    }
    project.collaborationIds = collaborationIds;
  }
  var currentUser = server.db.users.get(currentUserId);
  currentUser.projectIds = projectIds;
}
