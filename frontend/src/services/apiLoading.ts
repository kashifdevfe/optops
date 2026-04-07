type Listener = (pendingCount: number) => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function emit() {
  for (const listener of listeners) listener(pendingCount);
}

export const apiLoading = {
  getCount() {
    return pendingCount;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    listener(pendingCount);
    return () => {
      listeners.delete(listener);
    };
  },
  inc() {
    pendingCount += 1;
    emit();
  },
  dec() {
    pendingCount = Math.max(0, pendingCount - 1);
    emit();
  },
  reset() {
    pendingCount = 0;
    emit();
  },
};

