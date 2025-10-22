import DRFSerializer from './drf';

export default DRFSerializer.extend({
  primaryKey: 'countryCode',

  normalizeResponse: function (store, primaryModelClass, payload) {
    return {
      data: payload.map((item) => {
        return {
          id: item.countryCode,
          type: 'geo-location',
          attributes: {
            countryCode: item.countryCode,
            countryName: item.country_name,
            isHighRiskRegion: item.is_high_risk_region,
            highRiskReason: item.high_risk_reason,
            hostUrls: item.hostUrls || [],
          },
        };
      }),
    };
  },
});
