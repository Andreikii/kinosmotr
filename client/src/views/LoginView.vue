<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from './AuthLayout.vue';
import { api, saveSession } from '../api';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function login() {
  error.value = ''; loading.value = true;
  try {
    const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email.value, password: password.value }) });
    saveSession(data); router.push('/reviews');
  } catch (e) { error.value = e.message; } finally { loading.value = false; }
}
</script>

<template>
  <AuthLayout>
    <div class="auth-box">
      <h2>Авторизация</h2>
      <p class="muted">Заполните данные ниже, чтобы начать писать рецензии</p>
      <form @submit.prevent="login">
        <label>ЭЛЕКТРОННАЯ ПОЧТА</label>
        <input v-model="email" type="email" placeholder="nikita@cinema.ru" required />
        <label>ПАРОЛЬ</label>
        <input v-model="password" type="password" placeholder="••••••••••" required />
        <button class="primary full" :disabled="loading">{{ loading ? 'Входим...' : 'Войти' }}</button>
      </form>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p class="auth-switch">Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link></p>
    </div>
  </AuthLayout>
</template>
