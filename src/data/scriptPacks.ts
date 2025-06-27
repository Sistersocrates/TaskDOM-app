import { CSVScript, csvScripts, getCSVScriptsForEvent as getCSVScriptsForEventOriginal } from './csvScriptPacks';

export interface ScriptPack {
  id: string;
  pack: string;
  tone: string;
  nsfw_level: 'SFW' | 'NSFW';
  scenario: string;
  text: string;
}

// Original script packs (keeping existing ones)
const originalScriptPacks: ScriptPack[] = [
  // Dominant & Dirty Praise Script Pack
  {
    "id": "dom_dirty_ach_01",
    "pack": "Dominant & Dirty Praise Script Pack",
    "tone": "Dominant",
    "nsfw_level": "SFW",
    "scenario": "Achievement-Based Praise",
    "text": "Good girl. You didn't stop until it was done."
  },
  {
    "id": "dom_dirty_ach_02",
    "pack": "Dominant & Dirty Praise Script Pack",
    "tone": "Dominant",
    "nsfw_level": "SFW",
    "scenario": "Achievement-Based Praise",
    "text": "Look at you, devouring those pages. Hungry little thing."
  },
  {
    "id": "dom_dirty_ach_03",
    "pack": "Dominant & Dirty Praise Script Pack",
    "tone": "Dominant",
    "nsfw_level": "SFW",
    "scenario": "Achievement-Based Praise",
    "text": "You obeyed. I like that."
  },
  {
    "id": "dom_dirty_ach_04",
    "pack": "Dominant & Dirty Praise Script Pack",
    "tone": "Dominant",
    "nsfw_level": "SFW",
    "scenario": "Achievement-Based Praise",
    "text": "Every time you finish a task, you make it harder for me to behave."
  },
  {
    "id": "dom_dirty_ach_05",
    "pack": "Dominant & Dirty Praise Script Pack",
    "tone": "Dominant",
    "nsfw_level": "SFW",
    "scenario": "Achievement-Based Praise",
    "text": "You're getting off on praise, aren't you?"
  },
  {
    "id": "dom_dirty_ach_06",
    "pack": "Dominant & Dirty Praise Script Pack",
    "tone": "Dominant",
    "nsfw_level": "SFW",
    "scenario": "Achievement-Based Praise",
    "text": "Such discipline… I might reward you for that."
  },
  // ... (keeping all existing scripts for backward compatibility)
];

// Convert CSV scripts to ScriptPack format
const csvToScriptPacks = (csvScripts: CSVScript[]): ScriptPack[] => {
  return csvScripts.map(csvScript => ({
    id: csvScript.id,
    pack: csvScript.category,
    tone: csvScript.tone,
    nsfw_level: csvScript.nsfw_level,
    scenario: csvScript.subCategory,
    text: csvScript.script
  }));
};

// Combine original and CSV scripts
export const scriptPacks: ScriptPack[] = [
  ...originalScriptPacks,
  ...csvToScriptPacks(csvScripts)
];

// Helper functions to filter scripts
const getScriptsByTone = (tone: string): ScriptPack[] => {
  return scriptPacks.filter(script => 
    script.tone.toLowerCase().includes(tone.toLowerCase())
  );
};

const getScriptsByNSFWLevel = (nsfwLevel: 'SFW' | 'NSFW'): ScriptPack[] => {
  return scriptPacks.filter(script => script.nsfw_level === nsfwLevel);
};

const getScriptsByScenario = (scenario: string): ScriptPack[] => {
  return scriptPacks.filter(script => 
    script.scenario.toLowerCase().includes(scenario.toLowerCase())
  );
};

const getScriptsByPack = (packName: string): ScriptPack[] => {
  return scriptPacks.filter(script => script.pack === packName);
};

// Get random script by criteria
export const getRandomScript = (
  tone?: string,
  nsfwLevel?: 'SFW' | 'NSFW',
  scenario?: string
): ScriptPack | null => {
  let filtered = scriptPacks;
  
  if (tone) {
    filtered = filtered.filter(script => 
      script.tone.toLowerCase().includes(tone.toLowerCase())
    );
  }
  
  if (nsfwLevel) {
    filtered = filtered.filter(script => script.nsfw_level === nsfwLevel);
  }
  
  if (scenario) {
    filtered = filtered.filter(script => 
      script.scenario.toLowerCase().includes(scenario.toLowerCase())
    );
  }
  
  if (filtered.length === 0) return null;
  
  return filtered[Math.floor(Math.random() * filtered.length)];
};

