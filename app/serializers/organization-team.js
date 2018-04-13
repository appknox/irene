import DRFSerializer from './drf';

export default DRFSerializer.extend({
  normalizeResponse: function (store, primaryModelClass, payload, id, requestType) {
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
          }
        }
      })
    };
  }
});
