import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';

// Route constructor
type Constructor<T = object> = new (...args: (object | undefined)[]) => T;

/**
 * Scroll to top utility for routes
 * A Shift from the mixin approach
 *
 * @param {typeof Route<Model, Params>} Superclass
 * @returns {Constructor<Route<Model, Params>>} Constructor
 */

export const ScrollToTop = <Model = unknown, Params extends object = object>(
  Superclass: typeof Route<Model, Params>
): Constructor<Route<Model, Params>> =>
  class extends Superclass {
    activate(_transition: Transition) {
      super.activate(_transition);
      window.scrollTo(0, 0);
    }
  };
