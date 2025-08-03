import React, { useState, useEffect, useRef } from 'react';

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  animationStyle?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'spring' | 'bounce';
  colorScheme?: 'default' | 'primary' | 'gradient';
  interactive?: boolean;
  className?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1.5,
  animationStyle = 'ease-out',
  colorScheme = 'default',
  interactive = false,
  className = ''
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  // Intersection Observer for triggering animation when element comes into view
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [isVisible]);

  // Animation effect
  useEffect(() => {
    if (!isVisible && !interactive) return;
    if (interactive && !isHovered && !isVisible) return;

    let startTime: number;
    let animationId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);

      // Apply easing function
      let easedProgress = progress;
      switch (animationStyle) {
        case 'ease-in':
          easedProgress = progress * progress;
          break;
        case 'ease-out':
          easedProgress = 1 - (1 - progress) * (1 - progress);
          break;
        case 'ease-in-out':
          easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          break;
        case 'spring':
          easedProgress = 1 - Math.cos(progress * Math.PI * 0.5);
          break;
        case 'bounce':
          if (progress < 1/2.75) {
            easedProgress = 7.5625 * progress * progress;
          } else if (progress < 2/2.75) {
            const p1 = progress - 1.5/2.75;
            easedProgress = 7.5625 * p1 * p1 + 0.75;
          } else if (progress < 2.5/2.75) {
            const p2 = progress - 2.25/2.75;
            easedProgress = 7.5625 * p2 * p2 + 0.9375;
          } else {
            const p3 = progress - 2.625/2.75;
            easedProgress = 7.5625 * p3 * p3 + 0.984375;
          }
          break;
        default:
          easedProgress = progress;
      }

      const newValue = easedProgress * value;
      setCurrentValue(newValue);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, isHovered, value, duration, animationStyle, interactive]);

  // Reset animation on hover for interactive mode
  const handleMouseEnter = () => {
    if (interactive) {
      setIsHovered(true);
      setCurrentValue(0);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setIsHovered(false);
    }
  };

  // Format the display value
  const formatValue = (val: number) => {
    return val.toFixed(decimals);
  };

  // Apply color scheme
  const getColorClasses = () => {
    switch (colorScheme) {
      case 'primary':
        return 'text-blue-600 font-semibold';
      case 'gradient':
        return 'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold';
      default:
        return '';
    }
  };

  return (
    <span
      ref={elementRef}
      className={`inline-block transition-all duration-300 ${getColorClasses()} ${className} ${
        interactive ? 'cursor-pointer hover:scale-105' : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {prefix}{formatValue(currentValue)}{suffix}
    </span>
  );
};
