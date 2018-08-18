export default function dateTime(dateiso) {
  if (Ember.isEmpty(dateiso)) {
    return;
  }
  return `${dateiso.toLocaleString('best', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })}`;
}
