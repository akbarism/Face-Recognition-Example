import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "inApp",
    component: () => import("./App.vue"),
  },
  {
    path: "/gender-detector",
    name: "gender",
    component: () => import("./page/gender-detector.vue"),
  },
  {
    path: "/recognition",
    name: "recognition",
    component: () => import("./page/face-recognition.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
