<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import StarRating from '../components/StarRating.vue';
import { api } from '../api';

const router = useRouter();
const movie = ref(''); const text = ref(''); const rating = ref(4); const poster = ref(''); const preview = ref(''); const error = ref(''); const loading = ref(false);

function readPoster(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { error.value = 'Постер должен быть меньше 2 МБ'; return; }
  const reader = new FileReader(); reader.onload = () => { poster.value = reader.result; preview.value = reader.result; }; reader.readAsDataURL(file);
}

async function publish() {
  error.value = ''; loading.value = true;
  try {
    await api('/api/reviews', { method: 'POST', body: JSON.stringify({ movie: movie.value, title: `«${movie.value}» — мой взгляд на фильм`, text: text.value, rating: rating.value, tags: ['Драма'], poster: poster.value || null }) });
    router.push('/reviews');
  } catch (e) { error.value = e.message; } finally { loading.value = false; }
}
</script>

<template>
  <section class="page-section create-page">
    <div class="page-heading compact"><h1>Создать рецензию</h1><p>Заполните детали фильма, выберите оценку и напишите свое мнение</p></div>
    <form class="review-form" @submit.prevent="publish">
      <div class="field-col">
        <label>Название фильма</label>
        <input v-model="movie" placeholder="Например, «Тень» или «Небо в огне»" required />
      </div>
      <div class="poster-field">
        <label>Обложка</label>
        <label class="poster-upload">
          <img v-if="preview" :src="preview" alt="Предпросмотр постера" />
          <span v-else>▧<small>Загрузить постер</small></span>
          <input type="file" accept="image/*" @change="readPoster" />
        </label>
      </div>
      <div class="rating-field"><label>Оценка</label><StarRating :value="rating" interactive @update="rating = $event" /></div>
      <div class="field-col full-width"><label>Рецензия</label><textarea v-model="text" placeholder="Напишите свое мнение о фильме, сериале или культурном событии. Расскажите, что вам понравилось, какие детали запомнились и стоит ли это смотреть другим." required></textarea></div>
      <div class="form-footer"><p>После публикации рецензия появится в ленте</p><button class="success" :disabled="loading">{{ loading ? 'Публикуем...' : 'Опубликовать' }}</button></div>
      <p v-if="error" class="form-error">{{ error }}</p>
    </form>
  </section>
</template>
