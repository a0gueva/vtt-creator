<template>
  <div class="video-wrapper">
    <!-- MP3 Upload -->
    <div class="upload-video">
        <label class="upload-label">
            Upload Video:
            <input type="file" accept="video/*" @change="handleVideoUpload" />
        </label>
    </div>
    <!-- The player -->
    <div class="video-previewer">
      <!-- Video Element -->
      <video
        ref="videoPlayerRef"
        class="video-el br-all pos-absolute"
        :src="videoSrc"
        crossorigin
        controls
        preload="none"
        loop
        type="video/mp4"
      ></video>

      <!-- Cue Preview Overlay -->
      <preview v-if="previewVid" :videoPlayerRef="videoPlayerRef" />
    </div>

    <!-- Spacer -->
    <div class="separator"></div>
    <div class="separator"></div>

    <!-- Progress Bar -->
    <progress-bar
      v-if="seconds"
      ref="progress2Ref"
      :length="seconds"
      :pos="currentPlayTime"
      @progress-bar-click="$emit('progress-bar-click', $event)"
      @progress-bar-move="$emit('progress-bar-move', $event)"
    ></progress-bar>

    <div class="separator"></div>
  </div>
</template>

<script setup>
/* eslint-disable no-undef */
import { ref, onMounted } from "vue";
import Preview from "./VideoVTTPreview.vue";
import ProgressBar from "./ProgressBarHTML5.vue";

defineProps({
  previewVid: Boolean,
});

const emit = defineEmits([
  "progress-bar-click",
  "progress-bar-move",
  "duration-loaded",
  "time-update",
  "video-ref-ready"
]);

const videoPlayerRef = ref(null);
const progress2Ref = ref(null);
const seconds = ref(0);
const currentPlayTime = ref(0);
const videoSrc = ref("https://videos.pexels.com/video-files/855563/855563-hd_1920_1080_24fps.mp4");

const handleVideoUpload = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith("video/")) {
    videoSrc.value = URL.createObjectURL(file);
    videoPlayerRef.value.load();
  } else {
    alert("Please upload a valid video file.");
  }
};

onMounted(() => {
  const video = videoPlayerRef.value;

  video.load();

  video.onloadedmetadata = () => {
    seconds.value = video.duration;
    emit("duration-loaded", seconds.value);
  };

  video.ontimeupdate = () => {
    currentPlayTime.value = video.currentTime;
    emit("time-update", currentPlayTime.value);
  };

  emit("video-ref-ready", {
    videoPlayerRef,
    progress2Ref,
  });
});
</script>

<style scoped>
.upload-audio {
  margin-bottom: 10px;
}
.separator {
  height: 20px;
}
.video-previewer {
  display: flex;
  flex-direction: row;
  justify-content: center;
  background: black
}
.upload-video {
    line-height: 20px;
    padding: 7px;
    font-family: arial;
    background: #797777;
    color: #fff;
}
video {
  width: 600px;
  height: 400px;
  background: black;
}
</style>
