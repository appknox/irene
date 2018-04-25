import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.data.map((item)=> {
        return {
          id: item.id,
          type: 'organization-team',
          attributes: {
            name: item.attributes.name,
            members: item.attributes.members,
            membersCount: item.attributes["members-count"],
            projectsCount: item.attributes["projects-count"]
          },
          relationships: {
            "organization": {
              "data": {
                "type": "organization",
                "id": item.relationships.organization.data.id
              }
            }
          }
        };
      })
    };
  }
});
