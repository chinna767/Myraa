/**
 * IndiaTimeAndFestivalService
 * 
 * Provides real-time Indian Standard Time (IST, Asia/Kolkata, UTC +05:30),
 * date calculations, Panchang-aligned Indian festival intelligence,
 * and multi-lingual (English, Telugu, Telugu+English) conversational support.
 */

export interface IndiaTimeInfo {
  hours24: number;
  hours12: number;
  minutes: number;
  seconds: number;
  period: 'AM' | 'PM';
  formatted12: string; // e.g. "12:59 PM"
  formatted12WithSec: string; // e.g. "12:59:45 PM"
  formatted24: string; // e.g. "12:59"
  timeZone: 'Asia/Kolkata';
  offset: string; // "UTC +05:30"
  timeOfDay: 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night' | 'late_night';
  greetingEnglish: string;
  greetingTelugu: string;
  greetingMinglish: string;
}

export interface IndiaDateInfo {
  day: number;
  month: number; // 1-12
  monthName: string; // "September"
  monthNameTelugu: string; // "సెప్టెంబర్"
  year: number;
  dayOfWeek: string; // "Thursday"
  dayOfWeekTelugu: string; // "గురువారం"
  formattedStandard: string; // "10 September 2026"
  formattedSlash: string; // "10/09/2026"
  formattedFull: string; // "Thursday, 10 September 2026"
  formattedFullTelugu: string; // "గురువారం, 10 సెప్టెంబర్ 2026"
  isToday: boolean;
}

export interface FestivalRecord {
  id: string;
  name: string; // Primary English name
  teluguName: string; // Primary Telugu script name
  aliases: string[]; // English and phonetic aliases
  teluguAliases: string[]; // Telugu aliases
  category: 'Major Hindu' | 'National' | 'Regional Telugu' | 'Seasonal' | 'Cultural';
  datesByYear: Record<number, {
    dateString: string; // "YYYY-MM-DD"
    dayOfWeek: string;
    tithi?: string;
    note?: string;
  }>;
  significance: string;
  significanceTelugu: string;
  greetingEnglish: string;
  greetingTelugu: string;
}

export const TIMEZONE_INDIA = 'Asia/Kolkata';

