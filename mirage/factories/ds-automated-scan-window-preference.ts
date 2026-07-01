import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

// `HH:MM`, aligned to a quarter hour like the time picker emits.
function timeOfDay() {
  const hour = String(faker.number.int({ min: 0, max: 23 })).padStart(2, '0');
  const minute = faker.helpers.arrayElement(['00', '15', '30', '45']);

  return `${hour}:${minute}`;
}

export default Factory.extend({
  scan_window_type: 'specific_time',

  scan_window_start_at() {
    return timeOfDay();
  },

  scan_window_end_before() {
    return timeOfDay();
  },

  scan_window_timezone() {
    return faker.location.timeZone();
  },
});
