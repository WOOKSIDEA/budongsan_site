<template>
  <nav>
    <RouterLink to="/" class="logo-wrap">
      <div class="logo">구래부동산</div>
      <div class="logo-sub">GURAE REAL ESTATE AGENCY</div>
    </RouterLink>
    <div class="nav-right">
      <RouterLink to="/">매물보기</RouterLink>
      <a href="#footer">이용안내</a>
      <a href="#footer">오시는길</a>
      <RouterLink v-if="!auth.token" to="/admin/login" class="nav-btn">관리자 로그인</RouterLink>
      <RouterLink v-else to="/admin" class="nav-btn admin-on">관리자 페이지</RouterLink>
    </div>
    <button class="hamburger" @click="menuOpen = !menuOpen">
      <span :class="{ open: menuOpen }"></span>
      <span :class="{ open: menuOpen }"></span>
      <span :class="{ open: menuOpen }"></span>
    </button>
    <div class="mobile-menu" v-if="menuOpen" @click="menuOpen = false">
      <RouterLink to="/">매물보기</RouterLink>
      <a href="#footer">이용안내</a>
      <a href="#footer">오시는길</a>
      <RouterLink v-if="!auth.token" to="/admin/login">관리자 로그인</RouterLink>
      <RouterLink v-else to="/admin">관리자 페이지</RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
const auth = useAuthStore()
const menuOpen = ref(false)
</script>

<style scoped>
nav {
  background: var(--white);
  border-bottom: 1px solid var(--border);
  padding: 0 40px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
.logo-wrap { text-decoration: none; flex-shrink: 0; }
.logo { font-size: 18px; font-weight: 800; color: var(--navy); letter-spacing: -0.5px; }
.logo-sub { font-size: 10px; color: var(--muted); font-weight: 400; letter-spacing: 2px; margin-top: 2px; }
.nav-right { display: flex; align-items: center; gap: 28px; }
.nav-right a { color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 400; transition: color 0.2s; }
.nav-right a:hover { color: var(--navy); }
.nav-btn { background: var(--navy) !important; color: #fff !important; font-size: 12px !important; padding: 7px 16px; border-radius: 6px; font-weight: 500 !important; }
.admin-on { background: var(--blue) !important; }
.hamburger { display: none; flex-direction: column; justify-content: center; gap: 5px; background: none; border: none; cursor: pointer; padding: 8px; z-index: 101; }
.hamburger span { display: block; width: 22px; height: 2px; background: var(--navy); border-radius: 2px; transition: all 0.3s; }
.hamburger span.open:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger span.open:nth-child(2) { opacity: 0; }
.hamburger span.open:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.mobile-menu { position: fixed; top: 60px; left: 0; right: 0; background: var(--white); border-bottom: 1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.08); z-index: 99; padding: 8px 0; }
.mobile-menu a { display: block; color: var(--text); text-decoration: none; font-size: 15px; font-weight: 500; padding: 14px 20px; border-bottom: 1px solid var(--border); transition: background 0.15s; }
.mobile-menu a:last-child { border-bottom: none; color: var(--blue); font-weight: 600; }
.mobile-menu a:active { background: var(--bg); }
@media (max-width: 768px) {
  nav { padding: 0 20px; }
  .logo-sub { display: none; }
  .nav-right { display: none; }
  .hamburger { display: flex; }
}
</style>