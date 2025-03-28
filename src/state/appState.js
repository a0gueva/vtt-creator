// store/todos.js
import {ref } from "vue";

/**
 * {id: props.cue.id, 
    startTime: props.cue.startTime,
    endTime: endSecs,
    text: vttText.value,
    saved: cue.saved,
    type: vttType.value
    }
 */
const state = ref({
    vttObj: {vttType: "metadata",
        vttCues: [],
    },
});

export function appState() {
    // do the registration here
    const pushCue = (cue) => {
        state.value.vttObj.vttCues.push(cue);
        console.log("CUE :: ", cue);
    }
    const getVTTObj = () => {
        return state.value.vttObj;
    }
    const uploadVTT = (fileContent) => {
        state.value.vttObj = JSON.parse(fileContent);
    }
    const deleteCue = (cue) => {
        state.value.vttObj.vttCues = 
            state.value.vttObj.vttCues.filter(function(item) {
            return item.id !== cue.id;
        });
    }
    const stringifyVTT = () => {
        return JSON.stringify(state.value.vttObj, 
            ["vttType", "vttCues", 
                "id", "startTime", 
                "endTime", "text", 
                "productArray", "msg",
                "pause", "type"], 2);
    }   
    return {state, pushCue, stringifyVTT, getVTTObj, uploadVTT, deleteCue};
}

export default {
    appState
}