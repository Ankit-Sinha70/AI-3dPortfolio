import test from 'node:test';
import assert from 'node:assert/strict';
import { isCommandPaletteShortcut, isEditableTarget } from '../src/scripts/keyboard-shortcuts.js';

test('Cmd/Ctrl+K is recognized regardless of key casing', () => {
  assert.equal(isCommandPaletteShortcut({ metaKey: true, ctrlKey: false, key: 'k' }), true);
  assert.equal(isCommandPaletteShortcut({ metaKey: false, ctrlKey: true, key: 'K' }), true);
});

test('other key combinations are not treated as the palette shortcut', () => {
  assert.equal(isCommandPaletteShortcut({ metaKey: false, ctrlKey: false, key: 'k' }), false);
  assert.equal(isCommandPaletteShortcut({ metaKey: true, ctrlKey: false, key: 'j' }), false);
  assert.equal(isCommandPaletteShortcut(null), false);
});

test('editable form controls are detected', () => {
  for (const tagName of ['input', 'TEXTAREA', 'select']) {
    assert.equal(isEditableTarget({ tagName }), true);
  }
  assert.equal(isEditableTarget({ tagName: 'div', isContentEditable: true }), true);
});

test('non-editable targets and missing targets are not editable', () => {
  assert.equal(isEditableTarget({ tagName: 'button' }), false);
  assert.equal(isEditableTarget({ tagName: 'div', isContentEditable: false }), false);
  assert.equal(isEditableTarget(null), false);
});
