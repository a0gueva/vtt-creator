<template>
  <div class="vtt-inputs">
    <div class="close" @click="deleteCuePointer"></div>
    <div class="start-time">
      <label>start time</label>
      <input
        class="msg txt-input"
        v-model="vttStart"
        ref="vttStartRef"
        :pattern="inputPattern"
        type="text"
        required
        :readonly="cue.saved"
        placeholder="hh:mm:ss.SSS"
        @input="inputHandler"
      />
    </div>
    <div class="end-time">
      <label>end time</label>
      <input
        class="msg txt-input"
        v-model="vttEnd"
        ref="vttEndRef"
        :pattern="inputPattern"
        type="text"
        required
        :readonly="cue.saved"
        placeholder="hh:mm:ss.SSS"
        @input="inputHandler"
      />
    </div>
    <div v-if="!cue.saved" class="vtt-type" @click.stop>
      <label><input type="checkbox" value="false" name="pause-vid" v-model="pauseVid" /> Pause on Cue</label>
      <label><input type="radio" value="products" :name="cue.id" v-model="vttType" /> Product</label>
      <label><input type="radio" value="text" :name="cue.id" v-model="vttType" /> Text</label>
    </div>
    <div v-else class="vtt-type">
      <span v-if="cue.text.pause">THIS CUE PAUSES THE VIDEO STREAM FOR 3 SECONDS</span>
    </div>
    <div class="error" :class="{'on': vttError !== null}">{{ vttError }}</div>
    <div class="meta-text">
      <label>{{ vttType }}</label>
      <textarea
        class="msg txt-input"
        v-model="vttText"
        ref="vttTextRef"
        required
        :readonly="cue.saved"
        placeholder="Enter list of product PC9s (e.g. 188820445,196260276,349640112)"
        @change="inputHandler"
      />
    </div>
    <div v-if="vttType === 'products'" class="meta-text">
      <label class="col-msg">scene description</label>
      <input :readonly="cue.saved" type="text" v-model="colMsg" class="cue-comment" />
    </div>
    <button v-if="!cue.saved" @click="buildVTT">Save Cue</button>
    <div v-else class="saved-cue">Saved</div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useCueStore } from "@/state/cueStore"; // NEW: using Pinia store

export default {
  props: {
    cue: Object,
  },

  setup(props, { emit }) {
    const cueStore = useCueStore(); // NEW: init Pinia store
    const vttStart = ref("");
    const vttEnd = ref("");
    const vttText = ref("");
    const colMsg = ref(null);
    const vttError = ref(null);
    const vttType = ref("products");
    const pauseVid = ref(false);
    const inputPattern = ref("^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d\\.\\d{3}$");

    const vttStartRef = ref(null);
    const vttEndRef = ref(null);
    const vttTextRef = ref(null);

    const inputHandler = (e) => {
      e.target.setCustomValidity("");
    };

    const deleteCuePointer = () => {
      emit("close-builder", { cue: props.cue, delete: true });
    };

    const buildVTT = () => {
      const start = vttStartRef.value;
      const end = vttEndRef.value;
      const textRef = vttTextRef.value;
      let startSecs = 0;
      let endSecs = 0;

      if (start.checkValidity()) {
        // const [h, m, s, ms] = vttStart.value.split(':').map(Number);
        const [h, m, rest] = vttStart.value.split(':');
        const [s, ms] = rest.split('.');
        startSecs = (+h * 3600) + (+m * 60) + (+s) + (+ms / 1000);
        // startSecs = h * 3600 + m * 60 + s + (ms / 1000);
      } else {
        start.setCustomValidity("value must match pattern hh:mm:ss.SSS");
        start.reportValidity();
        return;
      }

      if (end.checkValidity()) {
        // const [h, m, s, ms] = vttEnd.value.split(':').map(Number);
        // endSecs = h * 3600 + m * 60 + s + (ms / 1000);
        const [h, m, rest] = vttEnd.value.split(':');
        const [s, ms] = rest.split('.');
        endSecs = (+h * 3600) + (+m * 60) + (+s) + (+ms / 1000);
      } else {
        end.setCustomValidity("value must match pattern hh:mm:ss.SSS");
        end.reportValidity();
        return;
      }

      if (endSecs > startSecs) {
        let productCue = null;
        if (vttType.value === "products" && vttText.value.match("^\\d{9}(?:|,?(| )\\d{9})*$")) {
          const productArray = vttText.value.split(",").map(item => item.trim());
          productCue = {
            productArray,
            msg: colMsg.value,
            pause: pauseVid.value
          };
          vttError.value = null;

          cueStore.pushCue({
            id: props.cue.id,
            startTime: props.cue.startTime,
            endTime: endSecs,
            text: productCue,
            saved: true,
            type: vttType.value
          });

          emit("close-builder", { cue: props.cue, delete: false });

        } else if (vttType.value === "text") {
          vttError.value = null;
          productCue = {
            productArray: null,
            msg: vttText.value,
            pause: pauseVid.value
          };

          cueStore.pushCue({
            id: props.cue.id,
            startTime: props.cue.startTime,
            endTime: endSecs,
            text: productCue,
            saved: true,
            type: vttType.value
          });

          emit("close-builder", { cue: props.cue, delete: false });

        } else {
          textRef.setCustomValidity("value is not a valid set of product ids");
          textRef.reportValidity();
          vttError.value = "Input is not a list of products, make sure that you type in a list of pc9s separated by commas";
        }
      } else {
        vttError.value = "Cue End Time must be greater than Start Time";
      }
    };

    // const formatCueTime = (timestamp) => {
    //   const hours = Math.floor(timestamp / 3600);
    //   const minutes = Math.floor((timestamp % 3600) / 60);
    //   const seconds = Math.floor(timestamp % 60);
    //   return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    // };

    const formatCueTime = (timestamp) => {
      const hours = Math.floor(timestamp / 3600);
      const minutes = Math.floor((timestamp % 3600) / 60);
      const seconds = Math.floor(timestamp % 60);
      const milliseconds = Math.round((timestamp % 1) * 1000);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
    };

    onMounted(() => {
      vttStart.value = formatCueTime(props.cue.startTime);
      vttEnd.value = formatCueTime(props.cue.startTime + 2);
      vttType.value = props.cue.vttType;

      switch (props.cue.vttType) {
        case "products":
          vttText.value = props.cue.text.productArray;
          colMsg.value = props.cue.text.msg;
          break;
        case "text":
          vttText.value = props.cue.text.msg;
          break;
      }
    });

    return {
      vttStart,
      vttEnd,
      vttText,
      vttStartRef,
      vttEndRef,
      vttTextRef,
      inputHandler,
      buildVTT,
      inputPattern,
      vttError,
      deleteCuePointer,
      vttType,
      pauseVid,
      colMsg
    };
  }
};
</script>

