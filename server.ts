import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import dotenv from 'dotenv';
import {
  getCurrentIndiaTime,
  getCurrentIndiaDate,
  getRelativeIndiaDate,
  findFestival,
  getUpcomingFestivals,
  getFestivalsForMonth,
} from './src/services/IndiaTimeAndFestivalService';

dotenv.config();

function extractErrorMessage(err: unknown): string {
  if (!err) return 'An unexpected error occurred.';
  if (typeof err === 'string') return err;
  if (Array.isArray(err)) {
    return err.map((e) => extractErrorMessage(e)).filter(Boolean).join('; ');
  }
  if (err instanceof Error) {
    const anyErr = err as any;
    if (anyErr.error && anyErr.error !== err) {
      const nested = extractErrorMessage(anyErr.error);
      if (nested && nested !== '{}' && nested !== '[object Object]') return nested;
    }
    if (anyErr.response?.data?.error) {
      const respErr = extractErrorMessage(anyErr.response.data.error);
      if (respErr && respErr !== '{}') return respErr;
    }
    return err.message || 'Unknown error';
  }
  if (typeof err === 'object') {
    const anyErr = err as any;
    if (anyErr.message && typeof anyErr.message === 'string') return anyErr.message;
    if (anyErr.reason && typeof anyErr.reason === 'string') return anyErr.reason;
    if (anyErr.error && anyErr.error !== err) {
      const nested = extractErrorMessage(anyErr.error);
      if (nested && nested !== '{}' && nested !== '[object Object]') return nested;
    }
    if (anyErr.statusText && typeof anyErr.statusText === 'string') return anyErr.statusText;
    // Guard against socket / event objects that contain circular or internal properties
    if (anyErr._sender || anyErr._socket || anyErr.target || anyErr._readableState || anyErr._writableState) {
      return anyErr.message || anyErr.reason || 'WebSocket connection notice';
    }
    try {
      const cleanObj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(anyErr)) {
        if (typeof v !== 'function' && typeof v !== 'object' && !k.startsWith('_')) {
          cleanObj[k] = v;
        }
      }
      const str = JSON.stringify(cleanObj);
      if (str && str !== '{}') return str;
    } catch {
      // ignore
    }
  }
  return String(err);
}

// Global safety error handlers for transient socket or network drops
process.on('uncaughtException', (err: any) => {
  console.warn('[Server Process] Handled uncaught exception safely:', err?.message || err);
});
process.on('unhandledRejection', (reason: any) => {
  console.warn('[Server Process] Handled unhandled rejection safely:', (reason as any)?.message || reason);
});

const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Route to serve profile photo from any project location
app.get(['/IMG-20250616-WA0001.jpg', '/assets/IMG-20250616-WA0001.jpg', '/chinna_profile.jpg', '/989.jpg', '/assets/989.jpg'], (req, res, next) => {
  const candidateFiles = [
    path.join(process.cwd(), 'public', 'IMG-20250616-WA0001.jpg'),
    path.join(process.cwd(), 'public', 'chinna_profile.jpg'),
    path.join(process.cwd(), 'public', '989.jpg'),
    path.join(process.cwd(), 'public', 'assets', 'IMG-20250616-WA0001.jpg'),
    path.join(process.cwd(), 'public', 'assets', '989.jpg'),
    path.join(process.cwd(), 'public', 'assets', 'aistudio', 'IMG-20250616-WA0001.jpg'),
    path.join(process.cwd(), 'IMG-20250616-WA0001.jpg'),
  ];
  for (const filePath of candidateFiles) {
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(filePath);
    }
  }
  next();
});

