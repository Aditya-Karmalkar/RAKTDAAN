import React, { useState, useEffect, useRef } from "react";

interface CounterProps {
    target: number;     // final no. the counter should reach
    label: string;      // label to show below
    duration?: number; // animation duration in ms
    suffix?: string;   // added suffix "+"" and "/7"
}

//Counter Component

const Counter: React.FC<CounterProps> = ({ target, label, duration = 2000, suffix = "+" }) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    //visibility detection 
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                //check if element is visible
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.8 } // 80% element visible before trigger
        );

        //attach observer to element 
        if (ref.current) {
            observer.observe(ref.current);
        }

        //cleanup function to disconnect observer when unmounting
        return () => observer.disconnect();
    }, []);

    //Counting Animation
    useEffect(() => {
        if (!isVisible) return;

        let startTime: number | null = null; // Track when animation started

        // EaseOutCubic → starts fast, ends slow
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime; // ms passed
            const progress = Math.min(elapsed / duration, 1); // normalize (0 → 1)

            // Apply easing function to progress
            const easedProgress = easeOutCubic(progress);

            // Update count based on eased progress
            setCount(Math.floor(easedProgress * target));

            // Continue animation until done
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(target); // Ensure exact target at end
            }
        };

        requestAnimationFrame(animate); // Start animation

    }, [isVisible, target, duration]);

    return (
        <div ref={ref} className="p-6 text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">
                {count}{suffix}
            </div>
            <div className="text-gray-700">{label}</div>
        </div>
    );
};

export default Counter;
