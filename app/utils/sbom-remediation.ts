/**
 * Remediation is always a bump to the first unaffected version.
 *
 * The snippets here are code, not copy, so they are built in one place and
 * unit tested rather than assembled in templates. Prose stays in the
 * templates where it can be translated.
 */

export const RemediationEcosystem = {
  MAVEN: 'maven',
  NPM: 'npm',
  COCOAPODS: 'cocoapods',
  OTHER: 'other',
} as const;

export type RemediationEcosystemValue =
  (typeof RemediationEcosystem)[keyof typeof RemediationEcosystem];

const SUPPORTED: Record<string, RemediationEcosystemValue> = {
  maven: RemediationEcosystem.MAVEN,
  npm: RemediationEcosystem.NPM,
  cocoapods: RemediationEcosystem.COCOAPODS,
};

/**
 * Ecosystem from the bom ref's prefix (`maven::com.adobe.xmp:xmpcore`).
 * Anything we have no specific guidance for falls back to a generic block.
 */
export function ecosystemFromBomRef(
  bomRef?: string | null
): RemediationEcosystemValue {
  const prefix = (bomRef ?? '').split('::')[0]?.toLowerCase() ?? '';

  return SUPPORTED[prefix] ?? RemediationEcosystem.OTHER;
}

/** The dependency coordinate without the ecosystem prefix. */
export function coordinateFromBomRef(bomRef?: string | null): string {
  const parts = (bomRef ?? '').split('::');

  return (parts.length > 1 ? parts.slice(1).join('::') : parts[0]) || '';
}

/**
 * The parent as the ecosystem spells it. `via` arrives as `group/name`,
 * which is maven's coordinate with the wrong separator.
 */
export function parentCoordinate(
  via: string | null | undefined,
  ecosystem: RemediationEcosystemValue
): string | null {
  if (!via) {
    return null;
  }

  return ecosystem === RemediationEcosystem.MAVEN ? via.replace('/', ':') : via;
}

/** Whether the fix is a patch within the same minor line. */
export function isPatchRelease(current?: string | null, fix?: string | null) {
  const left = (current ?? '').split('.');
  const right = (fix ?? '').split('.');

  if (left.length < 2 || right.length < 2) {
    return false;
  }

  return left[0] === right[0] && left[1] === right[1];
}

/** The `x.y` line a version belongs to, for "same 2.12 line" wording. */
export function releaseLine(version?: string | null): string | null {
  const parts = (version ?? '').split('.');

  return parts.length >= 2 ? `${parts[0]}.${parts[1]}` : null;
}

export function gradleDeclaredLine(
  coordinate: string,
  version?: string | null
) {
  return `implementation("${coordinate}${version ? `:${version}` : ''}")`;
}

export function gradleInsightCommand(coordinate: string) {
  return [
    './gradlew :app:dependencyInsight \\',
    `    --dependency ${coordinate} \\`,
    '    --configuration releaseRuntimeClasspath',
  ].join('\n');
}

/** Forcing a transitive version needs a constraint, not a dependency. */
export function gradleConstraintSnippet(
  coordinate: string,
  fixVersion: string,
  advisoryId: string
) {
  return [
    'dependencies {',
    '    constraints {',
    `        implementation("${coordinate}:${fixVersion}") {`,
    `            because("${advisoryId}")`,
    '        }',
    '    }',
    '}',
  ].join('\n');
}

export function gradleDirectSnippet(coordinate: string, fixVersion: string) {
  return [
    'dependencies {',
    `    implementation("${coordinate}:${fixVersion}")`,
    '}',
  ].join('\n');
}

/**
 * npm pins transitives three different ways and the SBOM does not record
 * which package manager produced it, so all three are shown.
 */
export function npmOverridesSnippet(name: string, fixVersion: string) {
  return [
    '// npm 8.3+',
    `"overrides": { "${name}": "${fixVersion}" }`,
    '',
    '// yarn',
    `"resolutions": { "${name}": "${fixVersion}" }`,
    '',
    '// pnpm',
    `"pnpm": { "overrides": { "${name}": "${fixVersion}" } }`,
  ].join('\n');
}

export function npmDirectCommand(name: string, fixVersion: string) {
  return `npm install ${name}@${fixVersion}`;
}

/** CocoaPods has no constraint mechanism; the pod is declared explicitly. */
export function podfileSnippet(name: string, fixVersion: string) {
  return [
    `pod '${name}', '~> ${fixVersion}'`,
    '',
    `# then: pod update ${name}`,
  ].join('\n');
}

const VERSION_SEGMENT = /[0-9]+|[a-z]+/gi;

function compareSegment(left: string | undefined, right: string | undefined) {
  const a = left ?? '0';
  const b = right ?? '0';
  const aNum = /^\d+$/.test(a);
  const bNum = /^\d+$/.test(b);

  if (aNum && bNum) {
    return Math.sign(Number(a) - Number(b));
  }

  // A release outranks a qualifier (`2.12.0` > `2.12.0-rc1`).
  if (aNum !== bNum) {
    return aNum ? 1 : -1;
  }

  return Math.sign(a.localeCompare(b));
}

