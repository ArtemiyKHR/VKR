import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import '../styles/StatsGrid.css';

const stats = [
    { number: 1.5, suffix: '+', label: 'года опыта' },
    { number: 400, suffix: '+', label: 'довольных клиентов' },
    { number: 2, suffix: '', label: 'дня среднее время ремонтов' },
];

const StatsGrid = () => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    const countRefs = useRef([]);

    useEffect(() => {
        if (inView) {
            countRefs.current.forEach((element, index) => {
                const target = stats[index].number;
                const suffix = stats[index].suffix;
                let start = 0;
                const duration = 2000;
                const increment = target / (duration / 16);

                const updateCount = () => {
                    start += increment;
                    if (start < target) {
                        element.textContent = `${start.toFixed(1)}${suffix}`;
                        requestAnimationFrame(updateCount);
                    } else {
                        element.textContent = `${target}${suffix}`;
                    }
                };

                requestAnimationFrame(updateCount);
            });
        }
    }, [inView]);

    return (
        <div className="stats-grid" ref={ref}>
            {stats.map((stat, index) => (
                <div className="stat-item" key={index}>
                    <span
                        className="stat-number"
                        ref={(el) => (countRefs.current[index] = el)}
                    >
                        0{stat.suffix}
                    </span>
                    <span className="stat-label">{stat.label}</span>
                </div>
            ))}
        </div>
    );
};

export default StatsGrid;