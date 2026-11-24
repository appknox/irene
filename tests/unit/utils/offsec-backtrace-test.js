import { module, test } from 'qunit';

import {
  appModuleOf,
  parseOffsecFrame,
  parseOffsecStack,
} from 'irene/utils/offsec-backtrace';

// A jailbreak file probe as the iOS lane reports it in result.json `backtraces[].frames`.
const IOS_STACK = [
  'Foundation!-[NSFileManager fileExistsAtPath:]',
  'Agrivita!0xea8cc',
  'Agrivita!0xea9f0',
  'Agrivita!-[Agrivita.AppDelegate application:didFinishLaunchingWithOptions:]',
];

module('Unit | Utility | offsec-backtrace', function () {
  test('it splits a native frame into module and symbol', function (assert) {
    const frame = parseOffsecFrame(IOS_STACK[0]);

    assert.strictEqual(frame.module, 'Foundation');
    assert.strictEqual(frame.separator, '!');
    assert.strictEqual(frame.location, '-[NSFileManager fileExistsAtPath:]');
    assert.false(frame.isOffset);
    assert.strictEqual(frame.owner, 'unknown', 'no app frame, no owner');
  });

  test('it marks a hex location as an offset', function (assert) {
    const frame = parseOffsecFrame('Agrivita!0x63F88');

    assert.strictEqual(frame.location, '0x63F88');
    assert.true(frame.isOffset);
  });

  test('it tags native frames by the app frame module', function (assert) {
    const frames = parseOffsecStack(IOS_STACK, 'Agrivita!0xea8cc');

    assert.deepEqual(
      frames.map((f) => f.owner),
      ['system', 'app', 'app', 'app']
    );
    assert.deepEqual(
      frames.map((f) => f.isAppFrame),
      [false, true, false, false]
    );
  });

  test('it reads the app module from a native app frame only', function (assert) {
    assert.strictEqual(appModuleOf('Agrivita!0x63f88'), 'Agrivita');
    assert.strictEqual(appModuleOf('com.example.a.RootCheck.check'), '');
    assert.strictEqual(appModuleOf(null), '');
  });

  test('it splits a Java frame into class and method', function (assert) {
    const frames = parseOffsecStack(
      [
        'java.io.File.exists',
        'com.example.a.RootCheck.check',
        'com.example.MainActivity.onCreate',
      ],
      'com.example.a.RootCheck.check'
    );

    assert.strictEqual(frames[1].module, 'com.example.a.RootCheck');
    assert.strictEqual(frames[1].separator, '.');
    assert.strictEqual(frames[1].location, 'check');
    assert.deepEqual(
      frames.map((f) => f.owner),
      ['system', 'app', 'unknown']
    );
    assert.true(frames[1].isAppFrame);
  });

  test('it keeps a frame with no module as plain text', function (assert) {
    const frame = parseOffsecFrame('<unknown frame>');

    assert.strictEqual(frame.module, '');
    assert.strictEqual(frame.separator, '');
    assert.strictEqual(frame.location, '<unknown frame>');
  });

  test('it drops blank and non-string frames and tolerates a missing stack', function (assert) {
    assert.deepEqual(parseOffsecStack(undefined), []);
    assert.deepEqual(parseOffsecStack('Agrivita!0x1'), []);
    assert.strictEqual(
      parseOffsecStack(['Agrivita!0x1', '', '  ', 7, null]).length,
      1
    );
  });
});
