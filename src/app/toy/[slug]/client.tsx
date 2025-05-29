"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import Scene from '@/components/canvas/Scene';
import { useState } from 'react';

// Interface definitions
export interface Toy {
  id: string;
  name: string;
  slug: string;
  inventor: string;
  year: number;
  description: string;
  fullDescription: string;
  image: string; // URL or path to an image
  inventorBio: string;
  timeline: { year: number; event: string }[];
  sources: { title: string; url: string }[];
  categories: string[];
  relatedResearch: { title: string; journal: string; year: number; summary: string; url: string }[];
}

// Client component for the toy display
export function ToyDisplay({ toy }: { toy: Toy }) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const paragraphs = toy.fullDescription
    .split('\n')
    .map((p: string) => p.trim())
    .filter((p: string) => p);
  const displayedParagraphs = showFullDesc ? paragraphs : paragraphs.slice(0, 2);

  return (
    <main className="min-h-screen">
      {/* Navigation Breadcrumb */}
      <div className="w-full border-b border-foreground/10">
        <div className="max-w-5xl mx-auto py-4 px-4 md:px-8 lg:px-16">
          <Link href="/collection" className="text-sm hover:text-accent transition-colors">
            ← Back to Collection
          </Link>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto py-8 px-4 md:px-8 lg:px-16">
        {/* Asymmetric Grid */}
        <div className="asymmetric-grid mb-8">
          <div>
            {/* Toy Image */}
            <div className="glass-panel p-4 mb-6 flex flex-col items-center">
              <img src={toy.image} alt={toy.name} className="w-64 h-64 object-contain rounded-lg shadow-lg mb-4 border border-foreground/10 bg-white/10" />
              {/* 3D Model Viewer */}
              <Scene />
              <div className="mt-4 text-sm text-foreground/70">
                Drag to rotate • Scroll to zoom • Double-click to reset
              </div>
            </div>
          </div>
          
          <div>
            {/* Toy Metadata */}
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{toy.name}</h1>
            <p className="text-foreground/70 mb-6">c. {toy.year} • {toy.inventor}</p>
            
            {/* Inventor Bio */}
            <div className="mb-6">
              <h2 className="text-xl mb-2">Inventor Bio</h2>
              <p className="text-foreground/80 text-sm">{toy.inventorBio}</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl mb-2">Description</h2>
              <p>{toy.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <motion.button
                className="px-4 py-2 border border-foreground rounded-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Download 3D Model
              </motion.button>
              <motion.button
                className="px-4 py-2 border border-foreground rounded-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                Share
              </motion.button>
            </div>
            
            <div className="border-t border-foreground/10 pt-4">
              <h2 className="text-xl mb-2">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {toy.categories.map((cat) => (
                  <span key={cat} className="px-3 py-1 text-sm bg-foreground/5 rounded-full">{cat}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Timeline */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl mb-4 text-stroke">Timeline</h2>
          <ul className="border-l-2 border-accent/40 pl-6 space-y-2">
            {toy.timeline.map((item, idx) => (
              <li key={idx} className="relative">
                <span className="absolute -left-3 top-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
                <span className="font-semibold mr-2">{item.year > 0 ? item.year : `${-item.year} BCE`}:</span>
                <span>{item.event}</span>
              </li>
            ))}
          </ul>
        </motion.section>
        
        {/* Detailed Description */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl mb-4 text-stroke">Historical Context & Significance</h2>
          <div className="prose prose-invert max-w-none">
            {displayedParagraphs.map((para: string, idx: number) => (
              <motion.p
                key={idx}
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                {para}
              </motion.p>
            ))}
            <motion.button
              onClick={() => setShowFullDesc(!showFullDesc)}
              className="mt-4 px-4 py-2 border border-foreground rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {showFullDesc ? 'Show Less' : 'Read More'}
            </motion.button>
          </div>
        </motion.section>
        
        {/* Related Research */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl mb-4 text-stroke">Related Research</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {toy.relatedResearch.map((item, idx) => (
              <motion.div
                key={idx}
                className="border border-foreground/10 p-4 rounded-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <h3 className="font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-foreground/70 mb-2">{item.journal}, {item.year}</p>
                <p className="text-sm mb-4">{item.summary}</p>
                <a href={item.url} className="text-accent text-sm" target="_blank" rel="noopener noreferrer">Download PDF →</a>
              </motion.div>
            ))}
          </div>
        </motion.section>
        
        {/* Sources */}
        <motion.section
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl mb-4 text-stroke">Sources & Further Reading</h2>
          <ul className="list-disc pl-6 space-y-2">
            {toy.sources.map((src, idx) => (
              <li key={idx}>
                <a href={src.url} className="text-accent underline" target="_blank" rel="noopener noreferrer">{src.title}</a>
              </li>
            ))}
          </ul>
        </motion.section>
        
        {/* More from Collection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl mb-4 text-stroke">More to Explore</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/toy/zoetrope" className="group">
              <motion.div
                className="border border-foreground/10 rounded-lg overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="aspect-square bg-foreground/5 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-foreground/30">
                    Z
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium group-hover:text-accent transition-colors">Zoetrope</h3>
                  <p className="text-sm text-foreground/70">1834 • William George Horner</p>
                </div>
              </motion.div>
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

// NotFound client component
export function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-lg mb-6">Toy not found.</p>
        <Link
          href="/collection"
          className="inline-block text-accent hover:underline"
        >
          ← Back to Collection
        </Link>
      </motion.div>
    </main>
  );
} 