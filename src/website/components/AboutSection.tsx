import React, { useState } from 'react';
import { ProfileData, defaultProfile } from '../profileConfig.ts';

interface AboutSectionProps {
  profile?: ProfileData;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  profile = defaultProfile,
}) => {
  const [photoSrc, setPhotoSrc] = useState<string>(() => {
    if (profile.imageUrl && !profile.imageUrl.startsWith('data:image/svg+xml')) {
      return profile.imageUrl;
    }
    return '/IMG-20250616-WA0001.jpg';
  });

  // Smooth fallback to available static copies if needed
  const handleImageError = () => {
    if (photoSrc.includes('IMG-20250616-WA0001.jpg')) {
      setPhotoSrc('/chinna_profile.jpg');
    } else if (photoSrc.includes('chinna_profile.jpg')) {
      setPhotoSrc('/assets/IMG-20250616-WA0001.jpg');
    }
  };

  return (
    <footer
      id="about-me-section"
      className="w-full border-t border-cyan-950/60 bg-gradient-to-b from-slate-950/40 via-slate-950/90 to-slate-950 py-16 md:py-20 px-4 sm:px-6 relative z-10"
    >
      {/* Decorative Top Accent Glow Bar */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 md:w-96 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent shadow-[0_0_15px_#06b6d4]" />

      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center mb-10 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-1.5 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
            <h2
              id="about-me-title"
              className="text-xl md:text-2xl font-bold tracking-[0.2em] uppercase text-white"
            >
              ABOUT ME
            </h2>
          </div>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          {/* Profile Image Section - Clean, fixed constant portrait */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative group">
              {/* Subtle Cyan/Blue Glow Around Circular Image */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-cyan-500/70 via-blue-600/50 to-cyan-400/70 blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Clean Circular Avatar Container */}
              <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-2 border-cyan-400/80 bg-slate-900 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center">
                {/* Real Profile Image: fixed, centered, object-cover, aspect ratio strictly maintained */}
                <img
                  id="profile-image"
                  src={photoSrc}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center select-none transition-transform duration-500 group-hover:scale-105"
                  onError={handleImageError}
                />
              </div>
            </div>
          </div>

          {/* Structured Details Cards */}
          <div className="flex-1 w-full space-y-6 text-left">
            {/* Name */}
            <div id="profile-name-block" className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                Name:
              </span>
              <p className="text-xl md:text-2xl font-bold text-slate-100 tracking-wide">
                {profile.name}
              </p>
            </div>

            {/* About Me */}
            <div id="profile-details-block" className="space-y-1">
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                About Me:
              </span>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                {profile.aboutMe}
              </p>
            </div>

            {/* MYRAA Project Description */}
            <div
              id="profile-project-block"
              className="space-y-1 pt-2 border-t border-slate-800/60"
            >
              <span className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                MYRAA PROJECT:
              </span>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
                {profile.projectDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
