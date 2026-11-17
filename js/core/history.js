// History — undo/redo stack for the editor.
// States are plain serializable snapshots { adjustments, filters, transform,
// crop }; the image pixels themselves are never copied into history, which
// keeps memory small and undo instant.
export class History {
  constructor(limit = 50) {
    this.limit = limit;
    this.past = [];
    this.future = [];
  }

  // Record a new state. Clears the redo stack.
  push(state) {
    this.past.push(structuredClone(state));
    if (this.past.length > this.limit) this.past.shift();
    this.future.length = 0;
  }

  canUndo() { return this.past.length > 1; }
  canRedo() { return this.future.length > 0; }

  // Undo: move the current state to the redo stack, return the previous one.
  undo(current) {
    if (!this.canUndo()) return null;
    this.future.push(structuredClone(current));
    this.past.pop();
    return structuredClone(this.past[this.past.length - 1]);
  }

  // Redo: move the next state back to the undo stack.
  redo(current) {
    if (!this.canRedo()) return null;
    const next = this.future.pop();
    this.past.push(structuredClone(next));
    return structuredClone(next);
  }

  // The state at the top of the undo stack (what is currently shown).
  current() {
    return this.past.length ? structuredClone(this.past[this.past.length - 1]) : null;
  }

  clear() {
    this.past.length = 0;
    this.future.length = 0;
  }

  get undoCount() { return Math.max(0, this.past.length - 1); }
  get redoCount() { return this.future.length; }
}
