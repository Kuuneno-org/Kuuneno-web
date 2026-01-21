import { defineStore } from "pinia";

export const useExperienceStore = defineStore("experience", {
  state: () => ({
    fireOn: false,
    audioEnabled: false,
  }),
  actions: {
    setFireOn(v: boolean) {
      this.fireOn = v;
    },
    setAudioEnabled(v: boolean) {
      this.audioEnabled = v;
    },
  },
});
