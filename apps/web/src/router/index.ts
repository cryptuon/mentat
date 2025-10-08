import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'discover',
    component: () => import('@/views/DiscoveryHub.vue')
  },
  {
    path: '/market/:id',
    name: 'market',
    component: () => import('@/views/MarketDetail.vue'),
    props: true
  },
  {
    path: '/create',
    name: 'create',
    component: () => import('@/views/CreatorStudio.vue')
  },
  {
    path: '/curate',
    name: 'curate',
    component: () => import('@/views/CuratorConsole.vue')
  },
  {
    path: '/proofs',
    name: 'proofs',
    component: () => import('@/views/ProofSubmission.vue')
  },
  {
    path: '/account',
    name: 'account',
    component: () => import('@/views/AccountDashboard.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