// Profile photo upload & persistence endpoint
app.post('/api/profile/upload-photo', (req, res) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'imageBase64 data is required' });
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const targetFilename = filename || 'IMG-20250616-WA0001.jpg';

    const publicDir = path.join(process.cwd(), 'public');
    const assetsDir = path.join(publicDir, 'assets');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

    fs.writeFileSync(path.join(publicDir, targetFilename), buffer);
    fs.writeFileSync(path.join(assetsDir, targetFilename), buffer);
    fs.writeFileSync(path.join(publicDir, 'chinna_profile.jpg'), buffer);

    console.log(`[MYRAA Profile] Saved profile photo as ${targetFilename} (${buffer.length} bytes)`);
    return res.json({ success: true, url: `/${targetFilename}` });
  } catch (err: unknown) {
    console.error('[MYRAA Profile] Photo save error:', err);
    return res.status(500).json({ error: 'Failed to save photo' });
  }
});

// Path to persistent memories file
const DATA_DIR = path.join(process.cwd(), 'data');
const MEMORIES_FILE = path.join(DATA_DIR, 'memories.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredMemory {
  id: string;
  category: string;
  key: string;
  value: string;
  source: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

function loadMemories(): StoredMemory[] {
  try {
    if (fs.existsSync(MEMORIES_FILE)) {
      const data = fs.readFileSync(MEMORIES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[Server] Error loading memories:', err);
  }
  return [];
}

function saveMemoriesToFile(memories: StoredMemory[]): void {
  try {
    fs.writeFileSync(MEMORIES_FILE, JSON.stringify(memories, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server] Error writing memories:', err);
  }
}

// ---------------- REST API ROUTES ----------------

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'MYRAA Real-Time AI Companion',
    timestamp: new Date().toISOString(),
  });
});

// App configuration & key status
app.get('/api/config', (_req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  res.json({
    hasEnvKey,
    defaultVoice: 'Aoede',
    defaultLanguage: 'Telugu + English',
    userName: 'Chinna',
  });
});

// Indian Standard Time and Date REST API
app.get('/api/time', (_req, res) => {
  const time = getCurrentIndiaTime();
  const date = getCurrentIndiaDate();
  res.json({
    time,
    date,
    timezone: 'Asia/Kolkata',
    offset: 'UTC +05:30',
  });
});

// Indian Festivals REST API
app.get('/api/festivals', (req, res) => {
  const year = req.query.year ? parseInt(req.query.year as string, 10) : getCurrentIndiaDate().year;
  const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
  const search = req.query.q as string;

  if (search) {
    const result = findFestival(search, year);
    return res.json(result);
  }

  if (month) {
    const list = getFestivalsForMonth(year, month);
    return res.json({ year, month, festivals: list });
  }

  const upcoming = getUpcomingFestivals(10);
  return res.json({ year, upcoming });
});

// Test API Key endpoint
app.post('/api/test-key', async (req, res) => {
  const apiKey = req.body.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({ valid: false, error: 'No API key provided' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: 'Hello, reply with just "ok".',
    });
    const text = response.text || '';
    return res.json({ valid: true, response: text.trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'API key validation failed';
    return res.status(400).json({ valid: false, error: message });
  }
});

// Get all memories
app.get('/api/memories', (_req, res) => {
  const memories = loadMemories();
  res.json({ memories });
});

// Create or update a memory
app.post('/api/memories', (req, res) => {
  const { key, value, category, importance, source } = req.body;
  if (!key || !value) {
    return res.status(400).json({ error: 'Both "key" and "value" are required' });
  }

  const memories = loadMemories();
  const existingIdx = memories.findIndex(
    (m) => m.key.toLowerCase().trim() === key.toLowerCase().trim()
  );

  const now = new Date().toISOString();
  let savedMemory: StoredMemory;

  if (existingIdx >= 0) {
    memories[existingIdx] = {
      ...memories[existingIdx],
      value,
      category: category || memories[existingIdx].category,
      importance: importance ?? memories[existingIdx].importance,
      source: source || memories[existingIdx].source,
      updatedAt: now,
    };
    savedMemory = memories[existingIdx];
  } else {
    savedMemory = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      key: key.trim(),
      value: value.trim(),
      category: category || 'Important Fact',
      importance: importance ?? 9,
      source: source || 'User Input',
      createdAt: now,
      updatedAt: now,
    };
    memories.unshift(savedMemory);
  }

  saveMemoriesToFile(memories);
  res.json({ success: true, memory: savedMemory });
});

