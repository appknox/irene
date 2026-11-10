import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export type OffsecThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'offsecTheme';
const THEME_ATTRIBUTE = 'data-offsec-theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

/**
 * Light or dark look for the offensive security screens. The choice is stored in the browser;
 * until the user makes one, the operating system setting decides.
 */
export default class OffsecThemeService extends Service {
  @service('browser/window') declare window: Window;

  @tracked preference: OffsecThemePreference = 'system';
  @tracked systemIsDark = false;

  private mediaQuery: MediaQueryList | null = null;
  private isActive = false;

  constructor(...args: ConstructorParameters<typeof Service>) {
    super(...args);

    this.preference = this.readStoredPreference();
  }

  /** The theme actually shown: the stored choice, or the system setting when there is none. */
  get isDark(): boolean {
    return this.preference === 'system'
      ? this.systemIsDark
      : this.preference === 'dark';
  }

  /** Turns the dark theme on for this page, and starts following the system setting. */
  @action
  activate(): void {
    this.isActive = true;
    this.watchSystemSetting();
    this.apply();
  }

  /** Switches the theme off again so the other products always stay light. */
  @action
  deactivate(): void {
    this.isActive = false;
    this.mediaQuery?.removeEventListener('change', this.handleSystemChange);
    this.mediaQuery = null;
    this.window.document?.documentElement.removeAttribute(THEME_ATTRIBUTE);
  }

  /** Flips to the opposite of the theme currently shown and remembers it as the user's choice. */
  @action
  toggle(): void {
    this.preference = this.isDark ? 'light' : 'dark';
    this.storePreference();
    this.apply();
  }

  private handleSystemChange = (event: MediaQueryListEvent) => {
    this.systemIsDark = event.matches;
    this.apply();
  };

  private watchSystemSetting(): void {
    this.mediaQuery?.removeEventListener('change', this.handleSystemChange);
    this.mediaQuery = this.window.matchMedia?.(DARK_QUERY) ?? null;
    this.systemIsDark = Boolean(this.mediaQuery?.matches);
    this.mediaQuery?.addEventListener('change', this.handleSystemChange);
  }

  private apply(): void {
    if (!this.isActive) {
      return;
    }

    const root = this.window.document?.documentElement;

    if (this.isDark) {
      root?.setAttribute(THEME_ATTRIBUTE, 'dark');
    } else {
      root?.removeAttribute(THEME_ATTRIBUTE);
    }
  }

  private readStoredPreference(): OffsecThemePreference {
    try {
      const stored = this.window.localStorage.getItem(STORAGE_KEY);

      return stored === 'light' || stored === 'dark' ? stored : 'system';
    } catch {
      return 'system';
    }
  }

  private storePreference(): void {
    try {
      this.window.localStorage.setItem(STORAGE_KEY, this.preference);
    } catch {
      // storage can be blocked; the choice then lasts for this visit only
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'offsec-theme': OffsecThemeService;
  }
}
