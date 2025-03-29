// REPLACES: appState.js - Converted to a Pinia store
import { defineStore } from 'pinia';

export const useAppState = defineStore('appState', {
  state: () => ({
    videoFile: null,
    vttCues: [],
    selectedCue: null
  }),
  actions: {
    setVideoFile(file) {
      this.videoFile = file;
    },
    setVttCues(cues) {
      this.vttCues = cues;
    },
    addCue(cue) {
      this.vttCues.push(cue);
    },
    selectCue(cue) {
      this.selectedCue = cue;
    },
    clearCues() {
      this.vttCues = [];
    }
  }
});