import React from 'react';
import { MyraaOrb, MyraaOrbProps } from './MyraaOrb';

export type MyraaLivingOrbProps = MyraaOrbProps;

export const MyraaLivingOrb: React.FC<MyraaOrbProps> = (props) => {
  return <MyraaOrb {...props} />;
};

export { MyraaOrb };
