export function isCommandPaletteShortcut(event) {
  return Boolean(
    event &&
    (event.metaKey || event.ctrlKey) &&
    String(event.key || '').toLowerCase() === 'k'
  );
}

export function isEditableTarget(target) {
  if (!target || typeof target !== 'object') return false;
  const tagName = String(target.tagName || '').toUpperCase();
  return Boolean(
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(tagName)
  );
}
