<template>
  <div class="w-full flex justify-center">
    <div
      class="fixed top-0 left-0 w-full h-screen bg-black/50 z-20 flex justify-center items-center"
      v-if="loading"
    >
      <p class="font-bold text-lg text-white">
        {{ msg }}
      </p>
    </div>
    <div class="w-[50%] max-[650px]:w-full">
      <div v-if="!base64" class="bg-red-50 relative">
        <video ref="videoEl" autoplay="true" class="w-full" playsinline />
        <canvas ref="canvasEl" class="absolute top-0" />
      </div>
      <div v-if="base64" class="relative">
        <img :src="base64" class="w-full" />
        <div
          class="absolute z-10 top-1 left-1 p-2 rounded-lg bg-black/50 text-white"
        >
          {{ matchedFace }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as faceAPI from "face-api.js";
import { onMounted, reactive, ref } from "vue";
const initParams = reactive({
  modelUri: "/models",
  option: new faceAPI.SsdMobilenetv1Options({ minConfidence: 0.5 }),
});

const interval = ref(null);

const msg = ref("");
const base64 = ref("");

const loading = ref(true);

const videoEl = ref(null);
const canvasEl = ref(null);
const matchedFace = ref(null);

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
  msg.value = "Runing Machine";

  const labeledFaceDescriptors = await getPerson();
  const faceMatcher = new faceAPI.FaceMatcher(labeledFaceDescriptors, 0.45);
  interval.value = setInterval(async () => {
    msg.value = "Detecting All Faces";

    const result = await faceAPI
      .detectAllFaces(videoEl.value)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (result?.length) {
      msg.value = "Matching Face...";

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
        if (result._label !== "unknown") {
          clearInterval(interval.value);
          matchedFace.value = result;
          capture();
        }
      });
    }
  }, 200);
  loading.value = false;
};

const onFaceMatched = (res) => {
  // msg.value = "FACE MATCHED";
  // loading.value = true;
  capture();
};

const capture = () => {
  const ctx = canvasEl.value.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    videoEl.value,
    0,
    0,
    canvasEl.value.width,
    canvasEl.value.height,
  );
  const imageData = canvasEl.value.toDataURL("image/jpeg");
  base64.value = imageData;

  if (videoEl.value.srcObject) {
    videoEl.value.srcObject.getTracks().forEach((track) => track.stop());
  }
};

const initModel = async () => {
  try {
    loading.value = true;
    msg.value = "Initialize Machine";
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
    msg.value = "starting Camera";
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    videoEl.value.srcObject = stream;
    runModel();
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
      img: "https://nos.wjv-1.neo.id/himpsi-sik-dev/profil-user/anggota/avatar/20230441-1695798588.png",
      label: "Ujun Junaidi",
    },
    {
      img: "https://nos.wjv-1.neo.id/himpsi-sik-dev/profil-user/anggota/avatar/20230453-1695807876.png",
      label: "mail",
    },
    {
      img: "https://nos.wjv-1.neo.id/himpsi-sik-dev/profil-user/anggota/avatar/20230226-1695810970.png",
      label: "septian",
    },
    {
      img: "https://nos.wjv-1.neo.id/himpsi-sik-dev/profil-user/anggota/avatar/20230447-1695797384.png",
      label: "Afif Nuril Ihsan",
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
