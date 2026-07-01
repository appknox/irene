import { Factory } from 'miragejs';
import { faker } from '@faker-js/faker';

const DEFAULT_NODE_COUNT = 5;
const ACTION_TYPES = ['tap', 'swipe', 'enter_text', 'long_press', 'wait'];

function buildNode(index: number) {
  const order = index + 1;

  return {
    id: `node-${order}`,
    label: faker.word.noun(),
    variant_id: faker.string.uuid(),
    title: faker.commerce.productName(),
    visit_count: faker.number.int({ min: 1, max: 20 }),
    execution_order: order,
    screenshot_path: faker.image.dataUri(),
  };
}

// Chains node-N → node-(N+1).
function buildEdge(fromIndex: number) {
  return {
    id: `edge-${fromIndex + 1}`,
    source: `node-${fromIndex + 1}`,
    target: `node-${fromIndex + 2}`,
    label: faker.word.verb(),
    action_type: faker.helpers.arrayElement(ACTION_TYPES),
  };
}

export default Factory.extend({
  nodes() {
    return Array.from({ length: DEFAULT_NODE_COUNT }, (_, i) => buildNode(i));
  },

  edges() {
    return Array.from({ length: DEFAULT_NODE_COUNT - 1 }, (_, i) =>
      buildEdge(i)
    );
  },

  metadata() {
    return {
      total_nodes: DEFAULT_NODE_COUNT,
      total_edges: DEFAULT_NODE_COUNT - 1,
      total_navigations: faker.number.int({ min: 1, max: 50 }),
      scan_start_time: faker.date.recent().toISOString(),
    };
  },
});
