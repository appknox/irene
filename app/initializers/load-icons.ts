import { addCollection, IconifyJSON } from 'iconify-icon';

export async function initialize() {
  try {
    const res = await fetch('/ak-icons.json');
    const collections = await res.json();

    for (const collection of Object.values(collections)) {
      addCollection(collection as IconifyJSON);
    }
  } catch (err) {
    console.error('❌ Error loading offline icons:', err);
  }
}

export default {
  initialize,
};
