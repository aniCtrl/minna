import { useRef, useState } from "react";

const SWIPE_THRESHOLD = 100;

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
}) {
  const startXRef = useRef(null);
  const deltaXRef = useRef(0);

  const [deltaX, setDeltaX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function onPointerDown(event) {
    startXRef.current = event.clientX;
    deltaXRef.current = 0;

    setDeltaX(0);
    setIsDragging(true);

    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    if (
      !isDragging ||
      startXRef.current === null
    ) {
      return;
    }

    const currentX = event.clientX;
    const newDeltaX = currentX - startXRef.current;

    deltaXRef.current = newDeltaX;
    setDeltaX(newDeltaX);
  }

  function resetGesture() {
    startXRef.current = null;
    deltaXRef.current = 0;

    setDeltaX(0);
    setIsDragging(false);
  }

  function onPointerUp(event) {
    if (
      !isDragging ||
      startXRef.current === null
    ) {
      return;
    }

    const finalDeltaX = deltaXRef.current;

    if (finalDeltaX >= SWIPE_THRESHOLD) {
      onSwipeRight?.();
    } else if (finalDeltaX <= -SWIPE_THRESHOLD) {
      onSwipeLeft?.();
    }

    event.currentTarget.releasePointerCapture?.(
      event.pointerId
    );

    resetGesture();
  }

  function onPointerCancel() {
    resetGesture();
  }

  return {
    deltaX,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}