<template>
  <div class="progress-scroller" ref="progressWrapperRef">
    <div class="progress-wrapper">
      <!-- Tick Marks -->
      <div class="tick-bar">
        <div class="tick"
            v-for="second in ticks"
            :key="second"
            :style="{ left: second * scale + 'px' }">
            <span v-if="second % 5 === 0" class="tick-label">
                {{ second }}
            </span>
        </div>
      </div>

      <!-- Progress bar -->
      <div
        class="progress"
        ref="progressRef"
        @click.stop="pbClickEmitter($event, false)"
        :style="{ backgroundImage: gradientString }"
      >
        <span
          v-for="cue in cueList"
          :key="cue.id"
          :style="{ left: cue.leftPos }"
          class="poi"
        />
      </div>

      <!-- Thumb -->
      <div
        class="thumb"
        :style="{ left: thumbPos }"
        ref="thumbRef"
        @mousedown.self="startSlide"
      >
        {{ thumbLabel }}
        <span class="cue-adder" @click.stop="pbClickEmitter($event, true)">+</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

export default {
  name: 'ProgressBarHtml5',
  props: {
    cueList: Array,
    pos: Number,
    length: {
      type: Number,
      default: 60
    },
    label: String
  },
  emits: ['progress-bar-click', 'progress-bar-move'],

  setup(props, { emit }) {
    const progressRef = ref(null);
    const thumbRef = ref(null);
    const progressWrapperRef = ref(null);

    const slidePos = ref(0);
    const scale = ref(1);
    const sliding = ref(false);
    const preSlideDelta = ref(0);

    const tickSpacing = 50;
    const labelEvery = 5;

    // const ticks = computed(() => Math.floor((props.length * scale.value) / tickSpacing));

    const ticks = computed(() => {
        // One tick per second
        return Array.from({ length: Math.ceil(props.length) }, (_, i) => i);
    });

    const thumbPos = computed(() => {
      return slidePos.value - 20 < -20 ? '-20px' : `${slidePos.value - 20}px`;
    });

    const thumbLabel = computed(() => {
      return props.label != null
        ? props.label
        : formatCueTime(slidePos.value / scale.value);
    });

    const computedProgress = computed(() => `${slidePos.value}px`);

    const gradientString = computed(() =>
      `linear-gradient(to right, #4e92f7 ${computedProgress.value}, #b0b3b7 0px)`
    );

    watch(
      () => props.pos,
      () => {
        if (!sliding.value && scale.value) {
          slidePos.value = props.pos * scale.value;
          if (
            slidePos.value < 20 ||
            slidePos.value > progressWrapperRef.value.offsetWidth - 60
          ) {
            nextTick(() => {
              thumbRef.value.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest'
              });
            });
          }
        }
      }
    );

    watch(
        () => props.length,
        (newLength) => {
            if (newLength > 0) {
            scale.value = MAX_WIDTH / newLength;
            }
        },
        { immediate: true }
    );

    const startSlide = (e) => {
      sliding.value = true;
      preSlideDelta.value = e.clientX - slidePos.value;
      window.addEventListener('mousemove', slideMe);
      window.addEventListener('mouseup', mouseUpHandler);
    };

    const mouseUpHandler = () => {
      if (sliding.value) {
        sliding.value = false;
        window.removeEventListener('mousemove', slideMe);
        window.removeEventListener('mouseup', mouseUpHandler);
        emit('progress-bar-move', {
          sliderPos: slidePos.value,
          scale,
        });
      }
    };

    const slideMe = (e) => {
      e.preventDefault();
      if (sliding.value) {
        const slideBy = e.clientX - preSlideDelta.value;
        slidePos.value = Math.max(0, slideBy);
      }
    };

    const pbClickEmitter = (e, addCue) => {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left + 20;
      const y = e.clientY - rect.top;
      emit('progress-bar-click', {
        target: e.target,
        pos: {
          x: addCue ? slidePos.value + 18 : x,
          y
        },
        scale,
        addCue
      });
    };

    const formatCueTime = (timestamp) => {
      const hours = Math.floor(timestamp / 3600);
      const minutes = Math.floor((timestamp % 3600) / 60);
      const seconds = Math.floor(timestamp % 60);
      const milliseconds = Math.round((timestamp % 1) * 1000);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
        seconds
      ).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    };

    // onMounted(() => {
    //   progressRef.value.style.width = `${props.length * 15}px`;
    //   scale.value = progressRef.value.offsetWidth / props.length;
    // });

    const MAX_WIDTH = 800;

    onMounted(() => {
        progressRef.value.style.width = `${MAX_WIDTH}px`;
        scale.value = MAX_WIDTH / props.length;
    });

    return {
      progressWrapperRef,
      progressRef,
      thumbRef,
      ticks,
      tickSpacing,
      labelEvery,
      thumbPos,
      thumbLabel,
      gradientString,
      startSlide,
      pbClickEmitter,
      scale,
      slidePos,
      formatCueTime
    };
  }
};
</script>

<style scoped lang="scss">
.progress-scroller {
  height: 100%;
  padding: 0 40px 0 40px;
  overflow-x: auto;
  &::-webkit-scrollbar {
    display: none;
  }
}
.progress-wrapper {
  position: relative;
  top: 28px;
  height: 106px;
}
.tick-bar {
  position: absolute;
  top: 16px;
  left: 0;
  width: 100%;
  height: 20px;
  z-index: 1;
}
.tick {
  position: absolute;
  width: 1px;
  background: gray;
  top: 0;
  height: 7px; // default (minor tick)
}

.tick:nth-child(5n + 1) {
  height: 14px; // major tick every 5th
}

.tick-label {
  position: absolute;
  top: 16px;
  transform: translateX(-50%);
  font-size: 10px;
  color: #888;
}
.progress {
  position: relative;
  display: flex;
  height: 10px;
  min-width: 800px;
  border-radius: 12px;
  background: #e6e6e6;
  background-image: linear-gradient(to right, #4e92f7 0px, #e6e6e6 0px);
  flex-direction: row;
  overflow-y: hidden;
  z-index: 2;
}
.poi {
  position: relative;
  z-index: 2;
}
.poi::after {
  position: absolute;
  content: "⫿";
  line-height: 12px;
  font-size: 12px;
  font-weight: 900;
  color: #ffffff;
  left: 8px;
}
.thumb {
  &:hover {
    cursor: grabbing;
  }
  position: relative;
  display: block;
  width: 80px;
  color: #4e91f7;
  font-size: 12px;
  font-weight: 800;
  font-family: arial;
  box-sizing: border-box;
  border: 1px solid #4e91f7;
  padding: 2px 3px;
  border-radius: 16px;
  text-align: center;
  top: -32px;
  z-index: 3;
}
.thumb .cue-adder {
  position: absolute;
  width: 22px;
  height: 22px;
  line-height: 22px;
  background: #4e92f7;
  border-radius: 22px;
  font-size: 18px;
  color: white;
  left: 8px;
  top: 50px;
  z-index: 200;
}
.thumb::after {
  content: "△";
  position: absolute;
  top: 34px;
  line-height: 16px;
  left: 10px;
  color: #4e91f7;
  font-size: 17px;
}
</style>
