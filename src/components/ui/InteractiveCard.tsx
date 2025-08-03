import React, { useState, useRef, useEffect } from 'react';

interface InteractiveCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: 'scale' | 'glow' | 'lift' | 'rotate' | 'tilt';
  clickEffect?: 'ripple' | 'bounce' | 'pulse' | 'none';
  borderRadius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shadow?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  gradient?: boolean;
  glowColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  interactive?: boolean;
}

export const InteractiveCard: React.FC<InteractiveCardProps> = ({
  children,
  className = '',
  hoverEffect = 'scale',
  clickEffect = 'ripple',
  borderRadius = 'lg',
  shadow = 'md',
  gradient = false,
  glowColor = '#fbbf24',
  onClick,
  disabled = false,
  interactive = true
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle click ripple effect
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !interactive) return;

    if (clickEffect === 'ripple') {
      const rect = cardRef.current?.getBoundingClientRect();
      if (rect) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const newRipple = { id: Date.now(), x, y };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 600);
      }
    }

    if (onClick) {
      onClick();
    }
  };

  // Handle mouse events
  const handleMouseEnter = () => {
    if (!disabled && interactive) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (!disabled && interactive) setIsHovered(false);
  };

  const handleMouseDown = () => {
    if (!disabled && interactive) setIsPressed(true);
  };

  const handleMouseUp = () => {
    if (!disabled && interactive) setIsPressed(false);
  };

  // Get border radius classes
  const getBorderRadiusClass = () => {
    const radiusMap = {
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      xl: 'rounded-xl',
      '2xl': 'rounded-2xl'
    };
    return radiusMap[borderRadius];
  };

  // Get shadow classes
  const getShadowClass = () => {
    const shadowMap = {
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
      xl: 'shadow-xl',
      '2xl': 'shadow-2xl'
    };
    return shadowMap[shadow];
  };

  // Get hover effect classes
  const getHoverEffectClass = () => {
    if (!interactive || disabled) return '';
    
    switch (hoverEffect) {
      case 'scale':
        return 'hover:scale-105';
      case 'glow':
        return `hover:shadow-lg hover:shadow-[${glowColor}]/20`;
      case 'lift':
        return 'hover:-translate-y-2';
      case 'rotate':
        return 'hover:rotate-1';
      case 'tilt':
        return 'hover:rotate-2 hover:scale-105';
      default:
        return '';
    }
  };

  // Get click effect classes
  const getClickEffectClass = () => {
    if (!interactive || disabled) return '';
    
    switch (clickEffect) {
      case 'bounce':
        return isPressed ? 'animate-bounce' : '';
      case 'pulse':
        return isPressed ? 'animate-pulse' : '';
      default:
        return '';
    }
  };

  // Base classes
  const baseClasses = `
    relative overflow-hidden transition-all duration-300 ease-out cursor-pointer
    ${getBorderRadiusClass()}
    ${getShadowClass()}
    ${getHoverEffectClass()}
    ${getClickEffectClass()}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${gradient ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gray-800'}
    ${interactive ? 'select-none' : ''}
  `;

  return (
    <div
      ref={cardRef}
      className={`${baseClasses} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      style={{
        transform: isHovered && hoverEffect === 'tilt' 
          ? `perspective(1000px) rotateX(5deg) rotateY(5deg) scale(1.05)`
          : undefined,
        boxShadow: isHovered && hoverEffect === 'glow'
          ? `0 10px 25px -5px ${glowColor}20, 0 10px 10px -5px ${glowColor}10`
          : undefined
      }}
    >
      {/* Glow effect overlay */}
      {hoverEffect === 'glow' && isHovered && (
        <div 
          className="absolute inset-0 opacity-20 rounded-lg"
          style={{
            background: `radial-gradient(circle at center, ${glowColor}40 0%, transparent 70%)`
          }}
        />
      )}

      {/* Ripple effects */}
      {clickEffect === 'ripple' && ripples.map(ripple => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        >
          <div 
            className="w-full h-full rounded-full opacity-30 animate-ping"
            style={{ backgroundColor: glowColor }}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-yellow-600/5 rounded-lg" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
