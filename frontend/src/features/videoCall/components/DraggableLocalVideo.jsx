import React, { useState, useEffect, useRef, useCallback } from 'react';
import LocalVideo from './LocalVideo.jsx';

const DraggableLocalVideo = ({
    stream,
    isVideoOff,
    isMuted,
    containerRef,
    className = '',
}) => {
    const elementRef = useRef(null);
    const [position, setPosition] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const isDraggingRef = useRef(false);
    const startPointerRef = useRef({ x: 0, y: 0 });
    const startPosRef = useRef({ x: 0, y: 0 });
    const currentPosRef = useRef({ x: 0, y: 0 });
    const hasMovedRef = useRef(false);

    // Calculate initial position at bottom-right of container
    const getInitialPosition = useCallback(() => {
        if (!containerRef?.current || !elementRef?.current) {
            return { x: 0, y: 0 };
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = elementRef.current.getBoundingClientRect();

        const elemW = elementRect.width > 0 ? elementRect.width : (window.innerWidth < 768 ? 128 : 192);
        const elemH = elementRect.height > 0 ? elementRect.height : (window.innerWidth < 768 ? 176 : 256);

        const marginX = 20;
        const marginY = 112; // Above bottom call controls

        const x = Math.max(12, containerRect.width - elemW - marginX);
        const y = Math.max(12, containerRect.height - elemH - marginY);

        return { x, y };
    }, [containerRef]);

    // Clamp coordinates to container boundaries
    const clampPosition = useCallback((x, y) => {
        if (!containerRef?.current || !elementRef?.current) {
            return { x, y };
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = elementRef.current.getBoundingClientRect();

        const elemW = elementRect.width > 0 ? elementRect.width : (window.innerWidth < 768 ? 128 : 192);
        const elemH = elementRect.height > 0 ? elementRect.height : (window.innerWidth < 768 ? 176 : 256);

        const padding = 12; // Safety margin inside screen edges

        const minX = padding;
        const maxX = Math.max(minX, containerRect.width - elemW - padding);
        const minY = padding;
        const maxY = Math.max(minY, containerRect.height - elemH - padding);

        const clampedX = Math.max(minX, Math.min(x, maxX));
        const clampedY = Math.max(minY, Math.min(y, maxY));

        return { x: clampedX, y: clampedY };
    }, [containerRef]);

    // Initialize or reset position on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            const initialPos = getInitialPosition();
            currentPosRef.current = initialPos;
            setPosition(initialPos);
        }, 80);

        return () => clearTimeout(timer);
    }, [getInitialPosition]);

    // Handle container resize & orientation changes
    useEffect(() => {
        const handleResize = () => {
            if (currentPosRef.current) {
                const clamped = clampPosition(currentPosRef.current.x, currentPosRef.current.y);
                currentPosRef.current = clamped;
                setPosition(clamped);
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, [clampPosition]);

    // Drag Movement Handler (used by global window listeners)
    const onDragMove = useCallback((clientX, clientY) => {
        if (!isDraggingRef.current || !elementRef.current) return;

        const dx = clientX - startPointerRef.current.x;
        const dy = clientY - startPointerRef.current.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 4 && !hasMovedRef.current) {
            hasMovedRef.current = true;
            setIsDragging(true);
        }

        if (hasMovedRef.current) {
            const rawX = startPosRef.current.x + dx;
            const rawY = startPosRef.current.y + dy;

            const clamped = clampPosition(rawX, rawY);
            currentPosRef.current = clamped;

            elementRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0px)`;
        }
    }, [clampPosition]);

    const onDragEnd = useCallback(() => {
        if (!isDraggingRef.current) return;

        isDraggingRef.current = false;
        setIsDragging(false);

        if (hasMovedRef.current) {
            setPosition({ ...currentPosRef.current });
        }
    }, []);

    // Pointer Down (Mouse, Touch & Pen)
    const handleStart = (clientX, clientY) => {
        isDraggingRef.current = true;
        hasMovedRef.current = false;

        startPointerRef.current = { x: clientX, y: clientY };
        startPosRef.current = { ...currentPosRef.current };
    };

    const handlePointerDown = (e) => {
        if (e.target.closest('button')) return;

        handleStart(e.clientX, e.clientY);

        const handlePointerMove = (ev) => {
            onDragMove(ev.clientX, ev.clientY);
        };

        const handlePointerUp = () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointercancel', handlePointerUp);
            onDragEnd();
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: false });
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('pointercancel', handlePointerUp);
    };

    const handleTouchStart = (e) => {
        if (e.target.closest('button')) return;
        const touch = e.touches[0];
        if (!touch) return;

        handleStart(touch.clientX, touch.clientY);

        const handleTouchMove = (ev) => {
            if (ev.cancelable) ev.preventDefault();
            const t = ev.touches[0];
            if (t) {
                onDragMove(t.clientX, t.clientY);
            }
        };

        const handleTouchEnd = () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
            onDragEnd();
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('touchcancel', handleTouchEnd);
    };

    const currentX = position?.x ?? 0;
    const currentY = position?.y ?? 0;

    return (
        <div
            ref={elementRef}
            onPointerDown={handlePointerDown}
            onTouchStart={handleTouchStart}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translate3d(${currentX}px, ${currentY}px, 0px)`,
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserDrag: 'none',
                pointerEvents: 'auto',
            }}
            className={`z-30 transition-shadow duration-200 cursor-grab active:cursor-grabbing ${
                isDragging ? 'shadow-2xl scale-[1.02] ring-2 ring-primary/40' : 'shadow-xl'
            } ${className}`}
        >
            <LocalVideo
                stream={stream}
                isVideoOff={isVideoOff}
                isMuted={isMuted}
                className="w-full h-full"
            />
        </div>
    );
};

export default DraggableLocalVideo;
