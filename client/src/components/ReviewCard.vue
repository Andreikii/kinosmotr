<script setup>
import StarRating from './StarRating.vue';
defineProps({ review: { type: Object, required: true }, own: { type: Boolean, default: false } });
const emit = defineEmits(['delete', 'edit']);

function posterFor(review) {
  if (review.poster) return review.poster;
  if (review.movie === 'Тень') return '/assets/poster1.png';
  if (review.movie === 'Небо в огне') return '/assets/poster2.png';
  if (review.movie === 'Лето в Париже') return '/assets/poster3.png';
  return '/assets/poster1.png';
}
</script>

<template>
  <article class="review-card">
    <img class="review-poster" :src="posterFor(review)" alt="Обложка фильма" />
    <div class="review-content">
      <div class="review-author-row">
        <div class="review-author">
          <span class="avatar small">{{ (review.authorName || 'А')[0].toUpperCase() }}</span>
          <div>
            <strong>{{ review.authorName }}</strong>
            <small>{{ new Date(review.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) }}</small>
          </div>
        </div>
        <div class="rating"><span>{{ Number(review.rating).toFixed(1) }}</span><StarRating :value="review.rating" /></div>
      </div>
      <h2>{{ review.title }}</h2>
      <p>{{ review.text }}</p>
      <div class="review-bottom">
        <div class="tags"><span v-for="tag in review.tags" :key="tag">{{ tag }}</span></div>
        <div class="review-actions">
          <template v-if="own">
            <button @click="emit('edit', review)">Изменить</button>
            <button class="danger-link" @click="emit('delete', review)">Удалить</button>
          </template>
          <span v-else>Читать рецензию <b>→</b></span>
        </div>
      </div>
    </div>
  </article>
</template>
