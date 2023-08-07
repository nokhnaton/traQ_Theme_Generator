<script setup lang="ts">
import { ref } from "vue";
import { rgbListToImageData, imageDataToRGBList, kMeans } from "/@/lib/KMeans";
import type { RGB } from "/@/lib/KMeans";
import Worker from "/@/lib/Worker?worker";

const worker = new Worker();

const canvas = ref<HTMLCanvasElement>();
const input = ref<HTMLInputElement>();
const colors = ref<RGB[]>([]);

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

const uploadFile = async () => {
  const imgFile = input.value?.files?.[0];
  const canvasValue = canvas.value;
  if (!imgFile || !canvasValue) return;

  const img = await loadImage(URL.createObjectURL(imgFile));

  const ctx = canvasValue?.getContext("2d");
  if (!ctx) return;
  canvasValue.width = img.width;
  canvasValue.height = img.height;
  ctx.drawImage(img, 0, 0);
  img.style.display = "none";

  const imgData = ctx.getImageData(0, 0, canvasValue.width, canvasValue.height);
  const rgbList = await imageDataToRGBList(imgData);
  worker.onmessage = async (message) => {
    console.log(message.data);
    ctx.putImageData(
      await rgbListToImageData(message.data.rgb2dListKMean),
      0,
      0
    );
    colors.value = message.data.points;
  };
  worker.postMessage(rgbList);
};
</script>

<template>
  <canvas ref="canvas"></canvas>
  <input type="file" ref="input" @change="uploadFile" />
  <div
    v-for="color in colors"
    :key="JSON.stringify(color)"
    :class="$style.color"
    :style="{ background: `rgb(${color.red} ${color.blue} ${color.green})` }"
  ></div>
</template>

<style module lang="scss">
.color {
  width: 50px;
  height: 50px;
}
</style>
