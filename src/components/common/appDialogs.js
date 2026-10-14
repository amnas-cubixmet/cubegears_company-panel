/**
 * Promise-driven global dialog requests. Never override native window.confirm /
 * window.prompt: those are synchronous, so they cannot safely show a React UI.
 */
let subscriber = null;
let active = null;
const pending = [];

const emptyValue = (kind) => kind === 'prompt' ? null : kind === 'confirm' ? false : undefined;

const notify = () => {
  if (subscriber) subscriber(active);
};

const advance = () => {
  if (active || !pending.length || !subscriber) return;
  active = pending.shift();
  notify();
};

const request = (kind, message, options = {}) => new Promise((resolve) => {
  pending.push({
    kind, message: String(message ?? ''),
    title: options.title || '',
    confirmLabel: options.confirmLabel || '',
    cancelLabel: options.cancelLabel || 'Cancel',
    defaultValue: String(options.defaultValue ?? ''),
    placeholder: options.placeholder || '',
    required: options.required === true,
    tone: options.tone || (
      /\b(delete|remove|reject|cancel|reverse|archive|unassign)\b/i.test(String(message)) ? 'danger' : 'normal'
    ),
    resolve,
  });
  advance();
});

export const appConfirm = (message, options = {}) => request('confirm', message, options);
export const appAlert = (message, options = {}) => request('alert', message, options);
export const appPrompt = (message, defaultValue = '', options = {}) =>
  request('prompt', message, { ...options, defaultValue });

export const subscribeAppDialogs = (nextSubscriber) => {
  subscriber = nextSubscriber;
  notify();
  advance();
  return () => {
    if (subscriber === nextSubscriber) subscriber = null;
  };
};

export const resolveAppDialog = (value) => {
  const finished = active;
  if (!finished) return;
  active = null;
  finished.resolve(value);
  notify();
  advance();
};

export const cancelAppDialog = () => {
  if (active) resolveAppDialog(emptyValue(active.kind));
};
