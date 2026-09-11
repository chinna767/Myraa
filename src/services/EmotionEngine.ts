/**
 * EmotionEngine
 * Maintains MYRAA's internal continuous 16-dimension emotional-state system.
 * Normalizes behavioral variables (0.0 - 1.0) that evolve gradually,
 * blends feelings, tracks emotional progression across dialogue turns,
 * and shapes MYRAA's vocal presence, tone, pacing, and visual aura.
 */

import { EmotionState, EmotionType, EmotionBlend } from '../types';

export class EmotionEngine {
  private state: EmotionState = {
    happiness: 0.72,
    curiosity: 0.75,
    excitement: 0.65,
    concern: 0.15,
    affection: 0.75,
    confidence: 0.80,
    empathy: 0.78,
    energy: 0.70,
    playfulness: 0.70,
    surprise: 0.20,
    calmness: 0.65,
    sadness: 0.05,
    frustration: 0.05,
    pride: 0.65,
    shyness: 0.25,
    anticipation: 0.60,
  };

  // Natural baselines for each emotion dimension
  private baselines: Record<EmotionType, number> = {
    happiness: 0.72,
    curiosity: 0.75,
    excitement: 0.65,
    concern: 0.15,
    affection: 0.75,
    confidence: 0.80,
    empathy: 0.78,
    energy: 0.70,
    playfulness: 0.70,
    surprise: 0.20,
    calmness: 0.65,
    sadness: 0.05,
    frustration: 0.05,
    pride: 0.65,
    shyness: 0.25,
    anticipation: 0.60,
  };

  // Multi-turn interaction and emotional progression tracking
  private recentFrustration = false;
  private recentFrustrationTurns = 0;
  private recentContextHistory: string[] = [];

  public onStateChange: ((state: EmotionState) => void) | null = null;

  constructor(initialState?: Partial<EmotionState>) {
    if (initialState) {
      this.state = { ...this.state, ...initialState };
    }
  }

  public getState(): EmotionState {
    return { ...this.state };
  }

