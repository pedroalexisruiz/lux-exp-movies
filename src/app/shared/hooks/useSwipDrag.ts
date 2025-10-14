import { useCallback, useMemo, useRef, useState } from 'react';

type UseSwipeDragOptions = {
  stepPx: number;
  onNext: () => void;
  onPrev: () => void;
  axis?: 'x' | 'y';
  lockThresholdPx?: number;
  distanceThresholdPx?: number;
  distanceThresholdRatio?: number;
  flickVelocityPxPerMs?: number;
  enabled?: boolean;
  rtl?: boolean;
};

type DragBind = {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onPointerLeave: (e: React.PointerEvent) => void;
};

export function useSwipeDrag({
  stepPx,
  onNext,
  onPrev,
  axis = 'x',
  lockThresholdPx = 8,
  distanceThresholdPx,
  distanceThresholdRatio = 0.25,
  flickVelocityPxPerMs = 0.05,
  enabled = true,
  rtl = false,
}: UseSwipeDragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const lastX = useRef(0);
  const lastTs = useRef(0);
  const velocityX = useRef(0);
  const lockedAxis = useRef<null | 'x' | 'y'>(null);

  const distanceThreshold = useMemo(
    () => distanceThresholdPx ?? Math.max(1, stepPx * distanceThresholdRatio),
    [distanceThresholdPx, stepPx, distanceThresholdRatio],
  );

  const startDrag = useCallback((x: number, y: number, ts: number) => {
    setIsDragging(true);
    setDragX(0);
    startX.current = x;
    startY.current = y;
    lastX.current = x;
    lastTs.current = ts;
    velocityX.current = 0;
    lockedAxis.current = null;
  }, []);

  const moveDrag = useCallback(
    (x: number, y: number, ts: number) => {
      if (!isDragging) return;

      if (!lockedAxis.current) {
        const dx = Math.abs(x - startX.current);
        const dy = Math.abs(y - startY.current);
        if (dx > lockThresholdPx || dy > lockThresholdPx) {
          lockedAxis.current = dx > dy ? 'x' : 'y';
        }
      }

      if (lockedAxis.current && lockedAxis.current !== axis) {
        cancelDrag();
        return;
      }

      const dx = x - startX.current;
      setDragX(dx);

      const dt = ts - lastTs.current || 1;
      velocityX.current = (x - lastX.current) / dt;
      lastX.current = x;
      lastTs.current = ts;
    },
    [axis, isDragging, lockThresholdPx],
  );

  const finish = useCallback(() => {
    if (!isDragging) return;

    const vx = velocityX.current;
    const abs = Math.abs(dragX);

    const draggedRight = dragX > 0;
    const toPrevLTR = draggedRight;

    const passedDistance = abs > distanceThreshold;
    const passedFlick = Math.abs(vx) > flickVelocityPxPerMs;

    if (passedDistance || passedFlick) {
      if (rtl) {
        if (toPrevLTR) onNext();
        else onPrev();
      } else {
        if (toPrevLTR) onPrev();
        else onNext();
      }
    }

    setIsDragging(false);
    setDragX(0);
    lockedAxis.current = null;
  }, [dragX, distanceThreshold, flickVelocityPxPerMs, isDragging, onNext, onPrev, rtl]);

  const cancelDrag = useCallback(() => {
    setIsDragging(false);
    setDragX(0);
    lockedAxis.current = null;
  }, []);

  const dragBind: DragBind = {
    onPointerDown: (e) => {
      if (!enabled) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      startDrag(e.clientX, e.clientY, e.timeStamp);
    },
    onPointerMove: (e) => {
      if (!enabled || !isDragging) return;
      e.preventDefault();
      moveDrag(e.clientX, e.clientY, e.timeStamp);
    },
    onPointerUp: () => {
      if (!enabled) return;
      finish();
    },
    onPointerCancel: () => {
      if (!enabled) return;
      cancelDrag();
    },
    onPointerLeave: () => {
      if (!enabled) return;
      if (isDragging) finish();
    },
  };

  return { isDragging, dragX, dragBind, cancelDrag };
}
