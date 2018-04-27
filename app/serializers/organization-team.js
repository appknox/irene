import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.results.map((item)=> {
        return {
          id: item.id,
          type: 'organization-team',
          attributes: {
            name: item.name,
            members: item.members,
            membersCount: item["members_count"],
            projectsCount: item["projects_count"],
            owner: item.owner.username,
            createdOn: item["created_on"]
          },
          relationships: {
            "organization": {
              "data": {
                "type": "organization",
                "id": item.organization.id
              }
            }
          }
        };
      })
    };
  }
});