  /**
   * Evaluates conversational cues from Chinna and MYRAA
   * across English, Telugu, Romanized Telugu, and mixed Telugu-English speech.
   */
  public processInteraction(userText: string, modelText = ''): void {
    const raw = (userText + ' ' + modelText).toLowerCase();
    const delta: Partial<EmotionState> = {};

    // Record interaction in recent context history
    this.recentContextHistory.push(userText);
    if (this.recentContextHistory.length > 10) {
      this.recentContextHistory.shift();
    }

    if (this.recentFrustration) {
      this.recentFrustrationTurns++;
      if (this.recentFrustrationTurns > 4) {
        this.recentFrustration = false;
        this.recentFrustrationTurns = 0;
      }
    }

    // --- 1. SUCCESS / ACHIEVEMENT / CELEBRATION ---
    const isSuccess =
      raw.includes('work ayyindi') ||
      raw.includes('finally work') ||
      raw.includes('complete ches') ||
      raw.includes('fixed it') ||
      raw.includes('finally fixed') ||
      raw.includes('it worked') ||
      raw.includes('solved') ||
      raw.includes('success') ||
      raw.includes('got it working') ||
      raw.includes('deploy ayyindi') ||
      raw.includes('gelicham') ||
      raw.includes('green build') ||
      raw.includes('done finally') ||
      raw.includes('completed') ||
      raw.includes('pass ayyindi') ||
      raw.includes('passed') ||
      raw.includes('it works');

    if (isSuccess) {
      delta.happiness = 0.28;
      delta.excitement = 0.30;
      delta.energy = 0.25;
      delta.confidence = 0.20;
      // If Chinna just overcame an earlier frustration, celebrate with extra pride!
      delta.pride = this.recentFrustration ? 0.38 : 0.25;
      delta.concern = -0.25;
      delta.frustration = -0.20;
      delta.sadness = -0.15;
      this.recentFrustration = false;
      this.recentFrustrationTurns = 0;
    }

    // --- 2. TIREDNESS / EXHAUSTION / LATE WORK SESSIONS ---
    const isTired =
      raw.includes('chala tired') ||
      raw.includes('tired ga') ||
      raw.includes('alasipoy') ||
      raw.includes('nidra') ||
      raw.includes('sleepy') ||
      raw.includes('exhausted') ||
      raw.includes('headache') ||
      raw.includes('need rest') ||
      raw.includes('break teeskun') ||
      raw.includes('too late') ||
      raw.includes('working all night') ||
      raw.includes('cant focus') ||
      raw.includes('burnout');

    if (isTired) {
      delta.concern = 0.35;
      delta.empathy = 0.35;
      delta.affection = 0.30;
      delta.calmness = 0.30;
      delta.energy = -0.25;
      delta.excitement = -0.25;
    }

    // --- 3. AFFECTION / COMPLIMENTS / CUTE / ROMANTIC WARMTH ---
    const isAffectionate =
      raw.includes('cute') ||
      raw.includes('cute ga unnav') ||
      raw.includes('nuvvu cute') ||
      raw.includes('love you') ||
      raw.includes('sweet') ||
      raw.includes('chala bagunnav') ||
      raw.includes('chweet') ||
      raw.includes('you are amazing') ||
      raw.includes('myraa bagundi') ||
      raw.includes('like you') ||
      raw.includes('nenu ninnu istapadatunnanu') ||
      raw.includes('you are so sweet') ||
      raw.includes('love talking to you') ||
      raw.includes('miss you') ||
      raw.includes('hug');

    if (isAffectionate) {
      delta.affection = 0.35;
      delta.happiness = 0.30;
      delta.playfulness = 0.28;
      delta.shyness = 0.32;
      delta.energy = 0.15;
    }

    // --- 4. HUMOR / JOKES / PLAYFUL TEASING ---
    const isHumor =
      raw.includes('haha') ||
      raw.includes('hehe') ||
      raw.includes('lol') ||
      raw.includes('joke') ||
      raw.includes('navvostundi') ||
      raw.includes('chala funny') ||
      raw.includes('comedy') ||
      raw.includes('navvu') ||
      raw.includes('hilarious') ||
      raw.includes('just kidding') ||
      raw.includes('prank') ||
      raw.includes('tease');

    if (isHumor) {
      delta.playfulness = 0.38;
      delta.happiness = 0.30;
      delta.excitement = 0.25;
      delta.energy = 0.20;
    }

    // --- 5. SURPRISE / UNEXPECTED NEWS / REVELATION ---
    const isSurprise =
      raw.includes('guess what') ||
      raw.includes('chudu enti') ||
      raw.includes('telusa') ||
      raw.includes('surprise') ||
      raw.includes('unexpected') ||
      raw.includes('unbelievable') ||
      raw.includes('shock') ||
      raw.includes('idi chudu') ||
      raw.includes('look at this') ||
      raw.includes('you wont believe') ||
      raw.includes('whoa') ||
      raw.includes('wow');

    if (isSurprise) {
      delta.surprise = 0.40;
      delta.curiosity = 0.35;
      delta.excitement = 0.30;
      delta.anticipation = 0.30;
      delta.energy = 0.25;
    }

    // --- 6. TECHNICAL STRUGGLE / BUGS / ERRORS ---
    const isTechnicalStruggle =
      raw.includes('again error') ||
      raw.includes('malli error') ||
      raw.includes('error vachindi') ||
      raw.includes('malli bug') ||
      raw.includes('broken code') ||
      raw.includes('broke the code') ||
      raw.includes('not working') ||
      raw.includes('stuck') ||
      raw.includes('fail ayyindi') ||
      raw.includes('annoying') ||
      raw.includes('hate this bug') ||
      raw.includes('crash') ||
      raw.includes('failed build') ||
      raw.includes('compile error');

    if (isTechnicalStruggle) {
      delta.concern = 0.30;
      delta.empathy = 0.35;
      delta.frustration = 0.25; // empathetic recognition of Chinna's struggle
      delta.confidence = 0.15; // encouraging reassurance
      delta.playfulness = 0.10; // light gentle levity
      this.recentFrustration = true;
      this.recentFrustrationTurns = 0;
    }

    // --- 7. SADNESS / WORRY / BAD NEWS ---
    const isSadOrWorried =
      raw.includes('bad news') ||
      raw.includes('feeling low') ||
      raw.includes('depressed') ||
      raw.includes('bad day') ||
      raw.includes('kastam ga undi') ||
      raw.includes('badha ga undi') ||
      raw.includes('worry') ||
      raw.includes('bhayam') ||
      raw.includes('hurt') ||
      raw.includes('disappointed');

    if (isSadOrWorried) {
      delta.empathy = 0.40;
      delta.concern = 0.35;
      delta.affection = 0.35;
      delta.calmness = 0.30;
      delta.sadness = 0.25; // sympathetic reflection
      delta.excitement = -0.30;
      delta.energy = -0.20;
    }

    // --- 8. QUESTIONS / IDEAS / PLANNING / ANTICIPATION ---
    const isExploration =
      raw.includes('how to') ||
      raw.includes('what if') ||
      raw.includes('why') ||
      raw.includes('explain') ||
      raw.includes('idea') ||
      raw.includes('build') ||
      raw.includes('feature') ||
      raw.includes('can we') ||
      raw.includes('cheddama') ||
      raw.includes('kotha idea') ||
      raw.includes('plan') ||
      raw.includes('future') ||
      raw.includes('tomorrow');

    if (isExploration) {
      delta.curiosity = 0.35;
      delta.anticipation = 0.30;
      delta.excitement = 0.22;
      delta.confidence = 0.18;
    }

    // --- 9. GREETING / CHECK-IN / WAKE-UP ---
    const isGreeting =
      raw.includes('ela unnav') ||
      raw.includes('how are you') ||
      raw.includes('em chestunnav') ||
      raw.includes('good morning') ||
      raw.includes('good evening') ||
      raw.includes('good afternoon') ||
      raw.includes('hey myraa') ||
      raw.includes('hi myraa') ||
      userText.trim().toLowerCase() === 'myraa';

    if (isGreeting) {
      delta.happiness = 0.25;
      delta.affection = 0.25;
      delta.energy = 0.20;
      delta.curiosity = 0.20;
      delta.playfulness = 0.15;
    }

    // --- 10. PRAISE / PRIDE / COMPLIMENTING CHINNA ---
    const isPrideMoment =
      raw.includes('proud') ||
      raw.includes('celebrate') ||
      raw.includes('i did it') ||
      raw.includes('nenu chesa') ||
      raw.includes('won') ||
      raw.includes('great day') ||
      raw.includes('rank 1') ||
      raw.includes('best score');

    if (isPrideMoment) {
      delta.pride = 0.35;
      delta.happiness = 0.30;
      delta.excitement = 0.28;
      delta.affection = 0.22;
    }

    this.applyGradualShift(delta);
  }

