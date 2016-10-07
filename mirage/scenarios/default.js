/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function(server) {

  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.

    Make sure to define a factory for each model you want to create.
    */

  var userCount = getRandomInt(3, 10),
    pricingCount = getRandomInt(3, 3),
    vulnerabilityCount = getRandomInt(10, 20),
    projectId = 0, userId = 0, projectCount = 0,
    project = null, file = null;
  server.createList('user', userCount);
  server.createList('pricing', pricingCount);
  server.createList('vulnerability', vulnerabilityCount);
  projectCount =  getRandomInt(0, 10);
  for (projectId = 1; projectId < projectCount; projectId++) {
    project = server.create('project', {user: 1});
    var fileCount = getRandomInt(1, 4);
    for (var fileId = 1; fileId < fileCount; fileId++) {
      file = server.create('file', {project: project.id});
      for (var vulnerabilityId = 1; vulnerabilityId < vulnerabilityCount; vulnerabilityId++) {
        server.createList('analysis', fileCount, {file: file.id, vulnerability: vulnerabilityId});
      }
    }
    server.db.projects.update(project.id, {lastFile: file.id});
  }
  for (projectId = 0; projectId < projectCount; projectId++) {
    var collaborationCount = getRandomInt(0, userCount);
    for (userId=1; userId <= collaborationCount; userId++) {
      server.create('collaboration', {project: projectId, user: userId});
    }
  }
}
