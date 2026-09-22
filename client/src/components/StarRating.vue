<script setup>
defineProps({ value: { type: Number, default: 0 }, interactive: { type: Boolean, default: false } });
const emit = defineEmits(['update']);
</script>

<template>
  <div class="stars" role="img" :aria-label="`Оценка ${value} из 5`">
    <button v-for="i in 5" :key="i" type="button" :disabled="!interactive" :class="{ on: i <= Math.round(value) }" @click="emit('update', i)">☆</button>
  </div>
</template>
