import { useEffect, useRef } from 'react';

export function useSectionNavigation(sectionIds: string[]) {
  const accumulatedDelta = useRef(0);
  const isNavigating = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const currentIndex = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const lastEventTime = useRef(0);
  const hasNavigatedInCurrentGesture = useRef(false);

  useEffect(() => {
    if (sectionIds.length === 0) return;

    // Intersection Observer to keep currentIndex synced naturally
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionIds.indexOf(entry.target.id);
            if (idx !== -1 && !isNavigating.current) {
              currentIndex.current = idx;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const threshold = window.innerHeight * 0.30;

    const navigateTo = (nextIndex: number) => {
      if (nextIndex < 0 || nextIndex >= sectionIds.length) return;
      const targetEl = document.getElementById(sectionIds[nextIndex]);
      if (targetEl) {
        isNavigating.current = true;
        currentIndex.current = nextIndex;
        const rect = targetEl.getBoundingClientRect();
        const blockAlign = rect.height <= window.innerHeight ? 'center' : 'start';
        targetEl.scrollIntoView({ behavior: 'smooth', block: blockAlign });

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          isNavigating.current = false;
        }, 800); // 800ms cooldown for the smooth scroll transition
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.defaultPrevented) return;

      const now = Date.now();
      const timeSinceLastEvent = now - lastEventTime.current;
      lastEventTime.current = now;

      // If there's a > 150ms gap, we consider the previous gesture/inertia fully finished.
      if (timeSinceLastEvent > 150) {
        hasNavigatedInCurrentGesture.current = false;
        accumulatedDelta.current = 0;
      }

      // If we are currently transitioning to a section, block native scrolling
      if (isNavigating.current) {
        e.preventDefault();
      }

      // 1. If we already triggered a navigation during THIS continuous gesture (including inertia),
      // we must ignore the rest of the delta so it doesn't skip multiple sections.
      if (hasNavigatedInCurrentGesture.current) {
        e.preventDefault();
        return;
      }

      // 2. If a PREVIOUS transition is still animating, do not accumulate delta for a new one.
      if (isNavigating.current) {
        e.preventDefault();
        return;
      }

      // Reset accumulation if direction changes mid-gesture
      if (Math.sign(e.deltaY) !== Math.sign(accumulatedDelta.current) && accumulatedDelta.current !== 0) {
        accumulatedDelta.current = 0;
      }

      accumulatedDelta.current += e.deltaY;

      if (Math.abs(accumulatedDelta.current) >= threshold) {
        e.preventDefault(); // Take over scroll
        const direction = Math.sign(accumulatedDelta.current);
        const nextIndex = currentIndex.current + direction;
        
        if (nextIndex >= 0 && nextIndex < sectionIds.length) {
          hasNavigatedInCurrentGesture.current = true;
          navigateTo(nextIndex);
        }
        accumulatedDelta.current = 0;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.defaultPrevented) return;
      touchStartY.current = e.touches[0].clientY;
      accumulatedDelta.current = 0;
      
      const now = Date.now();
      if (now - lastEventTime.current > 150) {
        hasNavigatedInCurrentGesture.current = false;
      }
      lastEventTime.current = now;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.defaultPrevented || touchStartY.current === null) return;

      const now = Date.now();
      const timeSinceLastEvent = now - lastEventTime.current;
      lastEventTime.current = now;

      if (timeSinceLastEvent > 150) {
        hasNavigatedInCurrentGesture.current = false;
        accumulatedDelta.current = 0;
      }

      if (isNavigating.current) {
        e.preventDefault();
      }

      if (hasNavigatedInCurrentGesture.current) {
        e.preventDefault();
        return;
      }

      if (isNavigating.current) {
        e.preventDefault();
        return;
      }

      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY.current - touchY;

      if (Math.sign(deltaY) !== Math.sign(accumulatedDelta.current) && accumulatedDelta.current !== 0) {
        accumulatedDelta.current = 0;
      }
      
      accumulatedDelta.current = deltaY;

      if (Math.abs(accumulatedDelta.current) >= threshold * 0.8) {
        e.preventDefault();
        const direction = Math.sign(accumulatedDelta.current);
        const nextIndex = currentIndex.current + direction;
        
        if (nextIndex >= 0 && nextIndex < sectionIds.length) {
          hasNavigatedInCurrentGesture.current = true;
          navigateTo(nextIndex);
        }
        
        touchStartY.current = touchY;
        accumulatedDelta.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      observer.disconnect();
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [sectionIds]);
}
