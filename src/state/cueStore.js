// Replaces: old appState.js (uses Vue reactive now with Pinia)

// cueStore.js - replaces the original cueStore.js and adds compatibility with updated App.vue and CueBuilder.vue

import { defineStore } from 'pinia';
// import { v4 as uuidv4 } from 'uuid';

export const useCueStore = defineStore('cueStore', {
  state: () => ({
    vttObj: {
      vttCues: [],
      vttType: 'metadata'
    },
    selectedCueId: null
  }),
  getters: {
    selectedCue(state) {
      return state.vttObj.vttCues.find(c => c.id === state.selectedCueId);
    },
    getVTTObj: (state) => {
      console.log("CALLING THE STORE !!!");
      return () => state.vttObj;
    }
  },
  actions: {
    pushCue(cueData) {
      const index = this.vttObj.vttCues.findIndex(c => c.id === cueData.id);
      if (index !== -1) {
        // Update existing
        this.vttObj.vttCues[index] = { ...this.vttObj.vttCues[index], ...cueData };
      } else {
        // New cue
        this.vttObj.vttCues.push({
          ...cueData
        });
      }
    },
    deleteCue(cue) {
      this.vttObj.vttCues = this.vttObj.vttCues.filter(c => c.id !== cue.id);
      if (this.selectedCueId === cue.id) {
        this.selectedCueId = null;
      }
    },
    clearAll() {
      this.vttObj.vttCues = [];
      this.selectedCueId = null;
    },
    uploadVTT(jsonString) {
      try {
        const parsed = JSON.parse(jsonString);
        if (parsed.vttCues && Array.isArray(parsed.vttCues)) {
          this.vttObj.vttCues = parsed.vttCues;
          this.vttObj.vttType = parsed.vttType || 'metadata';
        }
      } catch (e) {
        console.error("Invalid VTT JSON");
      }
    },
    stringifyVTT() {
      console.log("VTT OJB :: , this.vttObj)");
      return JSON.stringify(this.vttObj, null, 2);
    }
  }
});
