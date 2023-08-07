import { kMeans } from "./KMeans";

addEventListener("message", (message) => {
  console.log(message.data);
  postMessage(kMeans(10, message.data));
});
