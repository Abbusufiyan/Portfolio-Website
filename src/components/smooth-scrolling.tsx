import React from 'react';
import { ReactLenis } from 'lenis/react';

interface SmoothScrollingProps {
  children: React.ReactNode;
}

export function SmoothScrolling({ children }: SmoothScrollingProps) {
  // We use the root ReactLenis provider.
  // By default, it runs requestAnimationFrame and cleans up automatically on unmount.
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.2, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
