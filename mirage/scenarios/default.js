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
    projectCount = 0, project = null, file = null;
  server.createList('user', userCount);
  server.createList('pricing', pricingCount);
  server.createList('vulnerability', vulnerabilityCount);
  projectCount =  getRandomInt(1, 5);
  for (var projectId = 1; projectId <= projectCount; projectId++) {
    var fileCount = getRandomInt(1, 4);
    project = server.create('project', {userId: 1});
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
    for (var userId = 1; userId <= collaborationCount; userId++) {
      server.create('collaboration', {projectId: projectId, userId: userId});
    }
  }
}
