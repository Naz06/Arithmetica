import { useState, useMemo, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  estimatedItemHeight?: number;
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions = {}
) {
  const {
    itemHeight = 80,
    overscan = 5,
    estimatedItemHeight = 80,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [containerRef, setContainerRef] = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getVisibleRange = useCallback((): { start: number; end: number } => {
    if (!containerRef.current) return { start: 0, end: 0 };

    const { itemHeight, overscan } = options;
    const visibleCount = Math.ceil(viewportHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + overscan, items.length);

    return { start: startIndex, end: endIndex };
  }, [scrollTop, viewportHeight, containerRef, itemHeight, overscan]);

  const canScrollDown = useMemo(() => {
    return scrollTop > 0;
  }, [scrollTop]);

  const canScrollUp = useMemo(() => {
    if (!containerRef.current) return false;
    return scrollTop < (containerRef.current.scrollHeight - viewportHeight);
  }, [scrollTop, viewportHeight, containerRef]);

  const scrollToIndex = useCallback((index: number) => {
    const { itemHeight } = options;
    const targetScrollTop = index * itemHeight;
    setScrollTop(targetScrollTop);
  }, [itemHeight]);

  return {
    scrollTop,
    setScrollTop,
    getVisibleRange,
    canScrollDown,
    canScrollUp,
    scrollToIndex,
    containerRef,
  };
}
