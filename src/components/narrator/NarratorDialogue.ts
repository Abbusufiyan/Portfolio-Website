// All narrator copy lives here. Edit freely.
// Entry fields:
//   text | lines[]  -> what is said (lines = random variant each time)
//   expression      -> 'neutral' | 'happy' | 'surprised' | 'curious'
//   gesture         -> 'wave' | 'explain' | 'point' | 'present' | 'celebrate' | 'shrug' | 'none'
//   look            -> -1 (turn left) .. 1 (turn right) while speaking
//   voice           -> false = bubble + reaction only (used for hovers)

export interface DialogueEntry {
  text?: string;
  lines?: string[];
  expression?: string;
  gesture?: string;
  look?: number;
  voice?: boolean;
}

export const DIALOGUE: Record<string, DialogueEntry> = {
  // ---- Sections: <section data-narrator-section="home"> ----
  home: {
    text: "Hey! Welcome to my portfolio. Let me show you around.",
    expression: 'happy',
    gesture: 'wave',
    look: 0
  },
  about: {
    text: "Here you can learn more about me, my background and what drives my work.",
    expression: 'happy',
    gesture: 'present',
    look: -1
  },
  skills: {
    text: "These are some of the key technologies, frameworks and tools I work with.",
    expression: 'curious',
    gesture: 'explain',
    look: 1
  },
  projects: {
    text: "Here are some of the interactive projects and applications I've built.",
    expression: 'happy',
    gesture: 'present',
    look: -1
  },
  contact: {
    text: "If you'd like to collaborate or start a conversation, feel free to reach out here!",
    expression: 'happy',
    gesture: 'point',
    look: 1
  },

  // ---- Hover reactions: <div data-narrator-hover="hoverProject"> (silent) ----
  hoverProject: {
    lines: ["Ooh, nice choice!", "Curious about this project?"],
    expression: 'surprised',
    gesture: 'point',
    voice: false
  },
  hoverContact: {
    text: "Don't be shy! Send a quick message.",
    expression: 'happy',
    gesture: 'wave',
    voice: false
  },

  // ---- Click reactions: <a data-narrator-click="projectClick"> ----
  projectClick: {
    lines: ["Great choice! That project was super fun to craft.", "Ooh, let's take a closer look!"],
    expression: 'surprised',
    gesture: 'celebrate'
  },

  // ---- "Talk to me" button responses ----
  chat: {
    lines: [
      "I live right here inside this website! Scroll around and I'll guide you.",
      "Fun fact: this helmet is for aerodynamic coding. Mostly vibes, though!",
      "Hover over cards and buttons — I love reacting to your clicks!",
    ],
    expression: 'happy',
    gesture: 'explain'
  },
};
