
import React, { useEffect, useState } from 'react';

interface NumberTickerProps {
    value: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    fractionDigits?: number;
}

const NumberTicker: React.FC<NumberTickerProps> = ({ value, prefix = '', suffix = '', className = '', fractionDigits = 2 }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        // Simple interpolation for smooth transition
        let start = displayValue;
        const end = value;
        const duration = 1000; // 1 second
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            
            const current = start + (end - start) * ease;
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [value]);

    return (
        <span className={className}>
            {prefix}{displayValue.toLocaleString('en-US', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}{suffix}
        </span>
    );
};

export default NumberTicker;