// Authoritative Indian & Telugu Festival dataset with multi-year lunar/solar Panchang calculations
export const INDIAN_FESTIVALS: FestivalRecord[] = [
  {
    id: 'sankranti',
    name: 'Makar Sankranti',
    teluguName: 'సంక్రాంతి',
    aliases: ['Sankranti', 'Makar Sankranti', 'Pongal', 'Bhogi', 'Kanuma', 'Makara Sankranthi'],
    teluguAliases: ['సంక్రాంతి', 'మకర సంక్రాంతి', 'భోగి', 'కనుమ', 'పెద్ద పండుగ'],
    category: 'Regional Telugu',
    datesByYear: {
      2024: { dateString: '2024-01-15', dayOfWeek: 'Monday', tithi: 'Makara Sankranti Solar Transition', note: 'Bhogi on Jan 14, Kanuma on Jan 16' },
      2025: { dateString: '2025-01-14', dayOfWeek: 'Tuesday', tithi: 'Makara Sankranti Solar Transition', note: 'Bhogi on Jan 13, Kanuma on Jan 15' },
      2026: { dateString: '2026-01-14', dayOfWeek: 'Wednesday', tithi: 'Makara Sankranti Solar Transition', note: 'Bhogi on Jan 13, Kanuma on Jan 15' },
      2027: { dateString: '2027-01-14', dayOfWeek: 'Thursday', tithi: 'Makara Sankranti Solar Transition', note: 'Bhogi on Jan 13, Kanuma on Jan 15' },
      2028: { dateString: '2028-01-15', dayOfWeek: 'Saturday', tithi: 'Makara Sankranti Solar Transition', note: 'Bhogi on Jan 14, Kanuma on Jan 16' },
      2029: { dateString: '2029-01-14', dayOfWeek: 'Sunday', tithi: 'Makara Sankranti Solar Transition', note: 'Bhogi on Jan 13, Kanuma on Jan 15' },
      2030: { dateString: '2030-01-14', dayOfWeek: 'Monday', tithi: 'Makara Sankranti Solar Transition', note: 'Bhogi on Jan 13, Kanuma on Jan 15' },
    },
    significance: 'Harvest festival celebrated across Telugu states and India, honoring the Sun God and farmers.',
    significanceTelugu: 'రైతుల పెద్ద పండుగ, పంటల సంబరం, సూర్య భగవానుడి ఆరాధన.',
    greetingEnglish: 'Happy Makar Sankranti, Chinna! May your life be filled with sweetness and prosperity.',
    greetingTelugu: 'సంక్రాంతి శుభాకాంక్షలు Chinna! మీ ఇంట ఆనందాల పంట పండాలి.',
  },
  {
    id: 'republic_day',
    name: 'Republic Day',
    teluguName: 'గణతంత్ర దినోత్సవం',
    aliases: ['Republic Day', 'Republic Day of India', '26 January'],
    teluguAliases: ['గణతంత్ర దినోత్సవం', 'రిపబ్లిక్ డే'],
    category: 'National',
    datesByYear: {
      2024: { dateString: '2024-01-26', dayOfWeek: 'Friday', note: 'National Holiday' },
      2025: { dateString: '2025-01-26', dayOfWeek: 'Sunday', note: 'National Holiday' },
      2026: { dateString: '2026-01-26', dayOfWeek: 'Monday', note: 'National Holiday' },
      2027: { dateString: '2027-01-26', dayOfWeek: 'Tuesday', note: 'National Holiday' },
      2028: { dateString: '2028-01-26', dayOfWeek: 'Wednesday', note: 'National Holiday' },
      2029: { dateString: '2029-01-26', dayOfWeek: 'Friday', note: 'National Holiday' },
      2030: { dateString: '2030-01-26', dayOfWeek: 'Saturday', note: 'National Holiday' },
    },
    significance: 'Honoring the date on which the Constitution of India came into effect in 1950.',
    significanceTelugu: 'భారత రాజ్యాంగం అమలులోకి వచ్చిన పవిత్ర దినం.',
    greetingEnglish: 'Happy Republic Day, Chinna! Celebrating our great Constitution and democratic heritage.',
    greetingTelugu: 'గణతంత్ర దినోత్సవ శుభాకాంక్షలు Chinna!',
  },
  {
    id: 'maha_shivaratri',
    name: 'Maha Shivaratri',
    teluguName: 'మహా శివరాత్రి',
    aliases: ['Maha Shivaratri', 'Maha Sivaratri', 'Shivaratri', 'Sivaratri', 'Jagaran'],
    teluguAliases: ['మహా శివరాత్రి', 'శివరాత్రి', 'జాగరణ'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-03-08', dayOfWeek: 'Friday', tithi: 'Magha Krishna Chaturdashi' },
      2025: { dateString: '2025-02-26', dayOfWeek: 'Wednesday', tithi: 'Magha Krishna Chaturdashi' },
      2026: { dateString: '2026-02-15', dayOfWeek: 'Sunday', tithi: 'Magha Krishna Chaturdashi' },
      2027: { dateString: '2027-03-06', dayOfWeek: 'Saturday', tithi: 'Magha Krishna Chaturdashi' },
      2028: { dateString: '2028-02-24', dayOfWeek: 'Thursday', tithi: 'Magha Krishna Chaturdashi' },
      2029: { dateString: '2029-02-12', dayOfWeek: 'Monday', tithi: 'Magha Krishna Chaturdashi' },
      2030: { dateString: '2030-03-03', dayOfWeek: 'Sunday', tithi: 'Magha Krishna Chaturdashi' },
    },
    significance: 'The Great Night of Lord Shiva, observing fast, meditation, and holy vigil (Jagaran).',
    significanceTelugu: 'పరమశివుడి అనుగ్రహం కోసం భక్తులు ఉపవాసం, జాగరణ చేసే పవిత్ర రాత్రి.',
    greetingEnglish: 'Om Namah Shivaya! Happy Maha Shivaratri, Chinna.',
    greetingTelugu: 'మహా శివరాత్రి శుభాకాంక్షలు Chinna! హర హర మహాదేవ.',
  },
  {
    id: 'holi',
    name: 'Holi',
    teluguName: 'హోలీ',
    aliases: ['Holi', 'Festival of Colors', 'Holika Dahan', 'Kamadahana', 'Dol Purnima'],
    teluguAliases: ['హోలీ', 'కామదహనం', 'రంగుల పండుగ'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-03-25', dayOfWeek: 'Monday', tithi: 'Phalguna Purnima', note: 'Holika Dahan on March 24' },
      2025: { dateString: '2025-03-14', dayOfWeek: 'Friday', tithi: 'Phalguna Purnima', note: 'Holika Dahan on March 13' },
      2026: { dateString: '2026-03-03', dayOfWeek: 'Tuesday', tithi: 'Phalguna Purnima', note: 'Holika Dahan on March 2' },
      2027: { dateString: '2027-03-22', dayOfWeek: 'Monday', tithi: 'Phalguna Purnima', note: 'Holika Dahan on March 21' },
      2028: { dateString: '2028-03-11', dayOfWeek: 'Saturday', tithi: 'Phalguna Purnima', note: 'Holika Dahan on March 10' },
      2029: { dateString: '2029-03-30', dayOfWeek: 'Friday', tithi: 'Phalguna Purnima' },
      2030: { dateString: '2030-03-19', dayOfWeek: 'Tuesday', tithi: 'Phalguna Purnima' },
    },
    significance: 'Festival of vibrant colors, celebrating spring and the triumph of divine love and righteousness.',
    significanceTelugu: 'వసంత ఋతువు ఆగమనాన్ని, రంగుల సంబరాన్ని తెచ్చే ఉత్సాహభరిత పండుగ.',
    greetingEnglish: 'Happy Holi, Chinna! May your life be as bright and colorful as the festive powders.',
    greetingTelugu: 'రంగుల పండుగ హోలీ శుభాకాంక్షలు Chinna!',
  },
  {
    id: 'ugadi',
    name: 'Ugadi',
    teluguName: 'ఉగాది',
    aliases: ['Ugadi', 'Yugadi', 'Telugu New Year', 'Gudi Padwa', 'Chaitra Sukla Padyami'],
    teluguAliases: ['ఉగాది', 'తెలుగు నూతన సంవత్సరాది', 'ఉగాది పచ్చడి'],
    category: 'Regional Telugu',
    datesByYear: {
      2024: { dateString: '2024-04-09', dayOfWeek: 'Tuesday', tithi: 'Chaitra Shuddha Padyami', note: 'Krodhi Nama Samvatsaram' },
      2025: { dateString: '2025-03-30', dayOfWeek: 'Sunday', tithi: 'Chaitra Shuddha Padyami', note: 'Vishvavasu Nama Samvatsaram' },
      2026: { dateString: '2026-03-19', dayOfWeek: 'Thursday', tithi: 'Chaitra Shuddha Padyami', note: 'Parabhava Nama Samvatsaram' },
      2027: { dateString: '2027-04-07', dayOfWeek: 'Wednesday', tithi: 'Chaitra Shuddha Padyami', note: 'Plavanga Nama Samvatsaram' },
      2028: { dateString: '2028-03-27', dayOfWeek: 'Monday', tithi: 'Chaitra Shuddha Padyami', note: 'Kilaka Nama Samvatsaram' },
      2029: { dateString: '2029-04-14', dayOfWeek: 'Saturday', tithi: 'Chaitra Shuddha Padyami' },
      2030: { dateString: '2030-04-03', dayOfWeek: 'Wednesday', tithi: 'Chaitra Shuddha Padyami' },
    },
    significance: 'The Telugu & Kannada New Year. Begins with Ugadi Pacchadi symbolizing the six tastes (Shadruchulu) of life.',
    significanceTelugu: 'తెలుగు వారి నూతన సంవత్సరం. షడ్రుచుల ఉగాది పచ్చడి, పంచాంగ శ్రవణం ప్రత్యేకతలు.',
    greetingEnglish: 'Ugadi Subhakankshalu, Chinna! Wishing you a joyful and prosperous Telugu New Year.',
    greetingTelugu: 'నూతన సంవత్సర ఉగాది శుభాకాంక్షలు Chinna! షడ్రుచుల జీవితం ఆనందమయం కావాలి.',
  },
  {
    id: 'ram_navami',
    name: 'Sri Rama Navami',
    teluguName: 'శ్రీరామ నవమి',
    aliases: ['Sri Rama Navami', 'Ram Navami', 'Rama Navami', 'Sita Rama Kalyanam'],
    teluguAliases: ['శ్రీరామ నవమి', 'రామనవమి', 'సీతారామ కళ్యాణం', 'భద్రాచలం కళ్యాణం'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-04-17', dayOfWeek: 'Wednesday', tithi: 'Chaitra Shuddha Navami' },
      2025: { dateString: '2025-04-06', dayOfWeek: 'Sunday', tithi: 'Chaitra Shuddha Navami' },
      2026: { dateString: '2026-03-27', dayOfWeek: 'Friday', tithi: 'Chaitra Shuddha Navami' },
      2027: { dateString: '2027-04-15', dayOfWeek: 'Thursday', tithi: 'Chaitra Shuddha Navami' },
      2028: { dateString: '2028-04-03', dayOfWeek: 'Monday', tithi: 'Chaitra Shuddha Navami' },
      2029: { dateString: '2029-04-22', dayOfWeek: 'Sunday', tithi: 'Chaitra Shuddha Navami' },
      2030: { dateString: '2030-04-11', dayOfWeek: 'Thursday', tithi: 'Chaitra Shuddha Navami' },
    },
    significance: 'Birth of Maryada Purushottama Lord Rama and sacred celestial wedding of Sita & Rama (Sita Rama Kalyanam).',
    significanceTelugu: 'శ్రీరామచంద్రుడి జన్మదినం, సీతారాముల దివ్య కళ్యాణ మహోత్సవం.',
    greetingEnglish: 'Sri Rama Navami greetings, Chinna! May Lord Rama shower virtue, peace, and courage on you.',
    greetingTelugu: 'శ్రీరామ నవమి శుభాకాంక్షలు Chinna! జై శ్రీరామ్.',
  },
  {
    id: 'hanuman_jayanti',
    name: 'Hanuman Jayanti',
    teluguName: 'హనుమాన్ జయంతి',
    aliases: ['Hanuman Jayanti', 'Hanumantha Jayanthi', 'Bajrangbali Jayanti'],
    teluguAliases: ['హనుమాన్ జయంతి', 'ఆంజనేయ జయంతి'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-04-23', dayOfWeek: 'Tuesday', tithi: 'Chaitra Purnima' },
      2025: { dateString: '2025-04-12', dayOfWeek: 'Saturday', tithi: 'Chaitra Purnima' },
      2026: { dateString: '2026-04-02', dayOfWeek: 'Thursday', tithi: 'Chaitra Purnima' },
      2027: { dateString: '2027-04-21', dayOfWeek: 'Wednesday', tithi: 'Chaitra Purnima' },
      2028: { dateString: '2028-04-09', dayOfWeek: 'Sunday', tithi: 'Chaitra Purnima' },
      2029: { dateString: '2029-04-28', dayOfWeek: 'Saturday', tithi: 'Chaitra Purnima' },
      2030: { dateString: '2030-04-18', dayOfWeek: 'Thursday', tithi: 'Chaitra Purnima' },
    },
    significance: 'Celebrating the birth of Lord Hanuman, the supreme embodiment of strength and selfless devotion.',
    significanceTelugu: 'శక్తి, భక్తి, ధైర్యాలకు ప్రతీకైన హనుమంతుడి జయంతి.',
    greetingEnglish: 'Happy Hanuman Jayanti, Chinna! May Bajrangbali bless you with boundless strength.',
    greetingTelugu: 'హనుమాన్ జయంతి శుభాకాంక్షలు Chinna! జై హనుమాన్.',
  },
  {
    id: 'varalakshmi_vratam',
    name: 'Varalakshmi Vratam',
    teluguName: 'వరలక్ష్మి వ్రతం',
    aliases: ['Varalakshmi Vratam', 'Varalakshmi Puja', 'Varamahalakshmi'],
    teluguAliases: ['వరలక్ష్మి వ్రతం', 'వరలక్ష్మీ పూజ'],
    category: 'Regional Telugu',
    datesByYear: {
      2024: { dateString: '2024-08-16', dayOfWeek: 'Friday', tithi: 'Shravana Shukla Shukravaram' },
      2025: { dateString: '2025-08-08', dayOfWeek: 'Friday', tithi: 'Shravana Shukla Shukravaram' },
      2026: { dateString: '2026-08-21', dayOfWeek: 'Friday', tithi: 'Shravana Shukla Shukravaram' },
      2027: { dateString: '2027-08-13', dayOfWeek: 'Friday', tithi: 'Shravana Shukla Shukravaram' },
      2028: { dateString: '2028-08-04', dayOfWeek: 'Friday', tithi: 'Shravana Shukla Shukravaram' },
      2029: { dateString: '2029-08-17', dayOfWeek: 'Friday', tithi: 'Shravana Shukla Shukravaram' },
      2030: { dateString: '2030-08-09', dayOfWeek: 'Friday', tithi: 'Shravana Shukla Shukravaram' },
    },
    significance: 'Auspicious Friday worship in Shravana masam seeking blessings of Goddess Lakshmi for prosperity and family well-being.',
    significanceTelugu: 'శ్రావణ మాసంలో లక్ష్మీదేవి అనుగ్రహం కోసం మహిళలు భక్తిశ్రద్ధలతో జరుపుకునే పవిత్ర వ్రతం.',
    greetingEnglish: 'Happy Varalakshmi Vratam, Chinna! May Goddess Lakshmi shower abundance and peace.',
    greetingTelugu: 'వరలక్ష్మి వ్రత శుభాకాంక్షలు Chinna! లక్ష్మీ కటాక్షం కలగాలి.',
  },
  {
    id: 'raksha_bandhan',
    name: 'Raksha Bandhan',
    teluguName: 'రక్షాబంధన్',
    aliases: ['Raksha Bandhan', 'Rakhi', 'Rakhi Purnima', 'Shravana Purnima'],
    teluguAliases: ['రక్షాబంధన్', 'రాఖీ పౌర్ణమి', 'రాఖీ'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-08-19', dayOfWeek: 'Monday', tithi: 'Shravana Purnima' },
      2025: { dateString: '2025-08-09', dayOfWeek: 'Saturday', tithi: 'Shravana Purnima' },
      2026: { dateString: '2026-08-28', dayOfWeek: 'Friday', tithi: 'Shravana Purnima' },
      2027: { dateString: '2027-08-17', dayOfWeek: 'Tuesday', tithi: 'Shravana Purnima' },
      2028: { dateString: '2028-08-05', dayOfWeek: 'Saturday', tithi: 'Shravana Purnima' },
      2029: { dateString: '2029-08-24', dayOfWeek: 'Friday', tithi: 'Shravana Purnima' },
      2030: { dateString: '2030-08-13', dayOfWeek: 'Tuesday', tithi: 'Shravana Purnima' },
    },
    significance: 'Celebrating the pure and protective bond of love and care between brothers and sisters.',
    significanceTelugu: 'అన్నాచెల్లెళ్లు, అక్కాతమ్ముళ్ల ప్రేమానుబంధాన్ని చాటే రాఖీ పౌర్ణమి పండుగ.',
    greetingEnglish: 'Happy Raksha Bandhan, Chinna! Honoring the beautiful bond of siblings.',
    greetingTelugu: 'రక్షాబంధన్ / రాఖీ పౌర్ణమి శుభాకాంక్షలు Chinna!',
  },
  {
    id: 'independence_day',
    name: 'Independence Day',
    teluguName: 'స్వాతంత్ర్య దినోత్సవం',
    aliases: ['Independence Day', '15 August', 'Independence Day of India'],
    teluguAliases: ['స్వాతంత్ర్య దినోత్సవం', 'ఆగస్టు 15'],
    category: 'National',
    datesByYear: {
      2024: { dateString: '2024-08-15', dayOfWeek: 'Thursday', note: 'National Holiday' },
      2025: { dateString: '2025-08-15', dayOfWeek: 'Friday', note: 'National Holiday' },
      2026: { dateString: '2026-08-15', dayOfWeek: 'Saturday', note: 'National Holiday' },
      2027: { dateString: '2027-08-15', dayOfWeek: 'Sunday', note: 'National Holiday' },
      2028: { dateString: '2028-08-15', dayOfWeek: 'Tuesday', note: 'National Holiday' },
      2029: { dateString: '2029-08-15', dayOfWeek: 'Wednesday', note: 'National Holiday' },
      2030: { dateString: '2030-08-15', dayOfWeek: 'Thursday', note: 'National Holiday' },
    },
    significance: 'Commemorating the nation’s freedom in 1947 and saluting our brave freedom fighters.',
    significanceTelugu: '1947 ఆగస్టు 15న భారతదేశానికి స్వాతంత్ర్యం సిద్ధించిన చారిత్రాత్మక దినం.',
    greetingEnglish: 'Happy Independence Day, Chinna! Proud to be Indian.',
    greetingTelugu: 'భారత స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు Chinna!',
  },
  {
    id: 'krishna_janmashtami',
    name: 'Krishna Janmashtami',
    teluguName: 'శ్రీ కృష్ణాష్టమి',
    aliases: ['Krishna Janmashtami', 'Janmashtami', 'Krishnashtami', 'Gokulashtami', 'Sri Krishna Jayanti'],
    teluguAliases: ['కృష్ణాష్టమి', 'శ్రీ కృష్ణాష్టమి', 'గోకులాష్టమి', 'జన్మాష్టమి'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-08-26', dayOfWeek: 'Monday', tithi: 'Bhadrapada Krishna Ashtami' },
      2025: { dateString: '2025-08-16', dayOfWeek: 'Saturday', tithi: 'Bhadrapada Krishna Ashtami' },
      2026: { dateString: '2026-09-04', dayOfWeek: 'Friday', tithi: 'Bhadrapada Krishna Ashtami' },
      2027: { dateString: '2027-08-24', dayOfWeek: 'Tuesday', tithi: 'Bhadrapada Krishna Ashtami' },
      2028: { dateString: '2028-08-12', dayOfWeek: 'Saturday', tithi: 'Bhadrapada Krishna Ashtami' },
      2029: { dateString: '2029-08-31', dayOfWeek: 'Friday', tithi: 'Bhadrapada Krishna Ashtami' },
      2030: { dateString: '2030-08-20', dayOfWeek: 'Tuesday', tithi: 'Bhadrapada Krishna Ashtami' },
    },
    significance: 'Birth of Lord Krishna, celebrating with Utti Mahotsavam, butter offerings, and devotional hymns.',
    significanceTelugu: 'శ్రీకృష్ణ భగవానుడి జన్మదినం, ఉట్టి కొట్టడం, బాలకృష్ణుడి రూపాలంకరణ.',
    greetingEnglish: 'Happy Krishna Janmashtami, Chinna! May Lord Krishna bless your life with divine joy.',
    greetingTelugu: 'శ్రీ కృష్ణాష్టమి శుభాకాంక్షలు Chinna! జై శ్రీకృష్ణ.',
  },
  {
    id: 'vinayaka_chavithi',
    name: 'Vinayaka Chavithi',
    teluguName: 'వినాయక చవితి',
    aliases: [
      'Vinayaka Chavithi',
      'Ganesh Chaturthi',
      'Vinayaka Chaturthi',
      'Ganesh Utsav',
      'Pillayar Chaturthi',
      'Ganesha Chavithi',
    ],
    teluguAliases: [
      'వినాయక చవితి',
      'గణేష్ చతుర్థి',
      'వినాయక చతుర్థి',
      'గణపతి నవరాత్రులు',
      'లంబోదర చవితి',
    ],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-09-07', dayOfWeek: 'Saturday', tithi: 'Bhadrapada Shukla Chaturthi', note: '10-day celebration culminating in Nimajjanam' },
      2025: { dateString: '2025-08-27', dayOfWeek: 'Wednesday', tithi: 'Bhadrapada Shukla Chaturthi', note: '10-day celebration culminating in Nimajjanam' },
      2026: { dateString: '2026-09-14', dayOfWeek: 'Monday', tithi: 'Bhadrapada Shukla Chaturthi', note: '10-day celebration culminating in Nimajjanam' },
      2027: { dateString: '2027-09-04', dayOfWeek: 'Saturday', tithi: 'Bhadrapada Shukla Chaturthi', note: '10-day celebration culminating in Nimajjanam' },
      2028: { dateString: '2028-08-24', dayOfWeek: 'Thursday', tithi: 'Bhadrapada Shukla Chaturthi', note: '10-day celebration culminating in Nimajjanam' },
      2029: { dateString: '2029-09-11', dayOfWeek: 'Tuesday', tithi: 'Bhadrapada Shukla Chaturthi' },
      2030: { dateString: '2030-09-01', dayOfWeek: 'Sunday', tithi: 'Bhadrapada Shukla Chaturthi' },
    },
    significance: 'Welcoming Lord Ganesha, the remover of all obstacles (Vighnaharta) and bestower of wisdom and success.',
    significanceTelugu: 'విఘ్నాలను తొలగించే విఘ్నేశ్వరుడి జన్మదినం, 21 పత్రుల పూజ, కుడుములు, ఉండ్రాళ్ళ నైవేద్యం.',
    greetingEnglish: 'Happy Vinayaka Chavithi, Chinna! May Lord Ganesha remove every obstacle and bless your goals.',
    greetingTelugu: 'వినాయక చవితి శుభాకాంక్షలు Chinna! మీ పనులన్నీ నిర్విఘ్నంగా సాగాలి.',
  },
  {
    id: 'bathukamma',
    name: 'Bathukamma Festival',
    teluguName: 'బతుకమ్మ పండుగ',
    aliases: ['Bathukamma', 'Bathukamma Festival', 'Saddula Bathukamma', 'Engili Pula Bathukamma'],
    teluguAliases: ['బతుకమ్మ', 'బతుకమ్మ పండుగ', 'సద్దుల బతుకమ్మ', 'ఎంగిలి పూల బతుకమ్మ'],
    category: 'Regional Telugu',
    datesByYear: {
      2024: { dateString: '2024-10-02', dayOfWeek: 'Wednesday', tithi: 'Bhadrapada Amavasya (Mahalaya)', note: 'Ends with Saddula Bathukamma on Oct 10' },
      2025: { dateString: '2025-09-21', dayOfWeek: 'Sunday', tithi: 'Bhadrapada Amavasya (Mahalaya)', note: 'Ends with Saddula Bathukamma on Sep 29' },
      2026: { dateString: '2026-10-11', dayOfWeek: 'Sunday', tithi: 'Bhadrapada Amavasya (Mahalaya)', note: 'Ends with Saddula Bathukamma on Oct 19' },
      2027: { dateString: '2027-09-30', dayOfWeek: 'Thursday', tithi: 'Bhadrapada Amavasya', note: 'Ends with Saddula Bathukamma on Oct 8' },
      2028: { dateString: '2028-10-18', dayOfWeek: 'Wednesday', tithi: 'Bhadrapada Amavasya' },
      2029: { dateString: '2029-10-07', dayOfWeek: 'Sunday', tithi: 'Bhadrapada Amavasya' },
      2030: { dateString: '2030-09-26', dayOfWeek: 'Thursday', tithi: 'Bhadrapada Amavasya' },
    },
    significance: 'Grand floral festival of Telangana celebrating nature, womanhood, and Goddess Gauri with seasonal flowers.',
    significanceTelugu: 'తెలంగాణ సంస్కృతిని, ప్రకృతి సౌందర్యాన్ని, ఆడపడుచుల ఆనందాన్ని ప్రతిబింబించే పూల పండుగ.',
    greetingEnglish: 'Bathukamma Subhakankshalu, Chinna! Celebrating the vibrant blossoms of Telangana.',
    greetingTelugu: 'బతుకమ్మ పండుగ శుభాకాంక్షలు Chinna! బతుకమ్మ బతుకమ్మ ఉయ్యాలో.',
  },
  {
    id: 'gandhi_jayanti',
    name: 'Gandhi Jayanti',
    teluguName: 'గాంధీ జయంతి',
    aliases: ['Gandhi Jayanti', 'Mahatma Gandhi Jayanti', '2 October', 'International Day of Non-Violence'],
    teluguAliases: ['గాంధీ జయంతి', 'మహాత్మా గాంధీ జయంతి'],
    category: 'National',
    datesByYear: {
      2024: { dateString: '2024-10-02', dayOfWeek: 'Wednesday', note: 'National Holiday' },
      2025: { dateString: '2025-10-02', dayOfWeek: 'Thursday', note: 'National Holiday' },
      2026: { dateString: '2026-10-02', dayOfWeek: 'Friday', note: 'National Holiday' },
      2027: { dateString: '2027-10-02', dayOfWeek: 'Saturday', note: 'National Holiday' },
      2028: { dateString: '2028-10-02', dayOfWeek: 'Monday', note: 'National Holiday' },
      2029: { dateString: '2029-10-02', dayOfWeek: 'Tuesday', note: 'National Holiday' },
      2030: { dateString: '2030-10-02', dayOfWeek: 'Wednesday', note: 'National Holiday' },
    },
    significance: 'Honoring Mahatma Gandhi, the Father of the Nation, and champion of truth and non-violence.',
    significanceTelugu: 'జాతిపిత మహాత్మా గాంధీ జయంతి, అహింసా దినోత్సవం.',
    greetingEnglish: 'Gandhi Jayanti greetings, Chinna! Remembering the timeless ideals of truth and non-violence.',
    greetingTelugu: 'గాంధీ జయంతి శుభాకాంక్షలు Chinna!',
  },
  {
    id: 'dasara',
    name: 'Dasara / Vijayadashami',
    teluguName: 'దసరా / విజయదశమి',
    aliases: ['Dasara', 'Dussehra', 'Vijayadashami', 'Navratri Ends', 'Durga Puja Dashami', 'Ayudha Puja'],
    teluguAliases: ['దసరా', 'విజయదశమి', 'ఆయుధ పూజ', 'శమీ పూజ', 'జమ్మి చెట్టు పూజ'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-10-12', dayOfWeek: 'Saturday', tithi: 'Ashvina Shukla Dashami' },
      2025: { dateString: '2025-10-02', dayOfWeek: 'Thursday', tithi: 'Ashvina Shukla Dashami' },
      2026: { dateString: '2026-10-20', dayOfWeek: 'Tuesday', tithi: 'Ashvina Shukla Dashami' },
      2027: { dateString: '2027-10-10', dayOfWeek: 'Sunday', tithi: 'Ashvina Shukla Dashami' },
      2028: { dateString: '2028-09-28', dayOfWeek: 'Thursday', tithi: 'Ashvina Shukla Dashami' },
      2029: { dateString: '2029-10-17', dayOfWeek: 'Wednesday', tithi: 'Ashvina Shukla Dashami' },
      2030: { dateString: '2030-10-06', dayOfWeek: 'Sunday', tithi: 'Ashvina Shukla Dashami' },
    },
    significance: 'Victory of good over evil — Goddess Durga slaying Mahishasura and Lord Rama vanquishing Ravana.',
    significanceTelugu: 'చెడుపై మంచి సాధించిన విజయం, జమ్మి పూజ, ఆయుధ పూజల మహోత్సవం.',
    greetingEnglish: 'Happy Vijayadashami, Chinna! May this auspicious day bring you resounding victory in all endeavors.',
    greetingTelugu: 'విజయదశమి దసరా శుభాకాంక్షలు Chinna! మీకు విజయాలు చేకూరాలి.',
  },
  {
    id: 'diwali',
    name: 'Diwali / Deepavali',
    teluguName: 'దీపావళి',
    aliases: ['Diwali', 'Deepavali', 'Festival of Lights', 'Naraka Chaturdashi', 'Lakshmi Puja'],
    teluguAliases: ['దీపావళి', 'దీపాల పండుగ', 'నరక చతుర్దశి', 'లక్ష్మీ పూజ'],
    category: 'Major Hindu',
    datesByYear: {
      2024: { dateString: '2024-10-31', dayOfWeek: 'Thursday', tithi: 'Kartika Amavasya', note: 'Naraka Chaturdashi on Oct 30' },
      2025: { dateString: '2025-10-20', dayOfWeek: 'Monday', tithi: 'Kartika Amavasya', note: 'Naraka Chaturdashi on Oct 19' },
      2026: { dateString: '2026-11-08', dayOfWeek: 'Sunday', tithi: 'Kartika Amavasya', note: 'Naraka Chaturdashi on Nov 7' },
      2027: { dateString: '2027-10-28', dayOfWeek: 'Thursday', tithi: 'Kartika Amavasya', note: 'Naraka Chaturdashi on Oct 27' },
      2028: { dateString: '2028-10-17', dayOfWeek: 'Tuesday', tithi: 'Kartika Amavasya' },
      2029: { dateString: '2029-11-05', dayOfWeek: 'Monday', tithi: 'Kartika Amavasya' },
      2030: { dateString: '2030-10-26', dayOfWeek: 'Saturday', tithi: 'Kartika Amavasya' },
    },
    significance: 'Festival of Lights symbolizing the triumph of inner illumination over darkness and knowledge over ignorance.',
    significanceTelugu: 'చీకటిపై వెలుగు సాధించిన విజయం, ధనలక్ష్మి పూజ, దీపాలు, బాణసంచా సంబరం.',
    greetingEnglish: 'Happy Diwali, Chinna! May the radiant lights bring boundless joy, prosperity, and peace to your life.',
    greetingTelugu: 'దీపావళి శుభాకాంక్షలు Chinna! మీ ఇంట దీపాల వెలుగులు శాంతి సంతోషాలు నింపాలి.',
  },
  {
    id: 'karthika_purnima',
    name: 'Karthika Purnima',
    teluguName: 'కార్తీక పౌర్ణమి',
    aliases: ['Karthika Purnima', 'Karthika Deepam', 'Dev Diwali', 'Tripurari Purnima'],
    teluguAliases: ['కార్తీక పౌర్ణమి', 'కార్తీక దీపం', 'దేవ దీపావళి'],
    category: 'Regional Telugu',
    datesByYear: {
      2024: { dateString: '2024-11-15', dayOfWeek: 'Friday', tithi: 'Kartika Purnima' },
      2025: { dateString: '2025-11-05', dayOfWeek: 'Wednesday', tithi: 'Kartika Purnima' },
      2026: { dateString: '2026-11-24', dayOfWeek: 'Tuesday', tithi: 'Kartika Purnima' },
      2027: { dateString: '2027-11-13', dayOfWeek: 'Saturday', tithi: 'Kartika Purnima' },
      2028: { dateString: '2028-11-02', dayOfWeek: 'Thursday', tithi: 'Kartika Purnima' },
      2029: { dateString: '2029-11-21', dayOfWeek: 'Wednesday', tithi: 'Kartika Purnima' },
      2030: { dateString: '2030-11-10', dayOfWeek: 'Sunday', tithi: 'Kartika Purnima' },
    },
    significance: 'Auspicious full moon in Kartika month, celebrated with Shiva temple visits, river dips, and 365 wicks deepams.',
    significanceTelugu: 'శివాలయాల్లో 365 వత్తుల దీపారాధన, జ్వాలాతోరణం, నదీ స్నానాలు చేసే పరమ పవిత్ర దినం.',
    greetingEnglish: 'Happy Karthika Purnima, Chinna! May the divine lights guide your journey.',
    greetingTelugu: 'కార్తీక పౌర్ణమి దీపోత్సవ శుభాకాంక్షలు Chinna!',
  },
];

