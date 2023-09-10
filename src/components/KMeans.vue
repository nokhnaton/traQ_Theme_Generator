<script setup lang="ts">
import { computed, ref } from "vue";
import { rgbListToImageData, imageDataToRGBList, kMeans } from "/@/lib/KMeans";
import type { RGB } from "/@/lib/KMeans";
import Worker from "/@/lib/Worker?worker";
import { calcTheme, getHex, toRgb } from "../lib/calcTheme";

const worker = new Worker();

const canvas = ref<HTMLCanvasElement>();
const imgInput = ref<HTMLInputElement>();
const divNum = ref<number>(10);
const colors = ref<{ rgb: RGB; matchLength: number }[]>([]);
const themeString = computed(() =>
  colors.value.length < 6
    ? ""
    : JSON.stringify(calcTheme(colors.value.map((v) => v.rgb)))
);

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

const uploadFile = async () => {
  console.log("uploadFile");
  const imgFile = imgInput.value?.files?.[0];
  const canvasValue = canvas.value;
  if (!imgFile || !canvasValue) return;

  console.log("loadImage");
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
    colors.value = message.data.classList;
    colors.value.sort((a, b) => b.matchLength - a.matchLength);
  };
  worker.postMessage({ rgbList, divNum: divNum.value });
};

const colorDescription = (i: number) => {
  switch (i) {
    case 0:
      return "背景色(background)";
    case 1:
      return "文字やUIの色(ui)";
    case 2:
      return "サービス全体のアクセントカラー(accent prime)";
    case 3:
      return "通知の色(accent notification)";
    case 4:
      return "オンラインインジケーターの色(accent online)";
    case 5:
      return "エラーの色(accent error)";
    default:
      return "";
  }
};

const swapColors = (a: number, b: number) => {
  const tmp = colors.value[a];
  colors.value[a] = colors.value[b];
  colors.value[b] = tmp;
};

const copyJson = () => {
  navigator.clipboard
    .writeText(themeString.value)
    .then(() => alert("コピーしたよ!"));
};
</script>

<template>
  <div>
    <canvas ref="canvas" :class="$style.canvas"></canvas>
    <div>
      <input type="file" ref="imgInput" accept="image/*" @change="uploadFile" />
    </div>
    <div>抽出色数<input type="number" v-model="divNum" min="6" /></div>
    <div v-for="(color, i) in colors" :key="JSON.stringify(color)">
      <div :class="$style.colorList">
        <input
          type="color"
          :value="getHex(colors[i].rgb)"
          @change="
          (event) => {
            colors[i].rgb = toRgb((event.target as HTMLInputElement).value)
          }
        "
        />
        <div
          :class="$style.color"
          :style="{
            background: `rgb(${color.rgb.red} ${color.rgb.green} ${color.rgb.blue})`,
          }"
        >
          {{ color.matchLength }}
        </div>
        <div>{{ colorDescription(i) }}</div>
      </div>
      <button v-if="i < colors.length - 1" @click="swapColors(i, i + 1)">
        上下二つの色を入れ替える
      </button>
    </div>
    <template v-if="themeString">
      <div :class="$style.code">
        <code>{{ themeString }}</code>
      </div>
      <button @click="copyJson">コピー!</button>
    </template>
  </div>
</template>

<style module lang="scss">
.canvas {
  width: 80%;
}
.colorList {
  display: flex;
  gap: 12px;
}
.color {
  width: 50px;
  height: 50px;
}

.code {
  text-align: left;
}
</style>
