<script setup lang="ts">
import { ref } from "vue";
import { rgbListToImageData, imageDataToRGBList } from "/@/lib/KMeans";

const canvas = ref<HTMLCanvasElement>();
const input = ref<HTMLInputElement>();

const uploadFile = () => {
  const imgFile = input.value?.files?.[0];
  const canvasValue = canvas.value;
  if (!imgFile || !canvasValue) return;

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = URL.createObjectURL(imgFile);

  img.onload = async () => {
    const ctx = canvasValue?.getContext("2d");
    if (!ctx) return;
    canvasValue.width = img.width;
    canvasValue.height = img.height;
    ctx.drawImage(img, 0, 0);
    img.style.display = "none";

    const imgData = ctx.getImageData(
      0,
      0,
      canvasValue.width,
      canvasValue.height
    );
    const rgbList = await imageDataToRGBList(imgData);
    alert(rgbList);
    ctx.putImageData(await rgbListToImageData(rgbList), 0, 0);
  };
};
</script>

<template>
  <canvas ref="canvas"></canvas>
  <input type="file" ref="input" @change="uploadFile" />
</template>

<style module lang="scss"></style>