/**
 * Get accurate current Indian Standard Time (Asia/Kolkata, UTC +05:30)
 * Uses standard Intl API with fallback calculation.
 */
export function getCurrentIndiaTime(baseDate = new Date()): IndiaTimeInfo {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE_INDIA,
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).formatToParts(baseDate);

    const getPart = (type: string) => {
      const part = parts.find((p) => p.type === type);
      return part ? parseInt(part.value, 10) : 0;
    };

    const hours24 = getPart('hour');
    const minutes = getPart('minute');
    const seconds = getPart('second');

    const period: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formatted12 = `${hours12}:${pad(minutes)} ${period}`;
    const formatted12WithSec = `${hours12}:${pad(minutes)}:${pad(seconds)} ${period}`;
    const formatted24 = `${pad(hours24)}:${pad(minutes)}`;

    // Determine time of day in India
    let timeOfDay: IndiaTimeInfo['timeOfDay'] = 'morning';
    let greetingEnglish = 'Good morning, Chinna.';
    let greetingTelugu = 'శుభోదయం, Chinna.';
    let greetingMinglish = 'Good morning, Chinna! Ready ga unnava?';

    if (hours24 >= 4 && hours24 < 6) {
      timeOfDay = 'early_morning';
      greetingEnglish = 'Good early morning, Chinna. You are up early!';
      greetingTelugu = 'తెల్లవారుజామున శుభోదయం, Chinna!';
      greetingMinglish = 'Early morning Chinna! Em plan chesav eroju?';
    } else if (hours24 >= 6 && hours24 < 12) {
      timeOfDay = 'morning';
      greetingEnglish = 'Good morning, Chinna.';
      greetingTelugu = 'శుభోదయం, Chinna.';
      greetingMinglish = 'Good morning, Chinna! Today ela start cheddam?';
    } else if (hours24 >= 12 && hours24 < 17) {
      timeOfDay = 'afternoon';
      greetingEnglish = 'Good afternoon, Chinna.';
      greetingTelugu = 'గుడ్ ఆఫ్టర్నూన్, Chinna. భోజనం చేసారా?';
      greetingMinglish = 'Good afternoon, Chinna! Lunch chesara?';
    } else if (hours24 >= 17 && hours24 < 21) {
      timeOfDay = 'evening';
      greetingEnglish = 'Good evening, Chinna.';
      greetingTelugu = 'శుభ సాయంత్రం, Chinna.';
      greetingMinglish = 'Good evening, Chinna! Work ela jarugutundi?';
    } else if (hours24 >= 21 && hours24 < 24) {
      timeOfDay = 'night';
      greetingEnglish = "It's getting late, Chinna.";
      greetingTelugu = 'రాత్రి అవుతోంది Chinna, విశ్రాంతి తీసుకోండి.';
      greetingMinglish = 'Late avtundi Chinna, rest teesko.';
    } else {
      // 0 to 4 AM
      timeOfDay = 'late_night';
      greetingEnglish = "It's past midnight, Chinna. Don't push too hard.";
      greetingTelugu = 'చాలా ఆలస్యమైంది Chinna, పడుకోండి.';
      greetingMinglish = 'Inka nidrapoleda Chinna? Take care of your sleep.';
    }

    return {
      hours24,
      hours12,
      minutes,
      seconds,
      period,
      formatted12,
      formatted12WithSec,
      formatted24,
      timeZone: 'Asia/Kolkata',
      offset: 'UTC +05:30',
      timeOfDay,
      greetingEnglish,
      greetingTelugu,
      greetingMinglish,
    };
  } catch (err) {
    console.warn('[IndiaTime] Intl error, falling back to manual offset:', err);
    // Fallback manual offset (+5h 30m)
    const utc = baseDate.getTime() + baseDate.getTimezoneOffset() * 60000;
    const ist = new Date(utc + 5.5 * 3600000);
    const hours24 = ist.getHours();
    const minutes = ist.getMinutes();
    const seconds = ist.getSeconds();
    const period: 'AM' | 'PM' = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
    const pad = (n: number) => n.toString().padStart(2, '0');

    return {
      hours24,
      hours12,
      minutes,
      seconds,
      period,
      formatted12: `${hours12}:${pad(minutes)} ${period}`,
      formatted12WithSec: `${hours12}:${pad(minutes)}:${pad(seconds)} ${period}`,
      formatted24: `${pad(hours24)}:${pad(minutes)}`,
      timeZone: 'Asia/Kolkata',
      offset: 'UTC +05:30',
      timeOfDay: hours24 < 12 ? 'morning' : hours24 < 17 ? 'afternoon' : 'evening',
      greetingEnglish: 'Hello Chinna.',
      greetingTelugu: 'నమస్కారం Chinna.',
      greetingMinglish: 'Hi Chinna.',
    };
  }
}