// Map voice styles to script tones (enhanced with CSV data)
const getScriptsForVoiceStyle = (
  voiceStyle: 'flirty' | 'dominant' | 'wholesome',
  nsfwLevel: 'SFW' | 'NSFW' = 'SFW'
): ScriptPack[] => {
  const toneMap = {
    flirty: [
      'Flirty & Fun', 
      'Wholesome & Flirty',
      'Cheeky Praise & Dirty Puns',
      'Sassy, Pun-Filled Encouragement',
      'Mini Praise Clips',
      'Bookish Flirt Tropes'
    ],
    dominant: [
      'Dominant', 
      'Dark Fantasy / Villain Energy', 
      'Soft & Seductive',
      'Achievement-Based Praise',
      'Short Phrases for Button Sounds'
    ],
    wholesome: [
      'Wholesome & Flirty', 
      'Neutral Assistant', 
      'Neutral Voice with Light Humor',
      'Gentler but still cute and spicy'
    ]
  };
  
  const relevantTones = toneMap[voiceStyle] || [];
  
  return scriptPacks.filter(script => 
    relevantTones.some(tone => script.tone.includes(tone) || script.scenario.includes(tone)) &&
    script.nsfw_level === nsfwLevel
  );
};

// Get scripts for specific reading events (enhanced with CSV data)
export const getScriptsForEvent = (
  event: 'session_start' | 'session_end' | 'milestone' | 'achievement' | 'spicy_scene' | 'motivation' | 'progress_25' | 'progress_50' | 'progress_75' | 'progress_100' | 'task_complete' | 'daily_goal' | 'streak' | 'milestone_15min' | 'milestone_30min' | 'milestone_60min',
  voiceStyle: 'flirty' | 'dominant' | 'wholesome',
  nsfwLevel: 'SFW' | 'NSFW' = 'SFW'
): ScriptPack[] => {
  // First try to get CSV scripts for the event
  const csvScripts = getCSVScriptsForEventOriginal(event, voiceStyle, nsfwLevel);
  const csvScriptPacks = csvToScriptPacks(csvScripts);
  
  // Then get original scripts
  const eventScenarioMap = {
    session_start: ['Routine-Based Notifications: Reading Start', 'Focus Session Encouragement', 'General Praise', 'Achievement-Based Praise', 'Wholesome & Flirty'],
    session_end: ['Routine-Based Notifications: Reading End', 'Task Completion', 'Reading session done', 'Focus Timer Done', 'Achievement-Based Praise'],
    milestone: ['Reading Milestone Feedback', 'Achievement-Based Praise', 'Praise for Progress', 'Reading Praise', 'Cheeky Praise & Dirty Puns'],
    milestone_15min: ['Achievement-Based Praise', 'Focus Session Encouragement', 'General Praise', 'Mini Praise Clips'],
    milestone_30min: ['Achievement-Based Praise', 'Focus Session Encouragement', 'General Praise', 'Soft & Seductive'],
    milestone_60min: ['Achievement-Based Praise', 'Focus Session Encouragement', 'General Praise', 'Dark Fantasy / Villain Energy'],
    achievement: ['Achievement-Based Praise', 'Task Completion Praise', 'Routine-Based Notifications: Task Completed', 'Routine-Based Notifications: Goal Reached'],
    spicy_scene: ['Quick NSFW Buttons', 'Mini NSFW One-Liners', 'Literary NSFW Praise', 'Button Tap Options', 'Tap-to-Hear Micro Affirmations', 'Short Phrases for Button Sounds', 'Mini Praise Clips'],
    motivation: ['Motivation', 'Sassy, Pun-Filled Encouragement', 'Spicy Threats as Motivation', 'Focus Session Encouragement'],
    progress_25: ['Achievement-Based Praise', 'Praise for Progress', 'General Praise', 'Reading Praise'],
    progress_50: ['Achievement-Based Praise', 'Praise for Progress', 'General Praise', 'Reading Praise', 'Cheeky Praise & Dirty Puns'],
    progress_75: ['Achievement-Based Praise', 'Praise for Progress', 'General Praise', 'Reading Praise', 'Soft & Seductive'],
    progress_100: ['Achievement-Based Praise', 'Praise for Progress', 'Task finished', 'Reading session done', 'Routine-Based Notifications: Goal Reached'],
    task_complete: ['Task Completion Praise', 'Task Completion', 'Achievement-Based Praise', 'Routine-Based Notifications: Task Completed', 'Short Phrases for Button Sounds'],
    daily_goal: ['Routine-Based Notifications: Goal Reached', 'Achievement-Based Praise', 'Task Completion', 'Routine-Based Notifications: Goal Reached'],
    streak: ['Achievement-Based Praise', 'General Praise', 'Focus Session Encouragement', 'Routine-Based Notifications: Goal Reached', 'Bookish Flirt Tropes']
  };
  
  const relevantScenarios = eventScenarioMap[event] || ['General Praise'];
  const styleScripts = getScriptsForVoiceStyle(voiceStyle, nsfwLevel);
  
  const originalScripts = styleScripts.filter(script =>
    relevantScenarios.some(scenario => 
      script.scenario.toLowerCase().includes(scenario.toLowerCase())
    )
  );

  // Combine CSV and original scripts, prioritizing CSV scripts
  return [...csvScriptPacks, ...originalScripts];
};

// Get all available script categories
const getScriptCategories = (): string[] => {
  return [...new Set(scriptPacks.map(script => script.pack))];
};

// Get all available script scenarios
const getScriptScenarios = (): string[] => {
  return [...new Set(scriptPacks.map(script => script.scenario))];
};

// Get all available script tones
const getScriptTones = (): string[] => {
  return [...new Set(scriptPacks.map(script => script.tone))];
};