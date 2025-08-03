import React, { useState, useEffect, useRef } from 'react';

interface InteractiveGradientProps {
  children: React.ReactNode;
  className?: string;
  gradientColors?: string[];
  animationSpeed?: 'slow' | 'medium' | 'fast';
  intensity?: 'low' | 'medium' | 'high';
  followMouse?: boolean;
  pulseOnHover?: boolean;
  borderRadius?: string;
}

export const InteractiveGradient: React.FC<InteractiveGradientProps> = ({
  children,
  className = '',
  gradientColors = ['#fbbf24', '#f59e0b', '#d97706'],
  animationSpeed = 'medium',
  intensity = 'medium',
  followMouse = true,
  pulseOnHover = true,
  borderRadius = '0.5rem'
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!followMouse || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setMousePosition({ x, y });
  };

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (followMouse) {
      setMousePosition({ x: 50, y: 50 }); // Reset to center
    }
  };

  // Get animation duration based on speed
  const getAnimationDuration = () => {
    switch (animationSpeed) {
      case 'slow':
        return '3s';
      case 'fast':
        return '1s';
      default:
        return '2s';
    }
  };

  // Get intensity multiplier
  const getIntensityMultiplier = () => {
    switch (intensity) {
      case 'low':
        return 0.3;
      case 'high':
        return 0.8;
      default:
        return 0.5;
    }
  };

  // Create gradient background
  const createGradient = () => {
    const intensityMultiplier = getIntensityMultiplier();
    const colors = gradientColors.map(color => `${color}${Math.round(intensityMultiplier * 255).toString(16).padStart(2, '0')}`);
    
    if (followMouse && isHovered) {
      return `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, ${colors.join(', ')})`;
    }
    
    return `linear-gradient(45deg, ${colors.join(', ')})`;
  };

  // Keyframes for pulse animation
  const pulseKeyframes = `
    @keyframes gradientPulse {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.6; }
    }
  `;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ borderRadius }}
    >
      {/* Inject keyframes */}
      <style>{pulseKeyframes}</style>
      
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: createGradient(),
          opacity: isHovered ? getIntensityMultiplier() : getIntensityMultiplier() * 0.5,
          transition: `all ${getAnimationDuration()} ease-out`,
          animation: pulseOnHover && isHovered ? `gradientPulse ${getAnimationDuration()} infinite` : undefined,
          borderRadius
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
