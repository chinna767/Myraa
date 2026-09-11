import React, { useState } from 'react';
import { WebsiteHeader } from './components/WebsiteHeader.tsx';
import { MainHero } from './components/MainHero.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { ProfileData, defaultProfile } from './profileConfig.ts';

interface WebsiteHomeProps {
  onConnectMyraa: () => void;
}

export const WebsiteHome: React.FC<WebsiteHomeProps> = ({ onConnectMyraa }) => {
  const [profile, setProfile] = useState<ProfileData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedPhoto = localStorage.getItem('myraa_profile_photo_custom');
        const saved =
          localStorage.getItem('myraa_profile_data_v1') ||
          localStorage.getItem('myraa_profile');
        if (saved) {
          const parsed = JSON.parse(saved);
          const validSavedPhoto =
            savedPhoto && !savedPhoto.startsWith('data:image/svg+xml')
              ? savedPhoto
              : null;

          const customUrl =
            validSavedPhoto ||
            (parsed.imageUrl &&
            !parsed.imageUrl.includes('photo-1534528741775-53994a69daeb') &&
            !parsed.imageUrl.startsWith('data:image/svg+xml')
              ? parsed.imageUrl
              : defaultProfile.imageUrl);

          return {
            name: 'Chinna',
            imageUrl: customUrl,
            aboutMe:
              parsed.aboutMe && !parsed.aboutMe.includes('Alex Rivera')
                ? parsed.aboutMe
                : defaultProfile.aboutMe,
            projectDescription:
              parsed.projectDescription || defaultProfile.projectDescription,
          };
        } else if (savedPhoto) {
          return {
            ...defaultProfile,
            imageUrl: savedPhoto,
          };
        }
      } catch {
        // Safe fallback to default configuration
      }
    }
    return defaultProfile;
  });

  const handleUpdateProfile = (updated: Partial<ProfileData>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      try {
        localStorage.setItem('myraa_profile_data_v1', JSON.stringify(next));
        if (updated.imageUrl) {
          localStorage.setItem('myraa_profile_photo_custom', updated.imageUrl);
        }
      } catch {
        // ignore localStorage quota errors
      }
      return next;
    });
  };

  return (
    <div
      id="myraa-website-root"
      className="min-h-screen flex flex-col bg-[#030712] text-slate-100 selection:bg-cyan-500 selection:text-black relative overflow-x-hidden font-sans"
    >
      {/* SECTION 1: WEBSITE HEADER */}
      <WebsiteHeader onConnectMyraa={onConnectMyraa} />

      {/* SECTION 2: MAIN HERO WITH 'CONNECT WITH MYRAA' */}
      <MainHero onConnectMyraa={onConnectMyraa} />

      {/* SECTION 3: ABOUT ME & MYRAA PROJECT DETAILS */}
      <AboutSection profile={profile} />
    </div>
  );
};
