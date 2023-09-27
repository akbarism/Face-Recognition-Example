<template>
  <div class="display flex justify-center items-center flex-col">
    <div
      class="fixed top-0 left-0 w-full h-screen bg-black/50 z-20 flex justify-center items-center"
      v-if="loading"
    >
      <p class="font-bold text-lg text-white">Initialize Artificial Intelligence...</p>
    </div>
    <video
      ref="videoEl"
      autoplay="true"
      playsinline
      @loadedmetadata="runModel"
    />
    <canvas ref="canvasEl" />
  </div>
</template>

<script setup>
import * as faceAPI from "face-api.js";
import { onMounted, reactive, ref } from "vue";
const initParams = reactive({
  modelUri: "/models",
  option: new faceAPI.SsdMobilenetv1Options({ minConfidence: 0.5 }),
});

const loading = ref(true);

const videoEl = ref(null);
const canvasEl = ref(null);

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

const runModel = async () => {
  const labeledFaceDescriptors = await getPerson();
  const faceMatcher = new faceAPI.FaceMatcher(labeledFaceDescriptors, 0.4);
  setInterval(async () => {
    const result = await faceAPI
      .detectAllFaces(videoEl.value)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (result?.length) {
      const dims = faceAPI.matchDimensions(canvasEl.value, videoEl.value, true);

      const resizeResults = faceAPI.resizeResults(result, dims);

      const results = resizeResults.map((d) => {
        return faceMatcher.findBestMatch(d.descriptor);
      });

      results.forEach((result, i) => {
        const box = resizeResults[i].detection.box;
        const drawBox = new faceAPI.draw.DrawBox(box, {
          label: result,
        });
        drawBox.draw(canvasEl.value);
      });
    }
  }, 10);
  loading.value = false;
};

const initModel = async () => {
  try {
    await faceAPI.nets.ssdMobilenetv1.loadFromUri(initParams.modelUri);
    await faceAPI.nets.faceLandmark68Net.loadFromUri(initParams.modelUri);
    await faceAPI.nets.faceRecognitionNet.loadFromUri(initParams.modelUri);
    await faceAPI.nets.tinyFaceDetector.loadFromUri(initParams.modelUri);
    await faceAPI.nets.ageGenderNet.loadFromUri(initParams.modelUri);
    startStream();
  } catch (error) {
    console.error("Error loading model:", error.message);
  }
};

const startStream = async () => {
  try {
    loading.value = true;
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.value.srcObject = stream;
  } catch (error) {
    console.error(error.message);
  }
};

// const getPerson = async () => {
//   let urlImg =
//     "https://nos.wjv-1.neo.id/himpsi-sik-dev/profil-user/anggota/avatar/20230447-1695797384.png";

//   const img = await faceAPI.fetchImage(urlImg);

//   const descriptions = [];
//   const detections = await faceAPI
//     .detectSingleFace(img)
//     .withFaceLandmarks()
//     .withFaceDescriptor();
//   descriptions.push(detections.descriptor);

//   const label = "Afif Nuril";
//   return new faceAPI.LabeledFaceDescriptors(label, descriptions);
// };

const getPerson = async () => {
  let person = [
    {
      img: "https://nos.wjv-1.neo.id/himpsi-sik-dev/profil-user/anggota/avatar/20230447-1695797384.png",
      label: "afif",
    },
    {
      img: "https://nos.wjv-1.neo.id/himpsi-sik-dev/profil-user/anggota/avatar/20230441-1695798588.png",
      label: "kontol",
    },
  ];

  return Promise.all(
    person.map(async (el) => {
      const descriptions = [];
      const img = await faceAPI.fetchImage(el.img);

      const detections = await faceAPI
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();
      descriptions.push(detections.descriptor);

      return new faceAPI.LabeledFaceDescriptors(el.label, descriptions);
    }),
  );
};

onMounted(() => {
  initModel();
});
</script>

<style scoped>
.display {
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
}

canvas {
  position: absolute;
}
</style>
