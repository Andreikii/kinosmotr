<script setup>
import { onMounted, ref } from 'vue';
import ReviewCard from '../components/ReviewCard.vue';
import { api } from '../api';

const reviews = ref([]); const loading = ref(true); const error = ref('');
async function load() {
  loading.value = true; error.value = '';
  try { reviews.value = await api('/api/reviews'); } catch (e) { error.value = e.message; } finally { loading.value = false; }
}
onMounted(load);
</script>

<template>
  <section class="page-section reviews-page">
    <div class="page-heading">
      <h1>Лента рецензий</h1>
      <p>Лучшие мнения о фильмах, сериалах и культурных событиях недели</p>
      <button class="filter-pill">Все рецензии</button>
    </div>
    <div v-if="loading" class="state-box">Загружаем рецензии...</div>
    <div v-else-if="error" class="state-box error-state">{{ error }}<button class="text-button" @click="load">Повторить</button></div>
    <div v-else class="review-list">
      <ReviewCard v-for="review in reviews" :key="review.id" :review="review" />
    </div>
    <div v-if="!loading && reviews.length" class="list-footer"><span>Показано {{ reviews.length }} из {{ reviews.length }} рецензий</span><span>Загрузить ещё ↓</span></div>
  </section>
</template>
