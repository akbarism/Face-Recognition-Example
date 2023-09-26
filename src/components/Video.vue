<template>
  <section class="display">
    <video
      ref="videoEl"
      autoplay="true"
      playsinline
      @loadedmetadata="runModel"
    />
    <canvas ref="canvasEl" />
    <li class="board">
      <ul v-for="(item, key) in board" :key="key">
        {{
          key
        }}
        ：
        {{
          item
        }}
      </ul>
    </li>
    <div
      class="fixed top-0 left-0 w-full h-screen bg-black/50 z-20 flex justify-center items-center"
      v-if="loading"
    >
      <p class="font-bold text-lg text-white">Load Camera...</p>
    </div>
    {{ res }}
  </section>
</template>

<script>
import * as faceAPI from "face-api.js";
import { onMounted, reactive, ref } from "vue";
export default {
  name: "Video",
  setup() {
    const initParams = reactive({
      modelUri: "/models",
      option: new faceAPI.SsdMobilenetv1Options({ minConfidence: 0.5 }),
    });
    const loading = ref(true);
    const res = ref(null);
    const constraints = reactive({
      video: {
        width: {
          min: 320,
          ideal: 4096,
          max: 1920,
        },
        height: {
          min: 240,
          ideal: 2160,
          max: 1080,
        },
        frameRate: {
          min: 15,
          ideal: 30,
          max: 60,
        },
        facingMode: "user",
      },
    });

    const videoEl = ref(null);
    const canvasEl = ref(null);
    const board = reactive({
      realTimeCounts: 0,
      male: 0,
      female: 0,
      fps: 0,
    });

    let forwardTimes = [];

    /**
     * caculate fps for detection
     * @function
     * @param number
     */
    const updateTimeStats = (timeInMs) => {
      forwardTimes = [timeInMs].concat(forwardTimes).slice(0, 30);
      const avgTimeInMs =
        forwardTimes.reduce((total, t) => total + t) / forwardTimes.length;
      board.fps = faceAPI.utils.round(1000 / avgTimeInMs);
    };

    /**
     * @function
     * @description detect input video
     */
    const runModel = async () => {
      const beforeDetect = Date.now();
      const result = await faceAPI
        .detectAllFaces(videoEl.value, initParams.option)
        .withAgeAndGender();
      updateTimeStats(Date.now() - beforeDetect);
      console.log(result);
      if (result) {
        const dims = faceAPI.matchDimensions(
          canvasEl.value,
          videoEl.value,
          true,
        );
        const resizeResults = faceAPI.resizeResults(result, dims);
        board.realTimeCounts = resizeResults.length;
        board.male = resizeResults.filter(
          (data) => data.gender === "male",
        ).length;
        board.female = resizeResults.filter(
          (data) => data.gender === "female",
        ).length;
        faceAPI.draw.drawDetections(canvasEl.value, resizeResults);
        loading.value = false;
      }
      res.value = result;
      setTimeout(() => runModel());
    };

    onMounted(() => {
      /**
       * @function
       * @description load the trained model
       */
      const initModel = async () => {
        try {
          await faceAPI.nets.ssdMobilenetv1.loadFromUri(initParams.modelUri);
          await faceAPI.nets.ageGenderNet.loadFromUri(initParams.modelUri);
          startStream();
        } catch (error) {
          console.error("Error loading model:", error.message);
        }
      };

      /**
       * startup webcam
       * @function
       */
      const startStream = async () => {
        try {
          loading.value = true;
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          videoEl.value.srcObject = stream;
        } catch (error) {
          console.error(error.message);
        }
      };

      initModel();
    });

    return {
      videoEl,
      canvasEl,
      runModel,
      board,
      loading,
      res,
    };
  },
};
</script>

<style scoped>
video {
  position: absolute;
  object-fit: cover;
  width: 100%;
  height: 100vh;
}
canvas {
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 100%;
}
.display {
  width: 100%;
  height: 100vh;
  position: relative;
}
.board {
  font-size: 30px;
  list-style: none;
  background-color: rgba(255, 255, 255, 0.65);
  border-radius: 10px;
  left: 10px;
  padding: 15px;
  position: absolute;
  top: 10px;
  z-index: 20;
}
</style>
