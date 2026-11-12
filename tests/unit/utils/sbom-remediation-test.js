import { module, test } from 'qunit';
import {
  RemediationEcosystem,
  appCallerIndex,
  applicableFixVersion,
  compareVersions,
  coordinateFromBomRef,
  ecosystemFromBomRef,
  gradleConstraintSnippet,
  gradleDeclaredLine,
  gradleInsightCommand,
  highestVersion,
  isPatchRelease,
  libraryEntryIndex,
  mavenCentralUrl,
  mavenGroup,
  npmOverridesSnippet,
  parentCoordinate,
  podfileSnippet,
  releaseLine,
  upgradeCoverage,
  versionCatalogAlias,
} from 'irene/utils/sbom-remediation';

module('Unit | Utility | sbom-remediation', function () {
  test('the ecosystem comes from the bom ref prefix', function (assert) {
    assert.strictEqual(
      ecosystemFromBomRef('maven::com.adobe.xmp:xmpcore'),
      RemediationEcosystem.MAVEN
    );
    assert.strictEqual(
      ecosystemFromBomRef('cocoapods::AFNetworking'),
      RemediationEcosystem.COCOAPODS
    );
    assert.strictEqual(
      ecosystemFromBomRef('npm::minimist'),
      RemediationEcosystem.NPM
    );

    // Anything without specific guidance falls back to the generic block.
    assert.strictEqual(
      ecosystemFromBomRef('swift::SwiftTerm'),
      RemediationEcosystem.OTHER
    );
    assert.strictEqual(ecosystemFromBomRef(null), RemediationEcosystem.OTHER);
  });

  test('the coordinate drops the ecosystem prefix', function (assert) {
    assert.strictEqual(
      coordinateFromBomRef('maven::com.adobe.xmp:xmpcore'),
      'com.adobe.xmp:xmpcore'
    );
    assert.strictEqual(coordinateFromBomRef('npm::minimist'), 'minimist');
    assert.strictEqual(coordinateFromBomRef(''), '');
  });

  test('the parent is spelled the way its ecosystem spells it', function (assert) {
    // `via` arrives as group/name, which is maven's coordinate mis-separated.
    assert.strictEqual(
      parentCoordinate('com.adobe.xmp/xmpcore', RemediationEcosystem.MAVEN),
      'com.adobe.xmp:xmpcore'
    );
    assert.strictEqual(
      parentCoordinate('lodash', RemediationEcosystem.NPM),
      'lodash'
    );
    assert.strictEqual(
      parentCoordinate(null, RemediationEcosystem.MAVEN),
      null
    );
  });

  test('a patch bump is recognised within the same minor line', function (assert) {
    assert.true(isPatchRelease('2.12.0', '2.12.2'));
    assert.false(isPatchRelease('2.12.0', '2.13.0'));
    assert.false(isPatchRelease('2.9.8', '2.12.7'));
    assert.false(isPatchRelease('1', '2'));
    assert.strictEqual(releaseLine('2.12.2'), '2.12');
    assert.strictEqual(releaseLine('2'), null);
  });

  test('a transitive maven fix is pinned with a constraint', function (assert) {
    assert.strictEqual(
      gradleConstraintSnippet(
        'xerces:xercesimpl',
        '2.12.2',
        'GHSA-qv32-7r6p-xhhh'
      ),
      [
        'dependencies {',
        '    constraints {',
        '        implementation("xerces:xercesimpl:2.12.2") {',
        '            because("GHSA-qv32-7r6p-xhhh")',
        '        }',
        '    }',
        '}',
      ].join('\n')
    );
  });

  test('the declared line and insight command quote the coordinate', function (assert) {
    assert.strictEqual(
      gradleDeclaredLine('com.adobe.xmp:xmpcore', '5.1.0'),
      'implementation("com.adobe.xmp:xmpcore:5.1.0")'
    );

    // An unknown parent version must not render a dangling colon.
    assert.strictEqual(
      gradleDeclaredLine('com.adobe.xmp:xmpcore', null),
      'implementation("com.adobe.xmp:xmpcore")'
    );

    assert.true(
      gradleInsightCommand('xerces:xercesimpl').includes(
        '--dependency xerces:xercesimpl'
      )
    );
  });

  test('npm shows every package manager because the SBOM does not say which', function (assert) {
    const snippet = npmOverridesSnippet('minimist', '1.2.6');

    assert.true(snippet.includes('"overrides"'));
    assert.true(snippet.includes('"resolutions"'));
    assert.true(snippet.includes('"pnpm"'));
  });

  test('cocoapods declares the pod explicitly and updates it', function (assert) {
    const snippet = podfileSnippet('AFNetworking', '4.0.1');

    assert.true(snippet.includes("pod 'AFNetworking', '~> 4.0.1'"));
    assert.true(snippet.includes('pod update AFNetworking'));
  });

  test('versions compare numerically, including a fourth segment', function (assert) {
    assert.strictEqual(compareVersions('2.12.10', '2.12.9'), 1);
    assert.strictEqual(compareVersions('2.12.7.1', '2.12.7'), 1);
    assert.strictEqual(compareVersions('2.12.7', '2.12.7.0'), 0);
    assert.strictEqual(compareVersions('1.0.0-rc1', '1.0.0'), -1);
    assert.strictEqual(compareVersions(null, '1.0'), -1);
  });

  test('the highest version ignores empty entries', function (assert) {
    assert.strictEqual(
      highestVersion(['2.12.6.1', null, '2.12.7.1', '2.9.10.8']),
      '2.12.7.1'
    );
    assert.strictEqual(highestVersion([null, undefined]), null);
  });

  test('the applicable fix is the lowest one above the current version', function (assert) {
    const fixes = ['2.9.10.8', '2.10.5.1', '2.11.4'];

    assert.strictEqual(applicableFixVersion(fixes, '2.10.0'), '2.10.5.1');
    // Without a current version, the highest listed fix.
    assert.strictEqual(applicableFixVersion(fixes, null), '2.11.4');
    // Nothing above the version in use: no fix (anything else is a downgrade).
    assert.strictEqual(applicableFixVersion(fixes, '3.0.0'), null);
    assert.strictEqual(applicableFixVersion(fixes, '2.11.4'), null);
    assert.strictEqual(applicableFixVersion([], '1.0'), null);
  });

  test('upgrade coverage counts fixes against all vulnerabilities', function (assert) {
    assert.deepEqual(upgradeCoverage(['2.12.6.1', '2.12.7.1', null]), {
      version: '2.12.7.1',
      fixedCount: 2,
      total: 3,
    });
  });

  test('maven central links need a group:artifact coordinate', function (assert) {
    assert.strictEqual(
      mavenCentralUrl(
        'com.fasterxml.jackson.core:jackson-databind',
        '2.12.7.1'
      ),
      'https://central.sonatype.com/artifact/com.fasterxml.jackson.core/jackson-databind/2.12.7.1'
    );
    assert.strictEqual(mavenCentralUrl('minimist', '1.2.6'), null);
    assert.strictEqual(mavenCentralUrl('a:b', null), null);
    assert.strictEqual(mavenGroup('xerces:xercesimpl'), 'xerces');
    assert.strictEqual(mavenGroup('minimist'), null);
  });

  test('the version catalog alias dots the artifact name', function (assert) {
    assert.strictEqual(
      versionCatalogAlias('jackson-databind'),
      'libs.jackson.databind'
    );
  });

  test('the app caller sits just before the library', function (assert) {
    // commons-text: the maven group is also the Java package prefix.
    const byPackage = [
      { packageName: 'com.example' },
      { packageName: 'com.example.util' },
      { packageName: 'org.apache.commons.text' },
      { packageName: 'org.apache.commons.text.lookup' },
    ];

    assert.strictEqual(libraryEntryIndex(byPackage, 'org.apache.commons'), 2);
    assert.strictEqual(appCallerIndex(byPackage, 'org.apache.commons'), 1);

    // Owners, when present, win over package prefixes.
    const byOwner = [
      { packageName: 'com.example', owner: { kind: 'APP' } },
      { packageName: 'com.example', owner: { kind: 'APP' } },
      { packageName: 'android.os', owner: { kind: 'PLATFORM' } },
      { packageName: 'okio', owner: { kind: 'COMPONENT' } },
    ];

    assert.strictEqual(appCallerIndex(byOwner, null), 1);

    // Entry straight into the library: there is no separate caller.
    assert.strictEqual(
      appCallerIndex(
        [{ packageName: 'com.example' }, { packageName: 'xerces' }],
        'xerces'
      ),
      null
    );
  });

  test('no app caller is guessed when ownership is unknown', function (assert) {
    // xercesImpl: group `xerces`, but the classes live in `org.apache.xerces`.
    const xerces = [
      { packageName: 'com.example' },
      { packageName: 'com.example.xml' },
      { packageName: 'org.apache.xerces.parsers' },
      { packageName: 'org.apache.xerces.impl' },
    ];

    assert.strictEqual(libraryEntryIndex(xerces, 'xerces'), -1);
    assert.strictEqual(appCallerIndex(xerces, 'xerces'), null);

    // npm / cocoapods: no package to match against.
    assert.strictEqual(appCallerIndex(xerces, null), null);
  });
});