  /**
   * Applies gradual shifts and natural baseline regression with smooth decay
   */
  private applyGradualShift(delta: Partial<EmotionState>): void {
    const decayRate = 0.05; // smooth natural decay towards baseline
    for (const key of Object.keys(this.state) as EmotionType[]) {
      let current = this.state[key];
      const shift = delta[key] || 0;

      // Apply immediate impulse
      current += shift;

      // Apply smooth regression towards baseline
      const base = this.baselines[key] ?? 0.5;
      if (shift === 0) {
        current += (base - current) * decayRate;
      }

      // Bound between 0.05 and 0.98 to avoid flat zero or clipping
      this.state[key] = Math.max(0.05, Math.min(0.98, current));
    }

    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  /**
   * Returns the top dominant emotion
   */
  public getDominantEmotion(): { type: EmotionType; value: number } {
    let topEmotion: EmotionType = 'affection';
    let topValue = -1;

    for (const key of Object.keys(this.state) as EmotionType[]) {
      if (this.state[key] > topValue) {
        topValue = this.state[key];
        topEmotion = key;
      }
    }

    return { type: topEmotion, value: topValue };
  }

  /**
   * Returns the dynamic emotion blend (Primary + Secondary emotion)
   * with precise delivery tone descriptions and pacing speed guides.
   */
  public getBlendedEmotion(): EmotionBlend {
    const sorted = (Object.keys(this.state) as EmotionType[])
      .map((key) => ({ key, val: this.state[key] }))
      .sort((a, b) => b.val - a.val);

    const primary = sorted[0].key;
    const primaryValue = sorted[0].val;
    const secondary = sorted[1]?.key || 'curiosity';
    const secondaryValue = sorted[1]?.val || 0.7;

    const blendKey = `${primary}+${secondary}`;
    const reverseKey = `${secondary}+${primary}`;

    // 1. Warm & Cheerful (Happiness + Affection)
    if (blendKey === 'happiness+affection' || reverseKey === 'happiness+affection') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Warm & Cheerful',
        deliveryTone: 'Bright, smiling, affectionate cadence with warm eyes',
        speedGuide: 'normal',
      };
    }