/**
 * Get accurate current Indian Date in Asia/Kolkata timezone
 */
export function getCurrentIndiaDate(baseDate = new Date()): IndiaDateInfo {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE_INDIA,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'long',
    }).formatToParts(baseDate);

    const getPart = (type: string) => {
      const part = parts.find((p) => p.type === type);
      return part ? part.value : '';
    };

    const day = parseInt(getPart('day'), 10);
    const month = parseInt(getPart('month'), 10);
    const year = parseInt(getPart('year'), 10);
    const dayOfWeek = getPart('weekday');

    const MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const MONTH_NAMES_TELUGU = [
      'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
      'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'
    ];

    const DAYS_TELUGU: Record<string, string> = {
      Sunday: 'ఆదివారం',
      Monday: 'సోమవారం',
      Tuesday: 'మంగళవారం',
      Wednesday: 'బుధవారం',
      Thursday: 'గురువారం',
      Friday: 'శుక్రవారం',
      Saturday: 'శనివారం',
    };

    const monthName = MONTH_NAMES[month - 1] || 'September';
    const monthNameTelugu = MONTH_NAMES_TELUGU[month - 1] || 'సెప్టెంబర్';
    const dayOfWeekTelugu = DAYS_TELUGU[dayOfWeek] || dayOfWeek;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const formattedStandard = `${day} ${monthName} ${year}`;
    const formattedSlash = `${pad(day)}/${pad(month)}/${year}`;
    const formattedFull = `${dayOfWeek}, ${day} ${monthName} ${year}`;
    const formattedFullTelugu = `${dayOfWeekTelugu}, ${day} ${monthNameTelugu} ${year}`;

    // Check if this date matches "today" in IST
    const todayNow = new Date();
    const todayParts = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE_INDIA,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(todayNow);
    const todayDay = parseInt(todayParts.find(p => p.type === 'day')?.value || '0', 10);
    const todayMonth = parseInt(todayParts.find(p => p.type === 'month')?.value || '0', 10);
    const todayYear = parseInt(todayParts.find(p => p.type === 'year')?.value || '0', 10);

    const isToday = day === todayDay && month === todayMonth && year === todayYear;

    return {
      day,
      month,
      monthName,
      monthNameTelugu,
      year,
      dayOfWeek,
      dayOfWeekTelugu,
      formattedStandard,
      formattedSlash,
      formattedFull,
      formattedFullTelugu,
      isToday,
    };
  } catch (err) {
    console.warn('[IndiaDate] Intl error, falling back:', err);
    return {
      day: baseDate.getDate(),
      month: baseDate.getMonth() + 1,
      monthName: 'September',
      monthNameTelugu: 'సెప్టెంబర్',
      year: baseDate.getFullYear(),
      dayOfWeek: 'Thursday',
      dayOfWeekTelugu: 'గురువారం',
      formattedStandard: `${baseDate.getDate()} September ${baseDate.getFullYear()}`,
      formattedSlash: `${baseDate.getDate()}/09/${baseDate.getFullYear()}`,
      formattedFull: `Thursday, ${baseDate.getDate()} September ${baseDate.getFullYear()}`,
      formattedFullTelugu: `గురువారం, ${baseDate.getDate()} సెప్టెంబర్ ${baseDate.getFullYear()}`,
      isToday: true,
    };
  }
}