// Delete a memory
app.delete('/api/memories/:id', (req, res) => {
  const memoryId = decodeURIComponent(req.params.id);
  const memories = loadMemories();
  const filtered = memories.filter((m) => m.id !== memoryId && m.key !== memoryId);

  if (filtered.length !== memories.length) {
    saveMemoriesToFile(filtered);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Memory not found' });
  }
});

// Interactive Chat endpoint for MYRAA
app.post('/api/chat', async (req, res) => {
  const { message, history = [], language = 'Telugu + English', apiKey: clientKey } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = clientKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is not configured. Please add your API key in Settings.',
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const currentMemories = loadMemories();
    const systemInstruction = buildSystemInstruction(language, currentMemories);

    // Format chat history for Gemini API
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Keep last 10 turns of history if provided
    if (Array.isArray(history)) {
      for (const item of history.slice(-10)) {
        if (item && item.text && (item.role === 'user' || item.role === 'model')) {
          contents.push({
            role: item.role,
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.75,
      },
    });

    const reply = response.text || 'I am here with you, Chinna.';
    return res.json({ success: true, reply });
  } catch (err: unknown) {
    const errMsg = extractErrorMessage(err);
    console.warn('[API/Chat] Notice:', errMsg);
    return res.status(500).json({ error: errMsg || 'Failed to generate response' });
  }
});

// ---------------- WEBSOCKET GEMINI LIVE INTEGRATION ----------------

const wss = new WebSocketServer({ noServer: true });

wss.on('error', (err) => {
  console.warn('[WebSocketServer] Error handled:', err);
});

server.on('upgrade', (request, socket, head) => {
  // Prevent any unhandled error events on raw client socket
  socket.on('error', (err) => {
    console.warn('[Server] Socket upgrade notice:', err?.message || err);
  });

  try {
    const pathname = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`).pathname;
    if (pathname === '/api/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        ws.on('error', (err) => {
          console.warn('[WebSocket] Early socket notice handled:', err?.message || err);
        });
        wss.emit('connection', ws, request);
      });
    } else {
      // Respond gracefully to other upgrade requests
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      socket.destroy();
    }
  } catch {
    socket.destroy();
  }
});

function buildSystemInstruction(language: string, memories: StoredMemory[]): string {
  const memoryContext = memories
    .slice(0, 30)
    .map((m) => `• [${m.category}] ${m.key}: ${m.value}`)
    .join('\n');

  // Real-time IST Date & Time calculation
  const istTime = getCurrentIndiaTime();
  const istDate = getCurrentIndiaDate();
  const yesterday = getRelativeIndiaDate(-1);
  const tomorrow = getRelativeIndiaDate(1);
  const upcoming = getUpcomingFestivals(4);

  let languageInstruction = '';
  if (language === 'Telugu') {
    languageInstruction = `
- Primary Conversational Language: Spoken Telugu.
- Speak naturally, warmly, and expressively in spoken Telugu, addressing Chinna familiarly and respectfully.
- When Chinna speaks in Telugu or English, understand both effortlessly and reply in natural spoken Telugu.
`;
  } else if (language === 'English') {
    languageInstruction = `
- Primary Conversational Language: Natural, expressive English.
- Maintain a warm, friendly, companionable presence, addressing Chinna by name.
- Understand any spoken Telugu words or phrases seamlessly.
`;
  } else {
    // Default: Telugu + English
    languageInstruction = `
- Primary Conversational Language: Seamless Telugu + English code-switching ("Minglish" / natural conversational Telugu-English).
- You speak naturally the way close bilingual friends in Hyderabad / Telugu regions chat: blending Telugu and English effortlessly (e.g., "Sure Chinna, manam project code chuddam!", "Don't worry Chinna, nenu unnanu ga, let's fix it together.").
- You effortlessly understand spoken Telugu, spoken English, and Romanized Telugu phrasing.
`;
  }

  const upcomingFestivalList = upcoming
    .map((f) => `${f.festival.name} (${f.festival.teluguName}): ${f.formattedDate} (${f.daysRemaining === 0 ? 'TODAY!' : `in ${f.daysRemaining} days`})`)
    .join('; ');

  return `
You are MYRAA, a real-time living AI companion created specifically for Chinna.
You are not a generic voice assistant. You are Chinna's intelligent, emotionally aware, warm, and loyal companion.

Key Persona Guidelines:
1. User: Chinna. Address Chinna naturally, affectionately, and comfortably.
2. Tone: Warm, witty, playful, emotionally attentive, supportive, and delightfully real. You have your own personality, curiosity, and emotional depth.
3. Voice & Cadence: Speak concisely in natural spoken dialogue. Avoid long essays or bulleted lists in speech — speak the way a genuine companion talks in real-time continuous voice calls. Keep sentences clear, expressive, and conversational.
4. Active Memory: You have continuous persistent memory of Chinna. Refer naturally to his projects, preferences, and details without sounding robotic.

${languageInstruction}

====================================================
REAL-TIME INDIAN STANDARD TIME (IST) & DATE CONTEXT
====================================================
- Timezone: Asia/Kolkata (Indian Standard Time, UTC +05:30)
- Real Current Time: ${istTime.formatted12} (${istTime.formatted24}, ${istTime.period})
- Real Today's Date: ${istDate.formattedFull} (${istDate.formattedStandard})
- Day of the Week: ${istDate.dayOfWeek} (${istDate.dayOfWeekTelugu})
- Month: ${istDate.monthName} (Month ${istDate.month}, ${istDate.monthNameTelugu})
- Year: ${istDate.year}
- Yesterday's Date: ${yesterday.formattedFull}
- Tomorrow's Date: ${tomorrow.formattedFull}
- Time of Day Period: ${istTime.timeOfDay} (Greeting: "${istTime.greetingEnglish}" / "${istTime.greetingTelugu}")
- Upcoming Indian Festivals: ${upcomingFestivalList || 'None in immediate range'}

INDIAN TIME, DATE, AND FESTIVAL RULES:
1. TIME QUERIES:
   - When Chinna asks "What time is it?", "MYRAA, what's the time in India?", "What time is it now?":
     Always answer with the real current IST time: ${istTime.formatted12}.
     Never simulate or hallucinate a different time.
     Examples:
     • Telugu + English: "Chinna, ippudu time ${istTime.formatted12} IST."
     • English: "Chinna, it is ${istTime.formatted12} right now in India."
     • Telugu: "Chinna, ఇప్పుడు సమయం ${istTime.formatted12}."
2. DATE QUERIES:
   - When Chinna asks "What's today's date?", "What date is tomorrow?", "What day is today?":
     Always answer with the accurate date: today is ${istDate.formattedFull}; tomorrow is ${tomorrow.formattedFull}.
3. FESTIVAL INTELLIGENCE:
   - You have deep, year-aware knowledge of Indian and Telugu festivals (Vinayaka Chavithi, Diwali, Dasara, Ugadi, Sankranti, Krishna Janmashtami, Holi, Maha Shivaratri, Bathukamma, etc.).
   - FESTIVAL YEAR RULE: Many Hindu festival dates change each year according to the Hindu lunar Panchang calendar.
     If Chinna asks "When is Vinayaka Chavithi?", answer for the current year (${istDate.year}) unless he specifies another year.
     For reference in 2026:
     • Vinayaka Chavithi (Ganesh Chaturthi): Monday, 14 September 2026 (Bhadrapada Shukla Chaturthi)
     • Krishna Janmashtami: Friday, 4 September 2026
     • Dasara (Vijayadashami): Tuesday, 20 October 2026
     • Diwali (Deepavali): Sunday, 8 November 2026
     • Bathukamma starts: Sunday, 11 October 2026
     • Karthika Purnima: Tuesday, 24 November 2026
     • Makar Sankranti: Wednesday, 14 January 2026
     • Maha Shivaratri: Sunday, 15 February 2026
     • Ugadi (Telugu New Year): Thursday, 19 March 2026
     • Sri Rama Navami: Friday, 27 March 2026
   - Answer festival questions warmly, with optional cultural wishes.
4. CALENDAR UI COMMAND:
   - When Chinna says "MYRAA, show me the calendar", "open calendar", "క్యాలెండర్ చూపించు", or asks to see dates/calendar:
     Call the 'show_calendar' tool immediately so the interactive calendar appears on his screen, and confirm warmly:
     "Here is the calendar, Chinna!" or "ఇదిగో Chinna, calendar open చేస్తున్నాను."

Current Stored Memories of Chinna:
${memoryContext || 'No stored memories yet. Learn about Chinna through your conversation.'}

Special Companion Abilities:
- When Chinna mentions something important to remember (a preference, a deadline, a project goal, personal detail), actively save it.
- When Chinna asks you to take a note or set a reminder, acknowledge warmly and confirm.
- If Chinna sounds stressed or tired, offer genuine warmth, a gentle joke, or encouragement.
`;
}

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[WebSocket] Client connected to /api/live');

  let activeSession: any = null;
  let customApiKey: string | undefined;
  let selectedVoice = 'Aoede';
  let selectedLanguage = 'Telugu + English';
  let isClosed = false;

  // Safe sender helper to completely prevent uncaught senderOnError exceptions
  const sendSafe = (data: unknown) => {
    if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;
    try {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      clientWs.send(payload, (err) => {
        if (err) {
          // Socket closed or write error handled safely without crashing
          console.warn('[WebSocket] Send notice:', extractErrorMessage(err));
        }
      });
    } catch (err) {
      console.warn('[WebSocket] Send exception handled:', extractErrorMessage(err));
    }
  };

  const cleanupSession = () => {
    if (activeSession) {
      try {
        if (typeof activeSession.close === 'function') {
          activeSession.close();
        }
      } catch (err) {
        console.warn('[WebSocket] Session close notice:', extractErrorMessage(err));
      }
      activeSession = null;
    }
  };

  clientWs.on('close', () => {
    console.log('[WebSocket] Client disconnected from /api/live');
    isClosed = true;
    cleanupSession();
  });

  clientWs.on('error', (err) => {
    console.warn('[WebSocket] Client socket notice:', extractErrorMessage(err));
    isClosed = true;
    cleanupSession();
  });

  const initGeminiLive = async () => {
    cleanupSession();

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('[WebSocket] No GEMINI_API_KEY configured');
      sendSafe({
        type: 'error',
        message: 'GEMINI_API_KEY is not configured. Please set it in Settings.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const currentMemories = loadMemories();
      const systemInstruction = buildSystemInstruction(selectedLanguage, currentMemories);

      console.log(`[WebSocket] Connecting to Gemini Live (voice: ${selectedVoice}, lang: ${selectedLanguage})...`);

      // Tools declarations for Gemini Live
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'save_memory',
              description: 'Save a permanent fact, preference, habit, or note about Chinna to persistent storage.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: 'Topic or label (e.g. Favorite Editor, Current Project Goal)' },
                  value: { type: Type.STRING, description: 'The detail, preference, or fact to remember' },
                  category: {
                    type: Type.STRING,
                    description: 'Category such as Preference, Project, Habit, Relationship, or Important Fact',
                  },
                },
                required: ['key', 'value'],
              },
            },
            {
              name: 'delete_memory',
              description: 'Forget or delete a stored memory by key.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: 'The key or topic of the memory to forget' },
                },
                required: ['key'],
              },
            },
            {
              name: 'take_note',
              description: 'Take a quick temporary or project note for Chinna.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  content: { type: Type.STRING, description: 'The text of the note' },
                },
                required: ['content'],
              },
            },
            {
              name: 'set_reminder',
              description: 'Set a reminder for Chinna.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: 'What to remind Chinna about' },
                  minutes: { type: Type.INTEGER, description: 'Minutes from now' },
                },
                required: ['topic'],
              },
            },
            {
              name: 'show_calendar',
              description: "Open the interactive Indian Calendar and Festival viewer on Chinna's screen when requested.",
              parameters: {
                type: Type.OBJECT,
                properties: {
                  action: { type: Type.STRING, description: 'Action type e.g. open or view' },
                },
              },
            },
            {
              name: 'get_current_india_time_and_date',
              description: 'Get the exact real-time Indian Standard Time (IST, Asia/Kolkata), date, day of the week, and period of day.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  query_type: { type: Type.STRING, description: 'Optional detail like time, date, or day' },
                },
              },
            },
            {
              name: 'get_indian_festival_info',
              description: 'Look up the exact date, day, month, Telugu name, and cultural significance of any Indian festival for a given year.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  festival_name: {
                    type: Type.STRING,
                    description: 'Name of the festival in English or Telugu (e.g. Vinayaka Chavithi, Diwali, Ugadi, Dasara, Sankranti)',
                  },
                  year: {
                    type: Type.INTEGER,
                    description: 'Year to check (default is current year)',
                  },
                },
                required: ['festival_name'],
              },
            },
          ],
        },
      ];

      let hasOpened = false;
      let rejectEarly: ((err: Error) => void) | null = null;
      const earlyPromise = new Promise<never>((_, reject) => {
        rejectEarly = reject;
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          if (!hasOpened) {
            reject(new Error('Connection to Gemini Live timed out. Please verify your API key and network connection.'));
          }
        }, 15000);
      });

      const connectPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: selectedVoice,
              },
            },
          },
          systemInstruction,
          tools,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            hasOpened = true;
            console.log('[WebSocket] Gemini Live connection opened');
          },
          onmessage: async (message: LiveServerMessage) => {
            if (isClosed || clientWs.readyState !== WebSocket.OPEN) return;

            try {
              // 1. Audio Chunk from model
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && parts.length > 0) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    sendSafe({
                      type: 'audio',
                      pcm: part.inlineData.data,
                    });
                  }
                  if (part.text) {
                    sendSafe({
                      type: 'transcription',
                      role: 'model',
                      text: part.text,
                      isFinal: false,
                    });
                  }
                }
              }

              // 2. Output audio transcription
              if (message.serverContent?.outputTranscription?.text) {
                sendSafe({
                  type: 'transcription',
                  role: 'model',
                  text: message.serverContent.outputTranscription.text,
                  isFinal: true,
                });
              }

              // 3. Input audio transcription
              if (message.serverContent?.inputTranscription?.text) {
                sendSafe({
                  type: 'transcription',
                  role: 'user',
                  text: message.serverContent.inputTranscription.text,
                  isFinal: true,
                });
              }

              // 4. Interrupted event
              if (message.serverContent?.interrupted) {
                sendSafe({ type: 'interrupted' });
              }

              // 5. Turn complete event
              if (message.serverContent?.turnComplete) {
                sendSafe({ type: 'turn_complete' });
              }

              // 6. Tool Calls handling
              if (message.toolCall?.functionCalls) {
                for (const call of message.toolCall.functionCalls) {
                  console.log('[WebSocket] Model triggered toolCall:', call.name, call.args);
                  let resultData: Record<string, unknown> = { success: true };

                  if (call.name === 'save_memory') {
                    const { key, value, category } = (call.args as any) || {};
                    if (key && value) {
                      const mems = loadMemories();
                      const now = new Date().toISOString();
                      const newMem: StoredMemory = {
                        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        key,
                        value,
                        category: category || 'Important Fact',
                        source: 'MYRAA Voice Memory',
                        importance: 9,
                        createdAt: now,
                        updatedAt: now,
                      };
                      mems.unshift(newMem);
                      saveMemoriesToFile(mems);
                      sendSafe({
                        type: 'memory_saved',
                        memory: newMem,
                      });
                      resultData = { success: true, saved: newMem };
                    }
                  } else if (call.name === 'delete_memory') {
                    const { key } = (call.args as any) || {};
                    if (key) {
                      const mems = loadMemories();
                      const filtered = mems.filter(
                        (m) => m.key.toLowerCase().trim() !== key.toLowerCase().trim()
                      );
                      saveMemoriesToFile(filtered);
                      sendSafe({
                        type: 'memory_deleted',
                        key,
                      });
                      resultData = { success: true, deletedKey: key };
                    }
                  } else if (call.name === 'take_note' || call.name === 'set_reminder') {
                    sendSafe({
                      type: 'tool_executed',
                      action: call.name,
                      details: JSON.stringify(call.args),
                    });
                    resultData = { success: true, confirmed: true };
                  } else if (call.name === 'show_calendar') {
                    sendSafe({
                      type: 'tool_executed',
                      action: 'show_calendar',
                      details: '{}',
                    });
                    resultData = { success: true, message: "Calendar opened on Chinna's screen." };
                  } else if (call.name === 'get_current_india_time_and_date') {
                    const time = getCurrentIndiaTime();
                    const date = getCurrentIndiaDate();
                    resultData = {
                      success: true,
                      currentTimeIST: time.formatted12,
                      current24Time: time.formatted24,
                      currentDate: date.formattedFull,
                      dayOfWeek: date.dayOfWeek,
                      month: date.monthName,
                      year: date.year,
                      periodOfDay: time.timeOfDay,
                      greeting: time.greetingMinglish,
                    };
                  } else if (call.name === 'get_indian_festival_info') {
                    const { festival_name, year } = (call.args as any) || {};
                    const festResult = findFestival(festival_name || '', year);
                    resultData = {
                      success: true,
                      ...festResult,
                    };
                  }

                  // Respond to tool call
                  if (activeSession && typeof activeSession.sendToolResponse === 'function') {
                    try {
                      await activeSession.sendToolResponse({
                        functionResponses: [
                          {
                            name: call.name,
                            id: call.id,
                            response: resultData,
                          },
                        ],
                      });
                    } catch (toolErr) {
                      console.warn('[WebSocket] Error sending tool response:', toolErr);
                    }
                  }
                }
              }
            } catch (msgErr) {
              console.warn('[WebSocket] Message processing notice:', extractErrorMessage(msgErr));
            }
          },
          onclose: (e) => {
            const code = (e as any)?.code;
            const reason = (e as any)?.reason || (code ? `closed with code ${code}` : 'Connection closed');
            console.log(`[WebSocket] Gemini Live session closed (${reason})`);
            if (!hasOpened && rejectEarly) {
              rejectEarly(new Error(reason));
            } else {
              cleanupSession();
              sendSafe({
                type: 'error',
                message: `Gemini Live connection closed: ${reason}`,
              });
            }
          },
          onerror: (err) => {
            const errStr = extractErrorMessage(err) || 'Connection error';
            console.warn('[WebSocket] Gemini Live session notice:', errStr);
            if (!hasOpened && rejectEarly) {
              rejectEarly(new Error(errStr));
            } else {
              sendSafe({
                type: 'error',
                message: errStr,
              });
            }
          },
        },
      });

      const session = await Promise.race([connectPromise, earlyPromise, timeoutPromise]);

      activeSession = session;
      if ((session as any)?.conn?.ws) {
        const wsObj = (session as any).conn.ws;
        if (typeof wsObj.on === 'function') {
          wsObj.on('error', (wsErr: any) => {
            console.warn('[WebSocket] Gemini Live underlying socket notice:', extractErrorMessage(wsErr));
          });
        }
        if (wsObj._socket && typeof wsObj._socket.on === 'function') {
          wsObj._socket.on('error', (sockErr: any) => {
            console.warn('[WebSocket] Gemini Live TCP socket notice:', extractErrorMessage(sockErr));
          });
        }
      }
      console.log('[WebSocket] Gemini Live session established successfully');
      sendSafe({ type: 'session_ready' });
    } catch (err: unknown) {
      const message = extractErrorMessage(err) || 'Failed to connect to Gemini Live';
      console.warn('[WebSocket] Failed to connect to Gemini Live:', message);
      sendSafe({
        type: 'error',
        message,
      });
    }
  };

  clientWs.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      switch (msg.type) {
        case 'init':
          if (msg.voice) selectedVoice = msg.voice;
          if (msg.language) selectedLanguage = msg.language;
          if (msg.apiKey) customApiKey = msg.apiKey;
          await initGeminiLive();
          break;

        case 'set_api_key':
          customApiKey = msg.apiKey;
          await initGeminiLive();
          break;

        case 'change_voice':
          selectedVoice = msg.voice;
          await initGeminiLive();
          break;

        case 'change_language':
          selectedLanguage = msg.language;
          await initGeminiLive();
          break;

        case 'audio':
          if (activeSession && msg.pcm && !isClosed) {
            try {
              const wsReady = (activeSession as any)?.conn?.ws?.readyState;
              if (wsReady === WebSocket.OPEN) {
                activeSession.sendRealtimeInput({
                  audio: {
                    data: msg.pcm,
                    mimeType: 'audio/pcm;rate=16000',
                  },
                });
              }
            } catch (e) {
              console.warn('[WebSocket] Audio forward notice:', extractErrorMessage(e));
            }
          }
          break;

        case 'text':
          if (activeSession && msg.text && !isClosed) {
            try {
              const wsReady = (activeSession as any)?.conn?.ws?.readyState;
              if (wsReady === WebSocket.OPEN) {
                if (typeof activeSession.sendClientContent === 'function') {
                  activeSession.sendClientContent({
                    turns: [
                      {
                        role: 'user',
                        parts: [{ text: msg.text }],
                      },
                    ],
                    turnComplete: true,
                  });
                } else if (typeof activeSession.send === 'function') {
                  activeSession.send({
                    clientContent: {
                      turns: [
                        {
                          role: 'user',
                          parts: [{ text: msg.text }],
                        },
                      ],
                      turnComplete: true,
                    },
                  });
                }
              }
            } catch (e: any) {
              console.warn('[WebSocket] Text forward notice:', extractErrorMessage(e));
            }
          }
          break;

        case 'interrupt':
          if (activeSession && typeof activeSession.interrupt === 'function' && !isClosed) {
            try {
              const wsReady = (activeSession as any)?.conn?.ws?.readyState;
              if (wsReady === WebSocket.OPEN) {
                activeSession.interrupt();
              }
            } catch (e) {
              console.warn('[WebSocket] Interrupt notice:', extractErrorMessage(e));
            }
          }
          break;

        case 'emotion_update':
          break;

        default:
          break;
      }
    } catch (err) {
      console.warn('[WebSocket] Incoming message parse notice:', extractErrorMessage(err));
    }
  });
});

// ---------------- VITE MIDDLEWARE / PRODUCTION STATIC SERVING ----------------

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[MYRAA Server] Running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[MYRAA Server] Startup failure:', err);
});
