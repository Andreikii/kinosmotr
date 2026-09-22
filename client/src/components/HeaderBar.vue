<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clearSession, getUser } from '../api';

const route = useRoute();
const router = useRouter();
const user = ref(getUser());

const isLoggedIn = computed(() => Boolean(localStorage.getItem('kinosmotr_token')));

function logout() {
  clearSession();
  user.value = null;
  router.push('/login');
}
</script>

<template>
  <header v-if="route.path !== '/login' && route.path !== '/register'" class="topbar">
    <router-link to="/reviews" class="brand">
      <span class="brand-mark">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1.5 4.5h3V6.7h-3v1.8Zm4.5 0h3V6.7h-3v1.8Zm4.5 0h3V6.7h-3v1.8ZM6.5 10v7.3h11V10h-11Z"/></svg>
      </span>
      <span>КИНОСМОТР</span>
    </router-link>

    <nav class="nav-links">
      <router-link :class="{ active: route.path === '/reviews' }" to="/reviews">Лента</router-link>
      <router-link v-if="isLoggedIn" :class="{ active: route.path === '/create-review' }" to="/create-review">Добавить фильм</router-link>
      <router-link v-if="isLoggedIn" :class="{ active: route.path === '/profile' }" to="/profile">Профиль</router-link>
    </nav>

    <div class="account-area">
      <template v-if="isLoggedIn">
        <router-link to="/profile" class="user-chip">
          <span class="avatar">{{ (user?.name || 'А')[0].toUpperCase() }}</span>
          <span>{{ user?.name || 'Андрей' }}</span>
        </router-link>
        <button class="logout-btn" @click="logout">Выйти</button>
      </template>
      <router-link v-else to="/login" class="login-link">Войти</router-link>
    </div>
  </header>
</template>
