import { authenticateSession } from 'ember-simple-auth/test-support';

import { faker } from '@faker-js/faker';

export async function createAuthSession(userId = '1') {
  await authenticateSession({
    authToken: faker.git.commitSha(),
    user_id: userId,
  });
}

export async function setupRequiredEndpoints(server, skipLogin = true) {
  // clear out default data
  server.db.emptyData();

  const currentUser = server.create('user');
  const vulnerabilities = server.createList('vulnerability', 20);
  const organization = server.create('organization');

  const currentOrganizationMember = server.create('organization-member', {
    id: currentUser.id,
    member: currentUser.id,
  });

  const currentOrganizationUser = server.create('organization-user', {
    id: currentOrganizationMember.member,
  });

  const currentOrganizationMe = server.create('organization-me', {
    id: currentUser.id,
  });

  const currentSkOrganization = server.create('sk-organization', {
    organization,
  });

  const currentSkOrganizationSub = server.create('sk-organization-sub', {
    skOrganization: currentSkOrganization,
  });

  if (skipLogin) {
    await createAuthSession(currentUser.id);
  } else {
    // login endpoints
  }

  server.get('/hudson-api/projects', () => {
    return new Response(200);
  });

  server.get('/vulnerabilities', (schema) => {
    return {
      data: schema.vulnerabilities.all().models.map((model) => ({
        attributes: model,
        id: model.id,
        relationships: {},
        type: 'vulnerabilities',
      })),
    };
  });

  server.get('/users/:id', (schema, req) => {
    return {
      data: {
        attributes: schema.users.find(`${req.params.id}`)?.toJSON(),
        id: req.params.id,
        relationships: {},
        type: 'users',
      },
    };
  });

  server.get('/organizations', (schema) => {
    const results = schema.organizations.all().models;

    return {
      count: results.length,
      previous: null,
      next: null,
      results,
    };
  });

  server.get('/v2/sk_organization', (schema) => {
    const skOrganizations = schema.skOrganizations.all().models;

    return {
      count: skOrganizations.length,
      next: null,
      previous: null,
      results: skOrganizations,
    };
  });

  server.get('/v2/sk_organization/:id/sk_subscription', (schema, req) => {
    return schema.skOrganizationSubs.find(req.params.id)?.toJSON();
  });

  server.get('/organizations/:id/me', function () {
    return currentOrganizationMe.toJSON();
  });

  server.get('/organizations/:orgId/members/:memId', (schema, request) => {
    return schema.organizationMembers.find(request.params.memId)?.toJSON();
  });

  server.get('/submissions', () => {
    return {
      count: 0,
      previous: null,
      next: null,
      results: [],
    };
  });

  return {
    currentUser,
    currentOrganizationMe,
    currentOrganizationMember,
    currentOrganizationUser,
    vulnerabilities,
    organization,
    currentSkOrganization,
    currentSkOrganizationSub,
  };
}
