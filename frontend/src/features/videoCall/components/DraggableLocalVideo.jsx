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

    const isPointerDownRef = useRef(false);
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

        const marginX = 24;
        const marginY = window.innerWidth < 768 ? 112 : 112; // Above bottom controls

        const x = Math.max(16, containerRect.width - elementRect.width - marginX);
        const y = Math.max(16, containerRect.height - elementRect.height - marginY);

        return { x, y };
    }, [containerRef]);

    // Clamp coordinates to container boundaries
    const clampPosition = useCallback((x, y) => {
        if (!containerRef?.current || !elementRef?.current) {
            return { x, y };
        }

        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = elementRef.current.getBoundingClientRect();

        const padding = 12; // Safety margin inside screen edges

        const minX = padding;
        const maxX = Math.max(minX, containerRect.width - elementRect.width - padding);
        const minY = padding;
        const maxY = Math.max(minY, containerRect.height - elementRect.height - padding);

        const clampedX = Math.max(minX, Math.min(x, maxX));
        const clampedY = Math.max(minY, Math.min(y, maxY));

        return { x: clampedX, y: clampedY };
    }, [containerRef]);

    // Initialize or reset position
    useEffect(() => {
        const timer = setTimeout(() => {
            const initialPos = getInitialPosition();
            currentPosRef.current = initialPos;
            setPosition(initialPos);
        }, 100);

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

    // Pointer Events Handlers (Mouse + Touch + Pen)
    const handlePointerDown = (e) => {
        if (!elementRef.current) return;

        // Prevent dragging if clicking button inside preview
        if (e.target.closest('button')) return;

        isPointerDownRef.current = true;
        hasMovedRef.current = false;

        startPointerRef.current = { x: e.clientX, y: e.clientY };
        startPosRef.current = { ...currentPosRef.current };

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isPointerDownRef.current || !elementRef.current) return;

        const dx = e.clientX - startPointerRef.current.x;
        const dy = e.clientY - startPointerRef.current.y;
        const distance = Math.hypot(dx, dy);

        // Movement threshold check (5px) to prevent accidental taps from starting drag
        if (distance > 5 && !hasMovedRef.current) {
            hasMovedRef.current = true;
            setIsDragging(true);
        }

        if (hasMovedRef.current) {
            const rawX = startPosRef.current.x + dx;
            const rawY = startPosRef.current.y + dy;

            const clamped = clampPosition(rawX, rawY);
            currentPosRef.current = clamped;

            // Direct GPU-accelerated transform to avoid React re-render lag
            elementRef.current.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0px)`;
        }
    };

    const handlePointerUp = (e) => {
        if (!isPointerDownRef.current) return;

        isPointerDownRef.current = false;

        try {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
            }
        } catch (err) {
            // Ignore capture release error if already released
        }

        if (hasMovedRef.current) {
            setIsDragging(false);
            setPosition({ ...currentPosRef.current });
        }
    };

    const currentX = position?.x ?? 0;
    const currentY = position?.y ?? 0;

    return (
        <div
            ref={elementRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `translate3d(${currentX}px, ${currentY}px, 0px)`,
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserDrag: 'none',
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
