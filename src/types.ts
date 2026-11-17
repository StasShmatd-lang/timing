export type EventType = "jubilee" | "wedding" | "corporate";
export type Gender = "female" | "male";
export type WelcomeDuration = 30 | 45 | 60;
export type DanceArc = "warmup-2x30" | "sets-2x30" | "single-60";
export type Phase = "start" | "questionnaire" | "doodle" | "result";

export type Answers = {
  name: string;
  gender: Gender;
  photoDataUrl: string | null;
  eventType: EventType | null;
  eventTitle: string;
  companyName: string;
  heroFocus: string;
  goal: string;
  peakMoment: string;
  hasLocation: boolean;
  locationName: string;
  welcomeMinutes: WelcomeDuration;
  guestCount: number;
  toasts: boolean;
  bossSpeech: boolean;
  kidsPresent: boolean;
  alcoholLevel: string;
  teamMix: string;
  interactiveAfter: "welcome" | "first-toast";
  gastroPause: boolean;
  weddingRituals: boolean;
  ritualStyle: string;
  corpPhotoMeet: boolean;
  danceArc: DanceArc;
  exclusiveContests: boolean;
};

export type TimingBlock = {
  id: string;
  title: string;
  minutes: number;
  description: string;
  highlight?: string;
  kind:
    | "welcome"
    | "toast"
    | "interactive"
    | "gastro"
    | "ritual"
    | "photo"
    | "dance"
    | "disco"
    | "contest"
    | "finale"
    | "location";
};

export type HostLine = {
  id: string;
  text: string;
  atStage: number;
};
