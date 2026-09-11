import { useState, useCallback } from 'react';

export function useHistory(initialPresent) {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialPresent);
  const [future, setFuture] = useState([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    if (!canUndo) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setPast(newPast);
    setFuture([present, ...future]);
    setPresent(previous);
  }, [canUndo, past, present, future]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast([...past, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [canRedo, future, past, present]);

  const set = useCallback((newPresent) => {
    if (JSON.stringify(newPresent) === JSON.stringify(present)) return;
    setPast((prev) => [...prev, present]);
    setPresent(newPresent);
    setFuture([]);
  }, [present]);

  return [present, set, undo, redo, canUndo, canRedo];
}