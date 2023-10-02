import { createWebHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "inApp",
    component: () => import("./App.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("./page/home.vue"),
      },
      {
        path: "/gender-detector",
        name: "Gender Detector",
        component: () => import("./page/gender-detector.vue"),
      },
      {
        path: "/recognition",
        name: "Face Recognition",
        component: () => import("./page/face-recognition.vue"),
      },
      {
        path: "/geofencing",
        name: "Geo Fencing",
        component: () => import("./page/geo-fencing.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
