import commondrf from './commondrf';

export default class Dynamicscan extends commondrf {
  pathForType(type) {
    return type;
  }

  extendTime(snapshot, time) {
    const id = snapshot.id;
    const modelName = snapshot.constructor.modelName;
    const url = this.buildURL(modelName, id) + '/extend'
    return this.ajax(url, 'POST', {
      data: {time}
    });
  }
}
