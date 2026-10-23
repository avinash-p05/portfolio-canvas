import { createContext, useContext, useSyncExternalStore } from 'react';
import type { CanvasEngine } from './engine';

export const EngineContext = createContext<CanvasEngine | null>(null);

export function useEngine(): CanvasEngine {
  const engine = useContext(EngineContext);
  if (!engine) throw new Error('useEngine must be used inside <EngineContext.Provider>');
  return engine;
}

/** The camera zoom as a whole percentage; re-renders only when that number changes. */
export function useZoomPercent(): number {
  const engine = useEngine();
  return useSyncExternalStore(
    (onChange) => engine.subscribe(onChange),
    () => Math.round(engine.camera.z * 100),
  );
}
