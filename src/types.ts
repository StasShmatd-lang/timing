export type EventType = "jubilee" | "wedding" | "corporate";
export type Gender = "female" | "male";
export type WelcomeDuration = 30 | 45 | 60;
export type Phase =
  | "start"
  | "questionnaire"
  | "doodle"
  | "result";

export type Answers = {
  name: string;
  gender: Gender;
  photoDataUrl: string | null;
  eventType: EventType | null;
  eventTitle: string;
  companyName: string;
  goal: string;
  hasLocation: boolean;
  locationName: string;
  welcomeMinutes: WelcomeDuration;
  guestCount: number;
  toasts: boolean;
  bossSpeech: boolean;
  interactiveAfter: "welcome" | "first-toast";
  gastroPause: boolean;
  weddingRituals: boolean;
  corpPhotoMeet: boolean;
  dancesBeforeDisco: boolean;
  discoBlocks: boolean;
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
