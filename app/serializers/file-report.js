import DRFSerializer from './drf';

export default DRFSerializer.extend({
  primaryKey: 'id',

  //Serialize request payload and can be extensible based on the need
  serialize(snapshot) {
    const payload = {
      language: snapshot.attr('language')
    }
    return payload;
  }
});
