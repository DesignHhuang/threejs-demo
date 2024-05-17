import type { App } from "vue";

import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", component: HomeView },
  {
    path: "/",
    component: () => import("/@/views/sys/register/OrganizationRegister.vue"),
  },
  ,
  { path: "/about", component: AboutView },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),
  routes: routes,
  strict: true,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export function setupRouter(app: App<Element>) {
  app.use(router);
}
