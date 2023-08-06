import { createRouter, createWebHashHistory } from "vue-router";
import KMeans from "./components/KMeans.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: KMeans,
    },
  ],
});
