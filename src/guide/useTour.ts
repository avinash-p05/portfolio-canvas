import { useCallback, useRef, useState, type RefObject } from 'react';
import type { CanvasEngine } from '../canvas/engine';
import { measureZone } from '../canvas/measure';
import type { TourStep } from '../content/types';

export interface BubbleAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}

/** The speech bubble attached to the guide cursor. */
export interface Bubble {
  text: string;
  actions: BubbleAction[];
  /** e.g. "2/5" during the tour. */
  progress?: string;
}

interface TourOptions {
  /** Passed in rather than read from context: the app that provides the engine owns the tour. */
  engine: CanvasEngine;
  worldRef: RefObject<HTMLElement>;
  steps: TourStep[];
  /** Called when the visitor finishes or skips the tour. */
  onEnd: () => void;
}

/** The guided tour: the cursor flies through each zone and explains it in a bubble. */
export function useTour({ engine, worldRef, steps, onEnd }: TourOptions) {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const [touring, setTouring] = useState(false);
  const active = useRef(false);

  const stop = useCallback(() => {
    active.current = false;
    setTouring(false);
    setBubble(null);
  }, []);

  const end = useCallback(() => {
    stop();
    onEnd();
  }, [stop, onEnd]);

  const runStep = useCallback(
    async (index: number) => {
      const step = steps[index];
      const world = worldRef.current;
      if (!step || !world) return;
      setBubble(null);
      await engine.flyTo(engine.fit(measureZone(world, step.zone)), 1100, { x: step.at[0], y: step.at[1] });
      if (!active.current) return;
      const last = index === steps.length - 1;
      setBubble({
        text: step.text,
        progress: `${index + 1}/${steps.length}`,
        actions: last
          ? [{ label: 'Explore', onClick: end, primary: true }]
          : [
              { label: 'Next →', onClick: () => void runStep(index + 1), primary: true },
              { label: 'Skip', onClick: end },
            ],
      });
    },
    [engine, worldRef, steps, end],
  );

  const start = useCallback(() => {
    active.current = true;
    setTouring(true);
    void runStep(0);
  }, [runStep]);

  /** Show a one-off message with buttons, such as the first-visit greeting. */
  const say = useCallback((next: Bubble | null) => setBubble(next), []);

  return { bubble, touring, start, stop, end, say };
}
