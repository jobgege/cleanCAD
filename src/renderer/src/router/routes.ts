import type { RouteRecordRaw } from "vue-router";
export const routes: RouteRecordRaw[] = [
    {
      path: "/",
      name: "app",
      redirect: "/page",
    },
    {
      path: "/page",
      name: "page",
      component: () => import("@/views/page.vue"),
      children: [
        {
          path: "addSymbol",
          name: "addSymbol",
          component: () => import("@/components/addSymbol.vue"),
        },
      ],
    },
    {
      path: "/symbol",
      name: "symbol",
      component: () => import("@/views/symbolEditor.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
];