/**
 * Order two dependency versions. `semver` cannot be used here because maven
 * versions routinely carry a fourth segment (`2.12.7.1`), which semver
 * rejects or coerces away. Numeric segments compare numerically and a
 * missing segment counts as zero.
 */
export function compareVersions(
  left?: string | null,
  right?: string | null
): number {
  const a = (left ?? '').match(VERSION_SEGMENT) ?? [];
  const b = (right ?? '').match(VERSION_SEGMENT) ?? [];
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index++) {
    const order = compareSegment(a[index], b[index]);

    if (order !== 0) {
      return order;
    }
  }

  return 0;
}

/** The highest of a list of versions, ignoring empty entries. */
export function highestVersion(
  versions: Array<string | null | undefined>
): string | null {
  return versions.reduce<string | null>((best, version) => {
    if (!version) {
      return best;
    }

    return !best || compareVersions(version, best) > 0 ? version : best;
  }, null);
}

/**
 * The first unaffected version that applies to `current`. An advisory can
 * list one fixed version per release line, so the lowest fix above the
 * version in use is chosen. When no fix is above the version in use there is
 * nothing to upgrade to (suggesting one would be a downgrade), so null is
 * returned. Without a current version the highest listed fix is used.
 */
export function applicableFixVersion(
  fixes: string[],
  current?: string | null
): string | null {
  if (!current) {
    return highestVersion(fixes);
  }

  const above = fixes
    .filter((fix) => compareVersions(fix, current) > 0)
    .sort(compareVersions);

  return above[0] ?? null;
}

export interface UpgradeCoverage {
  /** One version that fixes every vulnerability that has a known fix. */
  version: string | null;
  /** Vulnerabilities fixed by `version`. */
  fixedCount: number;
  /** Vulnerabilities considered, including those without a known fix. */
  total: number;
}

/**
 * A single upgrade covering the component's vulnerabilities: the highest
 * per-vulnerability fix, and how many of them it resolves. A vulnerability
 * with no known fix is counted but cannot be covered.
 */
export function upgradeCoverage(
  fixes: Array<string | null | undefined>
): UpgradeCoverage {
  return {
    version: highestVersion(fixes),
    fixedCount: fixes.filter(Boolean).length,
    total: fixes.length,
  };
}

/**
 * The Maven Central page for one artifact version, built from a
 * `group:artifact` coordinate. Null when the coordinate is not maven shaped.
 */
export function mavenCentralUrl(
  coordinate?: string | null,
  version?: string | null
): string | null {
  const [group, artifact, ...rest] = (coordinate ?? '').split(':');

  if (!group || !artifact || rest.length || !version) {
    return null;
  }

  return [
    'https://central.sonatype.com/artifact',
    encodeURIComponent(group),
    encodeURIComponent(artifact),
    encodeURIComponent(version),
  ].join('/');
}

/** The maven group of a `group:artifact` coordinate. */
export function mavenGroup(coordinate?: string | null): string | null {
  const [group, artifact] = (coordinate ?? '').split(':');

  return group && artifact ? group : null;
}

/** How a gradle version catalog typically aliases an artifact. */
export function versionCatalogAlias(artifact?: string | null): string {
  return `libs.${(artifact ?? '').replace(/[-_]/g, '.')}`;
}

/** Minimal frame shape needed to place the app caller on a path. */
export interface RetestFrame {
  packageName: string | null;
  owner?: { kind?: string | null } | null;
}

function isLibraryFrame(frame: RetestFrame, libraryPackage: string | null) {
  if (frame.owner?.kind) {
    return frame.owner.kind === 'COMPONENT';
  }

  return Boolean(
    libraryPackage &&
      frame.packageName &&
      (frame.packageName === libraryPackage ||
        frame.packageName.startsWith(`${libraryPackage}.`))
  );
}

/**
 * Index of the frame where the library is entered: the first frame owned by
 * the component, else the first in the library's package. -1 when no frame
 * can be attributed to the library.
 */
export function libraryEntryIndex(
  frames: RetestFrame[],
  libraryPackage: string | null
): number {
  return frames.findIndex((frame) => isLibraryFrame(frame, libraryPackage));
}

/**
 * The app frame that calls into the library: the last APP-owned frame when
 * owners are known, otherwise the frame just before the first frame in the
 * library's package. Null when ownership cannot be established (no owner and
 * no package match, as when the maven group differs from the Java package),
 * when that frame is the entry point itself, or when there is none. Guessing
 * would label a library-internal method as app code.
 */
export function appCallerIndex(
  frames: RetestFrame[],
  libraryPackage: string | null
): number | null {
  const libIndex = libraryEntryIndex(frames, libraryPackage);

  if (libIndex === -1) {
    return null;
  }

  const before = frames.slice(0, libIndex);
  const lastApp = before.map((f) => f.owner?.kind).lastIndexOf('APP');
  const index = lastApp === -1 ? libIndex - 1 : lastApp;

  return index > 0 ? index : null;
}
