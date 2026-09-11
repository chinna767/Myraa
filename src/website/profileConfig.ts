/**
 * =========================================================================
 * MYRAA — PERSONAL DETAILS CONFIGURATION
 * =========================================================================
 * You can easily customize your profile photo, name, bio, and project
 * description by editing the values below.
 * =========================================================================
 */

export interface ProfileData {
  /** URL or relative path to your profile picture (or base64 data URL) */
  imageUrl: string;
  /** Your full name */
  name: string;
  /** Short bio or summary about yourself */
  aboutMe: string;
  /** Description of what the MYRAA project is and your vision for it */
  projectDescription: string;
}

export const defaultProfile: ProfileData = {
  imageUrl: '/IMG-20250616-WA0001.jpg',
  name: 'Chinna',
  aboutMe:
    'Creator and developer of MYRAA. Dedicated to building innovative, intelligent technologies and next-generation human-machine interfaces.',
  projectDescription:
    'MYRAA is an upcoming next-generation intelligent companion engineered to bridge natural cognition, context-aware reasoning, and seamless digital interaction.',
};
