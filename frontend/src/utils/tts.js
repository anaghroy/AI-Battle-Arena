let voices = [];

speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
};

export const loadVoices = () => {
  voices = speechSynthesis.getVoices();
};

// PERSONALITIES
export const personalities = {
  serious: {
    voiceIndex: 0,
    rate: 0.95,
    pitch: 0.9,
  },
  energetic: {
    voiceIndex: 1,
    rate: 1.1,
    pitch: 1.3,
  },
  calm: {
    voiceIndex: 2,
    rate: 0.9,
    pitch: 0.8,
  },
  aggressive: {
    voiceIndex: 3,
    rate: 1.2,
    pitch: 1.4,
  },
};

// Best: sequential speaking
export const speakAsync = (text, personality = "serious") => {
  return new Promise((resolve) => {
    if (!text) return resolve();

    const config = personalities[personality];

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.voice = voices[config.voiceIndex] || null;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;

    utterance.onend = resolve;

    speechSynthesis.speak(utterance);
  });
};

// Sentence split
export const splitIntoSentences = (text) => {
  return text.match(/[^.!?]+[.!?]+/g) || [text];
};

let isDebateActive = false;

export const stopSpeaking = () => {
  isDebateActive = false;
  speechSynthesis.cancel();
};

export const playDebate = async (modelA, modelB) => {
  speechSynthesis.cancel();
  isDebateActive = true;

  const aParts = splitIntoSentences(modelA);
  const bParts = splitIntoSentences(modelB);

  const maxLength = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < maxLength; i++) {
    if (!isDebateActive) break;

    if (aParts[i]) {
      await speakAsync(aParts[i], "serious");
      if (!isDebateActive) break;
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!isDebateActive) break;

    if (bParts[i]) {
      await speakAsync(bParts[i], "energetic");
      if (!isDebateActive) break;
      await new Promise((r) => setTimeout(r, 300));
    }
  }
  isDebateActive = false;
};

export const playIndividual = async (text, personality) => {
  speechSynthesis.cancel();
  isDebateActive = true;

  const parts = splitIntoSentences(text);

  for (let i = 0; i < parts.length; i++) {
    if (!isDebateActive) break;

    if (parts[i]) {
      await speakAsync(parts[i], personality);
      if (!isDebateActive) break;
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  isDebateActive = false;
};