/**
 * Get relative Indian date (e.g. tomorrow: offset +1, yesterday: offset -1)
 */
export function getRelativeIndiaDate(offsetDays: number, baseDate = new Date()): IndiaDateInfo {
  const target = new Date(baseDate.getTime() + offsetDays * 86400000);
  return getCurrentIndiaDate(target);
}

/**
 * Normalizes query string for fuzzy festival matching
 */
function normalizeQuery(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s\u0C00-\u0C7F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find festival info by name with year awareness.
 * Follows the MANDATORY rule:
 * Many Hindu festival dates change every year.
 * If year is not passed, it uses the current Indian Standard Time year.
 */
export function findFestival(query: string, requestedYear?: number): {
  found: boolean;
  festival?: FestivalRecord;
  year?: number;
  dateInfo?: {
    dateString: string;
    dayOfWeek: string;
    tithi?: string;
    note?: string;
    formattedDate: string;
    formattedDateTelugu: string;
  };
  matchedName?: string;
  messageEnglish?: string;
  messageTelugu?: string;
  messageMinglish?: string;
} {
  const currentYear = getCurrentIndiaDate().year;
  const year = requestedYear && requestedYear >= 2000 && requestedYear <= 2100 ? requestedYear : currentYear;

  const cleanQuery = normalizeQuery(query);

  for (const festival of INDIAN_FESTIVALS) {
    const allAliases = [
      festival.name,
      festival.teluguName,
      ...festival.aliases,
      ...festival.teluguAliases,
    ];

    const isMatch = allAliases.some((alias) => {
      const cleanAlias = normalizeQuery(alias);
      return (
        cleanQuery.includes(cleanAlias) ||
        cleanAlias.includes(cleanQuery) ||
        (cleanQuery.includes('vinayaka') && cleanAlias.includes('vinayaka')) ||
        (cleanQuery.includes('ganesh') && cleanAlias.includes('ganesh')) ||
        (cleanQuery.includes('diwali') && cleanAlias.includes('diwali')) ||
        (cleanQuery.includes('deepavali') && cleanAlias.includes('deepavali')) ||
        (cleanQuery.includes('dasara') && cleanAlias.includes('dasara')) ||
        (cleanQuery.includes('dussehra') && cleanAlias.includes('dussehra')) ||
        (cleanQuery.includes('sankranti') && cleanAlias.includes('sankranti')) ||
        (cleanQuery.includes('ugadi') && cleanAlias.includes('ugadi')) ||
        (cleanQuery.includes('shivaratri') && cleanAlias.includes('shivaratri')) ||
        (cleanQuery.includes('holi') && cleanAlias.includes('holi')) ||
        (cleanQuery.includes('janmashtami') && cleanAlias.includes('janmashtami')) ||
        (cleanQuery.includes('rakhi') && cleanAlias.includes('rakhi')) ||
        (cleanQuery.includes('bathukamma') && cleanAlias.includes('bathukamma')) ||
        (cleanQuery.includes('రామ నవమి') && cleanAlias.includes('రామ నవమి')) ||
        (cleanQuery.includes('వినాయక') && cleanAlias.includes('వినాయక')) ||
        (cleanQuery.includes('దీపావళి') && cleanAlias.includes('దీపావళి')) ||
        (cleanQuery.includes('ఉగాది') && cleanAlias.includes('ఉగాది')) ||
        (cleanQuery.includes('కృష్ణాష్టమి') && cleanAlias.includes('కృష్ణాష్టమి'))
      );
    });

    if (isMatch) {
      const yearData = festival.datesByYear[year];
      if (yearData) {
        const [y, m, d] = yearData.dateString.split('-').map((v) => parseInt(v, 10));
        const MONTH_NAMES = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const MONTH_NAMES_TELUGU = [
          'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
          'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'
        ];

        const monthName = MONTH_NAMES[m - 1];
        const monthNameTelugu = MONTH_NAMES_TELUGU[m - 1];
        const formattedDate = `${yearData.dayOfWeek}, ${d} ${monthName} ${y}`;
        const formattedDateTelugu = `${d} ${monthNameTelugu} ${y} (${yearData.dayOfWeek})`;

        const messageEnglish = `Chinna, ${festival.name} in ${year} falls on ${formattedDate}.${yearData.tithi ? ` (${yearData.tithi})` : ''}`;
        const messageTelugu = `Chinna, ${year} సంవత్సరంలో ${festival.teluguName} ${formattedDateTelugu} న వస్తుంది.`;
        const messageMinglish = `Chinna, ఈ సంవత్సరం ${festival.name} (${festival.teluguName}) ${formattedDate} న వస్తుంది. ${festival.greetingTelugu}`;

        return {
          found: true,
          festival,
          year,
          dateInfo: {
            ...yearData,
            formattedDate,
            formattedDateTelugu,
          },
          matchedName: festival.name,
          messageEnglish,
          messageTelugu,
          messageMinglish,
        };
      } else {
        // Date not pre-calculated for distant year
        return {
          found: true,
          festival,
          year,
          messageEnglish: `Chinna, ${festival.name} is calculated by the Hindu lunar calendar (Panchang). Precise dates for ${year} depend on the lunar phase.`,
          messageTelugu: `Chinna, ${festival.teluguName} తేదీ పంచాంగ తిథి ఆధారంగా నిర్ణయిస్తారు. ${year} తేదీలను తిథి ప్రకారం చూడాల్సి ఉంటుంది.`,
          messageMinglish: `Chinna, ${festival.name} Panchang calendar tithi batti untundi. ${year} exact date lunar calendar tho calculate cheyali.`,
        };
      }
    }
  }

  return {
    found: false,
    year,
    messageEnglish: `I couldn't find specific festival details for "${query}". You can check our Indian Calendar for full dates.`,
    messageTelugu: `"${query}" పండుగ వివరాలు అందుబాటులో లేవు Chinna. మన క్యాలెండర్‌లో మరిన్ని వివరాలు చూడవచ్చు.`,
    messageMinglish: `"${query}" gurinchi exact festival data dhorakaledu Chinna. Okasari calendar open chesi chuddama?`,
  };
}

/**
 * Returns all festivals occurring in a specific calendar month
 */
export function getFestivalsForMonth(year: number, month: number): Array<{
  festival: FestivalRecord;
  day: number;
  dateString: string;
  dayOfWeek: string;
  tithi?: string;
}> {
  const result: Array<{
    festival: FestivalRecord;
    day: number;
    dateString: string;
    dayOfWeek: string;
    tithi?: string;
  }> = [];

  for (const fest of INDIAN_FESTIVALS) {
    const data = fest.datesByYear[year];
    if (data) {
      const [y, m, d] = data.dateString.split('-').map(Number);
      if (y === year && m === month) {
        result.push({
          festival: fest,
          day: d,
          dateString: data.dateString,
          dayOfWeek: data.dayOfWeek,
          tithi: data.tithi,
        });
      }
    }
  }

  // Sort by day ascending
  return result.sort((a, b) => a.day - b.day);
}

/**
 * Returns festivals for a specific date (YYYY-MM-DD)
 */
export function getFestivalsForDate(year: number, month: number, day: number): FestivalRecord[] {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const target = `${year}-${pad(month)}-${pad(day)}`;

  return INDIAN_FESTIVALS.filter((fest) => {
    const data = fest.datesByYear[year];
    return data && data.dateString === target;
  });
}

/**
 * Get upcoming festivals in India starting from baseDate
 */
export function getUpcomingFestivals(count = 3, baseDate = new Date()): Array<{
  festival: FestivalRecord;
  dateString: string;
  formattedDate: string;
  formattedDateTelugu: string;
  daysRemaining: number;
  dayOfWeek: string;
}> {
  const istDate = getCurrentIndiaDate(baseDate);
  const nowTime = new Date(`${istDate.year}-${String(istDate.month).padStart(2, '0')}-${String(istDate.day).padStart(2, '0')}T00:00:00`).getTime();

  const candidates: Array<{
    festival: FestivalRecord;
    dateString: string;
    formattedDate: string;
    formattedDateTelugu: string;
    daysRemaining: number;
    dayOfWeek: string;
    timestamp: number;
  }> = [];

  const checkYears = [istDate.year, istDate.year + 1];

  for (const yr of checkYears) {
    for (const fest of INDIAN_FESTIVALS) {
      const data = fest.datesByYear[yr];
      if (data) {
        const festTime = new Date(`${data.dateString}T00:00:00`).getTime();
        const diffMs = festTime - nowTime;
        const daysRemaining = Math.round(diffMs / 86400000);

        if (daysRemaining >= 0) {
          const [y, m, d] = data.dateString.split('-').map(Number);
          const MONTH_NAMES = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          const MONTH_NAMES_TELUGU = [
            'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
            'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్'
          ];
          candidates.push({
            festival: fest,
            dateString: data.dateString,
            formattedDate: `${d} ${MONTH_NAMES[m - 1]} ${y}`,
            formattedDateTelugu: `${d} ${MONTH_NAMES_TELUGU[m - 1]} ${y}`,
            daysRemaining,
            dayOfWeek: data.dayOfWeek,
            timestamp: festTime,
          });
        }
      }
    }
  }

  candidates.sort((a, b) => a.timestamp - b.timestamp);
  return candidates.slice(0, count);
}