<style scoped lang="scss">
  .vtt-inputs {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    width: 300px;
    position: relative;
    padding: 40px 0 10px;
    border-radius: 10px;
    .vtt-type {
      label {
        text-transform: uppercase;
        letter-spacing: 1.2px;
      }
      span {
        color: green;
        font-weight: 700;
      }
      margin: 10px 0;
      width: 100%;
      font-size: 10px;
      display: flex;
      justify-content: space-between;
    }
    .saved-cue {
      line-height: 32px;
      margin: 0 auto;
      &::after {
        content: "✔︎";
        padding: 10px;
        color: green;
      }
    }
    .error {
      display: none;
      &.on {
        display: block;
        background: #ff8686;
        font-weight: 800;
        border-radius: 6px;
        color: #f7f7f7;
        line-height: 16px;
        width: 100%;
        font-size: 14px;
        margin: 0 10px 15px;
        padding: 10px;
        text-align: left;
      }
    }
    .close {
      position: absolute;
      top: 5px;
      right: -10px;
      border-radius: 18px;
      width: 18px;
      height: 18px;
    padding: 4px;
      &::after {
        content: '✖️';
        position: relative;
        top: -4px;
      }
    }
    button {
      width: 100%;
      margin: 10px 0;
      height: 34px;
      outline: none;
      background: #0b5dcc;
      color: white;
      font-weight: 800;
      box-sizing: border-box;
      border-radius: 6px;
    }
    .start-time, .end-time, .meta-text {
        position: relative;
        margin-bottom: 10px;
      label {
        position: absolute;
        top: -10px;
        left: 10px;
        font-size: 12px;
        background: white;
        padding: 0 5px;
      }
      input {
        line-height: 30px;
        width: 100px;
        font-size: 13px;
        text-indent: 5px;
        border-radius: 6px;
        border: 1px solid darkgray;
        outline: none;
        &::placeholder {
          color: #b8b7b7;
          font-size: 14px;
          text-align: center;
        }
      }
    }
    .meta-text {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 100%;
      max-height: 100px;
      margin: 10px 0 0;
      input {
        width: unset;
        margin-top: 5px;
      }
      label {
        left: 10px;
        top: -8px;
      }
      textarea {
        width: 100%;
        height: 60px;
        resize: none;
        padding: 10px 5px;
        border: 1px solid darkgray;
        border-radius: 6px;
        box-sizing: border-box;
        outline: none;
        &::placeholder {
          color: #b8b7b7;
          font-size: 14px;
        }
      }
    }
    input, textarea {
      &:read-only {
        background: #f3f3f3;
        border: none;
        border-radius: 0;
      }
    }
  }
</style>
