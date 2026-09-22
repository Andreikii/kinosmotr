import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import RegisterView from './views/RegisterView.vue';
import ReviewsView from './views/ReviewsView.vue';
import CreateReviewView from './views/CreateReviewView.vue';
import ProfileView from './views/ProfileView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/reviews' },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/reviews', component: ReviewsView },
    { path: '/create-review', component: CreateReviewView, meta: { auth: true } },
    { path: '/profile', component: ProfileView, meta: { auth: true } }
  ]
});

router.beforeEach((to) => {
  const hasToken = Boolean(localStorage.getItem('kinosmotr_token'));
  if (to.meta.auth && !hasToken) return '/login';
  if ((to.path === '/login' || to.path === '/register') && hasToken) return '/reviews';
});

export default router;
