import Service, { service } from '@ember/service';
import { A } from '@ember/array';
import { get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { runTask } from 'ember-lifeline';

interface ObserverwatchedObj<T, K extends keyof T> {
  target: T;
  propPath: K | string;
  cb: (target: T, propPath: K, newValue: unknown) => void;
  context: unknown;
  lastValue: unknown;
}

export default class AkObserverService extends Service {
  @service('browser/window') declare window: Window;

  @tracked watchList = A<ObserverwatchedObj<any, any>>();
  @tracked pollingInterval = 250;

  private _pollingTimer: number | null = null;

  constructor(args: object) {
    super(args);

    this._startPolling();
  }

  get watchListLength() {
    return this.watchList.length;
  }

  // Add an observer to track property changes
  observe<T extends object, K extends keyof T>(
    target: T,
    propPath: K,
    cb: (target: T, propPath: K, newValue: unknown) => void,
    context: unknown = null
  ) {
    const currwatchList = this.watchList.find(
      (watchedObj) =>
        watchedObj.target === target &&
        watchedObj.propPath === propPath &&
        watchedObj.cb === cb &&
        watchedObj.context === context
    );

    if (currwatchList) {
      return;
    }

    // Get the current value
    const currentValue = get(target, propPath as string);

    // Set up a new watchedObj
    const watchedObj: ObserverwatchedObj<T, K> = {
      target,
      propPath,
      cb,
      context,
      lastValue: currentValue,
    };

    // Add to our watchList
    this.watchList.pushObject(watchedObj);

    // Make sure polling is started
    this._startPolling();
  }

  // Remove a specific observer
  stopObserving<T extends object, K extends keyof T>(
    target: T,
    propPath: K,
    cb: (target: T, propPath: K, newValue: unknown) => void,
    context: unknown = null
  ) {
    const watchedObjIndex = this.watchList.findIndex(
      (r) =>
        r.target === target &&
        r.propPath === propPath &&
        r.cb === cb &&
        r.context === context
    );

    if (watchedObjIndex >= 0) {
      this.watchList.removeAt(watchedObjIndex);
    }

    if (this.watchListLength === 0) {
      this._stopPolling();
    }
  }

  // Remove all observers for a specific target
  stopObservingTarget<T extends object>(target: T) {
    const targetObj = this.watchList.filter((r) => r.target === target);

    this.watchList.removeObjects(targetObj);

    if (this.watchListLength === 0) {
      this._stopPolling();
    }
  }

  // Remove all observers for a specific property path on a target
  stopObservingProperty<T extends object, K extends keyof T>(
    target: T,
    propPath: K
  ) {
    const watchObj = this.watchList.filter(
      (r) => r.target === target && r.propPath === propPath
    );

    this.watchList.removeObjects(watchObj);

    // Stop polling if no more watchList
    if (this.watchListLength === 0) {
      this._stopPolling();
    }
  }

  // Observe until a property meets a condition, then run callback once
  observeUntil<T extends object, K extends keyof T, V>(
    target: T,
    propPath: K,
    expectedValue: V,
    cb: (target: T) => void,
    context: unknown = null
  ) {
    const checkAndCleanup = (_target: T, _path: K, newValue: unknown) => {
      if (newValue === expectedValue) {
        this.stopObserving(target, propPath, checkAndCleanup, this);

        runTask(context || target, () => cb(target));

        return true;
      }

      return false;
    };

    // Check immediately in case the value is already what we're expecting
    const currentValue = get(target, propPath as string);

    if (currentValue === expectedValue) {
      runTask(context || target, () => cb(target));
    } else {
      this.observe(target, propPath, checkAndCleanup, this);
    }
  }

  // Internal method to check all registered properties for changes
  private _checkPropertyChanges() {
    this.watchList.forEach((watchedObj) => {
      try {
        const { target, propPath, lastValue, context } = watchedObj;
        const currentValue = target[propPath];

        if (currentValue !== lastValue) {
          watchedObj.lastValue = currentValue;

          try {
            watchedObj.cb.call(
              context || target,
              target,
              propPath,
              currentValue
            );
          } catch (error) {
            console.error('Error in observer cb:', error);
          }
        }
      } catch (error) {
        // Means that such watchedObj is likely invalid
        console.error('Error getting property value:', error);

        // Remove watchedObj
        this.watchList.removeObject(watchedObj);
      }
    });
  }

  private _startPolling() {
    if (this._pollingTimer !== null || this.watchListLength === 0) {
      return;
    }

    this._pollingTimer = this.window.setInterval(() => {
      this._checkPropertyChanges();
    }, this.pollingInterval);
  }

  private _stopPolling() {
    if (this._pollingTimer !== null) {
      this.window.clearInterval(this._pollingTimer);

      this._pollingTimer = null;
    }
  }

  willDestroy() {
    super.willDestroy();
    this._stopPolling();

    this.watchList = A();
  }
}

declare module '@ember/service' {
  interface Registry {
    'ak-observer': AkObserverService;
  }
}
