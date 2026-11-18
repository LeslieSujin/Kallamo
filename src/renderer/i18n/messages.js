function readMessage(messages, key) {
  if (typeof key !== 'string') return undefined;
  if (messages && Object.prototype.hasOwnProperty.call(messages, key)) return messages[key];
  return key.split('.').reduce((value, part) => (
    value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : undefined
  ), messages);
}

export function translateMessage(messages, english, key, fallback = key, values) {
  if (fallback && typeof fallback === 'object') {
    values = fallback;
    fallback = key;
  }
  const translated = readMessage(messages, key) ?? readMessage(english, key) ?? fallback;
  if (!values || typeof translated !== 'string') return translated;
  return translated.replace(/\{(\w+)\}/g, (placeholder, name) => (
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : placeholder
  ));
}
