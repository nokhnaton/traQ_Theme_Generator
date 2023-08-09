import { kMeans } from "./KMeans";

addEventListener("message", (message) => {
  console.log(message.data);
  postMessage(kMeans(message.data.divNum, message.data.rgbList));
});
