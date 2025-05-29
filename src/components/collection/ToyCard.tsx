import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Toy } from '@/data/toys';

interface ToyCardProps {
  toy: Toy;
  accentColor?: string;
}

const svgBg = (
  <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
    <circle cx="100" cy="100" r="80" fill="url(#paint0_radial)" fillOpacity="0.12" />
    <defs>
      <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientTransform="translate(100 100) scale(80)" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FF99" />
        <stop offset="1" stopColor="#00FF99" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

export const ToyCard: React.FC<ToyCardProps> = ({ toy, accentColor = '#00FF99' }) => {
  return (
    <Link href={`/toy/${toy.slug}`} className="group focus:outline-none">
      <motion.div
        className="relative border border-foreground/10 rounded-2xl overflow-hidden bg-white/5 shadow-lg hover:shadow-2xl transition-all duration-300"
        whileHover={{ scale: 1.04, rotate: -1 }}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="aspect-square flex items-center justify-center relative">
          {toy.video ? (
            <video
              src={toy.video}
              className="absolute inset-0 w-full h-full object-cover z-0"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : toy.image ? (
            <img
              src={toy.image}
              alt={toy.name}
              className="absolute inset-0 w-full h-full object-contain z-0"
              loading="lazy"
            />
          ) : (
            svgBg
          )}
          <span
            className="text-[3.5rem] font-black text-foreground/20 z-10 select-none drop-shadow-lg"
            style={{ letterSpacing: '-0.05em' }}
            aria-hidden
          >
            {toy.name.charAt(0)}
          </span>
          {/* Philosophical notes overlay on hover */}
          {toy.perceptualArgument && (
            <div className="absolute inset-0 bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 z-20 text-center text-base font-mono pointer-events-none">
              <span>{toy.perceptualArgument}</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="font-black text-xl mb-1 group-hover:text-[var(--accent)] transition-colors duration-200 relative">
            <span className="relative z-10">{toy.name}</span>
            <span
              className="absolute left-0 -bottom-1 w-full h-1 rounded bg-[var(--accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left z-0"
              style={{ background: accentColor }}
            />
          </h3>
          <p className="text-xs text-foreground/60 mb-2 font-mono tracking-wide">
            {toy.year} &bull; {toy.inventor}
          </p>
          <p className="text-sm text-foreground/80 line-clamp-2">
            {toy.description}
          </p>
          {/* Tag badges */}
          {toy.tags && toy.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {toy.tags.map((tag) => (
                <span key={tag} className="bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-0.5 rounded text-xs font-mono" style={{ color: accentColor, background: accentColor + '22' }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        <style jsx>{`
          :global(.group:hover) [class*='bg-[var(--accent)]'] {
            --accent: ${accentColor};
          }
        `}</style>
      </motion.div>
    </Link>
  );
};

export default ToyCard; 