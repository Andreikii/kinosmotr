<script setup>
import { onMounted, ref } from 'vue';
import ReviewCard from '../components/ReviewCard.vue';
import { api, clearSession, getUser } from '../api';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(getUser()); const reviews = ref([]); const edit = ref(false); const newName = ref(user.value?.name || ''); const error = ref('');

async function load() {
  try { user.value = await api('/api/me'); localStorage.setItem('kinosmotr_user', JSON.stringify(user.value)); newName.value = user.value.name; reviews.value = await api('/api/reviews/user/me'); }
  catch (e) { error.value = e.message; }
}
async function saveName() {
  try { const data = await api('/api/me', { method: 'PATCH', body: JSON.stringify({ name: newName.value }) }); user.value.name = data.name; localStorage.setItem('kinosmotr_user', JSON.stringify(user.value)); edit.value = false; await load(); }
  catch (e) { error.value = e.message; }
}
async function removeReview(review) {
  if (!confirm('Удалить эту рецензию?')) return;
  try { await api(`/api/reviews/${review.id}`, { method: 'DELETE' }); await load(); } catch (e) { error.value = e.message; }
}
function editReview() { router.push('/create-review'); }
onMounted(load);
</script>

<template>
  <section class="profile-page page-section">
    <div class="profile-card">
      <div class="big-avatar">{{ (user?.name || 'А')[0].toUpperCase() }}</div>
      <h1>{{ user?.name || 'Андрей' }}</h1>
      <p>Пользователь КиноСмотра</p>
      <div v-if="edit" class="edit-name"><input v-model="newName" /><button class="primary" @click="saveName">Сохранить</button></div>
      <button v-else class="primary" @click="edit = true">Редактировать профиль</button>
      <small>Здесь собраны ваши рецензии и профиль в КиноСмотре</small>
    </div>

    <div class="profile-heading"><h2>Последние рецензии</h2><p>Несколько примеров отзывов, написанных {{ user?.name || 'Андреем' }}</p></div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <div class="review-list profile-list">
      <ReviewCard v-for="review in reviews" :key="review.id" :review="review" own @delete="removeReview" @edit="editReview" />
      <div v-if="!reviews.length" class="empty-profile">У вас пока нет рецензий. <router-link to="/create-review">Создать первую</router-link></div>
    </div>
    <button class="logout-large" @click="clearSession(); router.push('/login')">Выйти из аккаунта</button>
  </section>
</template>