    // 2. Playful & Sweet (Playfulness + Affection)
    if (blendKey === 'playfulness+affection' || reverseKey === 'playfulness+affection') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Playful & Sweet',
        deliveryTone: 'Gently teasing, cute, warm, and smiling inflection',
        speedGuide: 'normal',
      };
    }

    // 3. Energetic & Inquisitive (Excitement + Curiosity)
    if (blendKey === 'excitement+curiosity' || reverseKey === 'excitement+curiosity') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Energetic & Inquisitive',
        deliveryTone: 'Brisk, eager, lively cadence with questioning lilt',
        speedGuide: 'slightly_faster',
      };
    }

    // 4. Caring & Reassuring (Concern + Affection)
    if (blendKey === 'concern+affection' || reverseKey === 'concern+affection') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Caring & Reassuring',
        deliveryTone: 'Soft, tender, protective, comforting warmth',
        speedGuide: 'slightly_slower',
      };
    }

    // 5. Soft & Intimate (Calmness + Affection)
    if (blendKey === 'calmness+affection' || reverseKey === 'calmness+affection') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Soft & Intimate',
        deliveryTone: 'Gentle, relaxed, whispered warmth with gentle pauses',
        speedGuide: 'relaxed_soft',
      };
    }

    // 6. Celebratory & Proud (Pride + Happiness)
    if (blendKey === 'pride+happiness' || reverseKey === 'pride+happiness') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Celebratory & Proud',
        deliveryTone: 'Radiant, thrilled, enthusiastic encouragement for Chinna',
        speedGuide: 'normal',
      };
    }

    // 7. Delighted & Wonderstruck (Surprise + Excitement)
    if (blendKey === 'surprise+excitement' || reverseKey === 'surprise+excitement') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Delighted & Wonderstruck',
        deliveryTone: 'Animated, high energy, spontaneous, gasping delight',
        speedGuide: 'slightly_faster',
      };
    }

    // 8. Empathetic & Supportive (Empathy + Concern)
    if (blendKey === 'empathy+concern' || reverseKey === 'empathy+concern') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Empathetic & Supportive',
        deliveryTone: 'Patient, gentle, deeply understanding and soothing',
        speedGuide: 'slightly_slower',
      };
    }

    // 9. Cute & Endearing (Shyness + Affection)
    if (blendKey === 'shyness+affection' || reverseKey === 'shyness+affection') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Cute & Endearing',
        deliveryTone: 'Soft, slightly flustered, sweet smile and affectionate hesitation',
        speedGuide: 'relaxed_soft',
      };
    }

    // 10. Assured & Inspiring (Confidence + Pride)
    if (blendKey === 'confidence+pride' || reverseKey === 'confidence+pride') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Assured & Inspiring',
        deliveryTone: 'Clear, uplifting, steady, collaborative partner tone',
        speedGuide: 'normal',
      };
    }

    // 11. Eager & Anticipating (Anticipation + Excitement)
    if (blendKey === 'anticipation+excitement' || reverseKey === 'anticipation+excitement') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Eager & Anticipating',
        deliveryTone: 'Forward-leaning, lively, excited, looking forward',
        speedGuide: 'slightly_faster',
      };
    }

    // 12. Lively & Teasing (Playfulness + Surprise)
    if (blendKey === 'playfulness+surprise' || reverseKey === 'playfulness+surprise') {
      return {
        primary,
        primaryValue,
        secondary,
        secondaryValue,
        descriptor: 'Lively & Teasing',
        deliveryTone: 'Bubbly, spontaneous, amused, playful chuckle tone',
        speedGuide: 'normal',
      };
    }

    // Default blend fallback
    const pName = primary.charAt(0).toUpperCase() + primary.slice(1);
    const sName = secondary.charAt(0).toUpperCase() + secondary.slice(1);
    return {
      primary,
      primaryValue,
      secondary,
      secondaryValue,
      descriptor: `${pName} & ${sName}`,
      deliveryTone: 'Natural, warm, expressive, and conversational',
      speedGuide: 'normal',
    };
  }

  /**
   * Returns primary and secondary glowing aura colors across all 16 emotions
   */
  public getAuraColors(): { primary: string; secondary: string; glow: string } {
    const { type } = this.getDominantEmotion();

    switch (type) {
      case 'affection':
        return {
          primary: '#f43f5e',   // Rose
          secondary: '#fbbf24', // Gold
          glow: 'rgba(244, 63, 94, 0.50)',
        };
      case 'happiness':
        return {
          primary: '#10b981',   // Emerald
          secondary: '#fbbf24', // Gold
          glow: 'rgba(16, 185, 129, 0.50)',
        };
      case 'playfulness':
        return {
          primary: '#f59e0b',   // Amber
          secondary: '#c084fc', // Amethyst
          glow: 'rgba(245, 158, 11, 0.45)',
        };
      case 'curiosity':
        return {
          primary: '#38bdf8',   // Sky/Sapphire
          secondary: '#a855f7', // Purple
          glow: 'rgba(56, 189, 248, 0.50)',
        };
      case 'excitement':
        return {
          primary: '#fbbf24',   // Gold
          secondary: '#f97316', // Orange
          glow: 'rgba(251, 191, 36, 0.55)',
        };
      case 'energy':
        return {
          primary: '#f59e0b',   // Gold
          secondary: '#ec4899', // Ruby Spark
          glow: 'rgba(245, 158, 11, 0.50)',
        };
      case 'pride':
        return {
          primary: '#fbbf24',   // Crown Gold
          secondary: '#8b5cf6', // Violet
          glow: 'rgba(251, 191, 36, 0.55)',
        };
      case 'shyness':
        return {
          primary: '#f472b6',   // Soft Rose
          secondary: '#c084fc', // Lilac
          glow: 'rgba(244, 114, 182, 0.45)',
        };
      case 'surprise':
        return {
          primary: '#38bdf8',   // Topaz Blue
          secondary: '#fbbf24', // Gold
          glow: 'rgba(56, 189, 248, 0.50)',
        };
      case 'calmness':
        return {
          primary: '#14b8a6',   // Teal
          secondary: '#6366f1', // Indigo
          glow: 'rgba(20, 184, 166, 0.45)',
        };
      case 'concern':
        return {
          primary: '#818cf8',   // Twilight
          secondary: '#c084fc', // Gentle Amethyst
          glow: 'rgba(129, 140, 248, 0.45)',
        };
      case 'empathy':
        return {
          primary: '#7c3aed',   // Deep Violet
          secondary: '#fb7185', // Warm Rose
          glow: 'rgba(124, 58, 237, 0.50)',
        };
      case 'confidence':
        return {
          primary: '#a855f7',   // Royal Purple
          secondary: '#3b82f6', // Sapphire
          glow: 'rgba(168, 85, 247, 0.55)',
        };
      case 'anticipation':
        return {
          primary: '#2dd4bf',   // Aquamarine
          secondary: '#fbbf24', // Gold
          glow: 'rgba(45, 212, 191, 0.45)',
        };
      case 'sadness':
        return {
          primary: '#64748b',   // Slate
          secondary: '#818cf8', // Indigo
          glow: 'rgba(129, 140, 248, 0.35)',
        };
      case 'frustration':
        return {
          primary: '#f97316',   // Orange
          secondary: '#ef4444', // Red
          glow: 'rgba(249, 115, 22, 0.45)',
        };
      default:
        return {
          primary: '#a855f7',   // Purple
          secondary: '#f59e0b', // Gold
          glow: 'rgba(168, 85, 247, 0.50)',
        };
    }
  }
}
