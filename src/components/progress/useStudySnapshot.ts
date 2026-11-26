import { useEffect, useState } from 'preact/hooks';
import { onProgressChange, readProgress } from '../../lib/progress';
import { reviewSnapshot } from '../../lib/review';

export const reviewStorageKey = 'pom-proof:review';

function readStudySnapshot() {
  return { attempts: readProgress().attempts, cards: reviewSnapshot() };
}

export function useStudySnapshot() {
  const [snapshot, setSnapshot] = useState<ReturnType<typeof readStudySnapshot> | null>(null);
  useEffect(() => {
    const update = () => setSnapshot(readStudySnapshot());
    const onStorage = (event: StorageEvent) => {
      if (event.key === reviewStorageKey) update();
    };
    update();
    const unsubscribe = onProgressChange(update);
    window.addEventListener('storage', onStorage);
    window.addEventListener('pageshow', update);
    return () => {
      unsubscribe();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pageshow', update);
    };
  }, []);
  return snapshot;
}
