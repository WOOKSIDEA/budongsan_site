<template>
  <NavBar />
  <RouterView />
  <FooterBar />
</template>

<script setup>
import NavBar from './components/NavBar.vue'
import FooterBar from './components/FooterBar.vue'
</script>

<style>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg: #f8f7f4;
  --white: #ffffff;
  --navy: #1b2d4f;
  --blue: #2d5be3;
  --blue-light: #eef2fd;
  --text: #1a1a1a;
  --muted: #888;
  --border: #e8e4de;
}
body {
  font-family: 'Pretendard', sans-serif;
  background: var(--bg);
  color: var(--text);
  font-size: 14px;
}
</style>
