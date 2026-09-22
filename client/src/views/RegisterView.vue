<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AuthLayout from './AuthLayout.vue';
import { api, saveSession } from '../api';

const router = useRouter();
const name = ref(''); const email = ref(''); const password = ref(''); const error = ref(''); const loading = ref(false);

async function register() {
  error.value = ''; loading.value = true;
  try {
    const data = await api('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: name.value, email: email.value, password: password.value }) });
    saveSession(data); router.push('/reviews');
  } catch (e) { error.value = e.message; } finally { loading.value = false; }
}
</script>

<template>
  <AuthLayout>
    <div class="auth-box">
      <h2>Регистрация</h2>
      <p class="muted">Заполните данные ниже, чтобы начать писать рецензии</p>
      <form @submit.prevent="register">
        <label>ВАШЕ ИМЯ</label>
        <input v-model="name" placeholder="Например, Андрей" required />
        <label>ЭЛЕКТРОННАЯ ПОЧТА</label>
        <input v-model="email" type="email" placeholder="nikita@cinema.ru" required />
        <label>ПАРОЛЬ</label>
        <input v-model="password" type="password" placeholder="••••••••••" minlength="6" required />
        <button class="primary full" :disabled="loading">{{ loading ? 'Создаем...' : 'Зарегистрироваться' }}</button>
      </form>
      <p v-if="error" class="form-error">{{ error }}</p>
      <p class="auth-switch">Уже зарегистрированы? <router-link to="/login">Войти в систему</router-link></p>
    </div>
  </AuthLayout>
</template>
