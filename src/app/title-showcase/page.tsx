'use client';

import React, { useState } from 'react';
import { PhilosophicalToysTitle } from '@/components/typography/PhilosophicalToysTitle';
import { ModernTitle } from '@/components/typography/ModernTitle';
import dynamic from 'next/dynamic';

const DynamicModernTitleSketch = dynamic(
  () => import('@/components/p5/ModernTitleSketch'),
  { ssr: false }
);

export default function TitleShowcase() {
  const [currentExample, setCurrentExample] = useState('modern');

  const examples = [
    { id: 'modern', name: 'Modern CSS Title', description: 'Clean, geometric typography inspired by Tim Rodenbroeker' },
    { id: 'variants', name: 'Title Variants', description: 'Different styles and sizes' },
    { id: 'p5', name: 'P5.js Interactive', description: 'Animated version with grid system' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium" style={{ fontFamily: 'var(--font-primary)' }}>
              Title Showcase
            </h1>
            <div className="flex gap-4">
              {examples.map((example) => (
                <button
                  key={example.id}
                  onClick={() => setCurrentExample(example.id)}
                  className={`px-3 py-1 text-sm transition-colors ${
                    currentExample === example.id
                      ? 'text-white border-b border-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-secondary)' }}
                >
                  {example.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-20 pb-10">
        {currentExample === 'modern' && (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'var(--font-primary)' }}>
                Modern CSS Title
              </h2>
              <p className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-secondary)' }}>
                Inspired by Tim Rodenbroeker&apos;s clean, geometric approach
              </p>
            </div>
            <ModernTitle animated={true} />
          </div>
        )}

        {currentExample === 'variants' && (
          <div className="container mx-auto px-6 space-y-16">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'var(--font-primary)' }}>
                Style Variations
              </h2>
              <p className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-secondary)' }}>
                Different approaches to the philosophical toys title
              </p>
            </div>

            {/* Primary Variant */}
            <div className="border border-white/10 rounded-lg p-8 bg-white/5">
              <h3 className="text-lg font-medium mb-4 text-white/80" style={{ fontFamily: 'var(--font-primary)' }}>
                Primary (Default)
              </h3>
              <div className="flex justify-center">
                <PhilosophicalToysTitle variant="primary" size="medium" animate={false} />
              </div>
            </div>

            {/* Minimal Variant */}
            <div className="border border-white/10 rounded-lg p-8 bg-white/5">
              <h3 className="text-lg font-medium mb-4 text-white/80" style={{ fontFamily: 'var(--font-primary)' }}>
                Minimal
              </h3>
              <div className="flex justify-center">
                <PhilosophicalToysTitle variant="minimal" size="medium" animate={false} />
              </div>
            </div>

            {/* Ornate Variant */}
            <div className="border border-white/10 rounded-lg p-8 bg-white/5">
              <h3 className="text-lg font-medium mb-4 text-white/80" style={{ fontFamily: 'var(--font-primary)' }}>
                Ornate
              </h3>
              <div className="flex justify-center">
                <PhilosophicalToysTitle variant="ornate" size="medium" animate={false} />
              </div>
            </div>

            {/* Hero Size */}
            <div className="border border-white/10 rounded-lg p-8 bg-white/5">
              <h3 className="text-lg font-medium mb-4 text-white/80" style={{ fontFamily: 'var(--font-primary)' }}>
                Hero Size
              </h3>
              <div className="flex justify-center">
                <PhilosophicalToysTitle variant="primary" size="hero" animate={false} />
              </div>
            </div>
          </div>
        )}

        {currentExample === 'p5' && (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light mb-2" style={{ fontFamily: 'var(--font-primary)' }}>
                P5.js Interactive Title
              </h2>
              <p className="text-white/60 text-sm" style={{ fontFamily: 'var(--font-secondary)' }}>
                Animated with precise geometric grid system
              </p>
            </div>
            <div className="border border-white/10 rounded-lg p-4 bg-white/5">
              <DynamicModernTitleSketch
                text="philosophical toys"
                style="rodenbroeker"
                paused={false}
              />
            </div>
            <div className="text-center max-w-md">
              <p className="text-white/60 text-xs" style={{ fontFamily: 'var(--font-secondary)' }}>
                Features formation phase, display with subtle breathing animation, and geometric departure
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Back to Main */}
      <div className="fixed bottom-6 left-6">
        <a
          href="/"
          className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white/80 hover:text-white transition-colors text-sm"
          style={{ fontFamily: 'var(--font-secondary)' }}
        >
          ← Back to Main
        </a>
      </div>
    </div>
  );
}