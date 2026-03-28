import React, { useRef, useState, useCallback } from "react";
import { View } from "react-native";
import { Board } from "./Board";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3.0;

export function BoardViewport() {
  const [scale, setScale] = useState(0.8);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale * delta));

      // Zoom toward mouse position
      const scaleChange = newScale / scale;
      const newOffsetX = mouseX - (mouseX - offset.x) * scaleChange;
      const newOffsetY = mouseY - (mouseY - offset.y) * scaleChange;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    },
    [scale, offset]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 1 && e.button !== 2) {
        // Allow left click to pass through for cell taps
        // Only middle/right click for panning
        if (e.button === 0 && e.shiftKey) {
          // Shift+left click for pan
          e.preventDefault();
          setIsDragging(true);
          lastPos.current = { x: e.clientX, y: e.clientY };
        }
        return;
      }
      e.preventDefault();
      setIsDragging(true);
      lastPos.current = { x: e.clientX, y: e.clientY };
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <View className="flex-1 overflow-hidden bg-slate-950">
      <div
        ref={containerRef}
        onWheel={handleWheel as any}
        onMouseDown={handleMouseDown as any}
        onMouseMove={handleMouseMove as any}
        onMouseUp={handleMouseUp as any}
        onMouseLeave={handleMouseUp as any}
        onContextMenu={(e: any) => e.preventDefault()}
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          cursor: isDragging ? "grabbing" : "default",
          position: "relative",
        }}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "0 0",
            position: "absolute",
          }}
        >
          <Board />
        </div>
      </div>
    </View>
  );
}
