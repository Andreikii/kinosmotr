<template>
  <div class="auth-page">
    <div class="auth-visual">
      <router-link to="/login" class="brand auth-brand">
        <span class="brand-mark">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1.5 4.5h3V6.7h-3v1.8Zm4.5 0h3V6.7h-3v1.8Zm4.5 0h3V6.7h-3v1.8ZM6.5 10v7.3h11V10h-11Z"/></svg>
        </span>
        <span>КИНОСМОТР</span>
      </router-link>
      <div class="auth-caption"><span></span><h1>Место, где кино обретает<br />голос</h1></div>
    </div>
    <div class="auth-panel"><slot /></div>
  </div>
</template>
