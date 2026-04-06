import React, { useState, useEffect } from 'react';

interface Particle {
  left: string;
  top: string;
  duration: number;
  delay: number;
}

interface ParticlesProps {
  count?: number;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    left: `${Math.random() * 90 + 5}%`,
    top: `${Math.random() * 90 + 5}%`,
    duration: Math.random() * 2 + 3.5,
    delay: Math.random() * 2
  }));
}

export default function Particles({ count = 20 }: ParticlesProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setParticles(generateParticles(count));
  }, [count]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((particle, index) => (
        <div
          key={`particle-${index}`}
          className="absolute w-2 h-2 opacity-40 rounded-full"
          style={{
            left: particle.left,
            top: particle.top,
            background: `linear-gradient(45deg, rgba(0, 212, 170, 0.6), rgba(59, 130, 246, 0.4))`,
            animation: `float ${particle.duration}s ease-in-out infinite ${particle.delay}s`,
            willChange: 'transform'
          }}
        />
      ))}
    </div>
  );
}
