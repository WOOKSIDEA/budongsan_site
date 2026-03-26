<template>
  <div class="login-wrap">
    <div class="login-box">
      <div class="login-logo">구래부동산</div>
      <div class="login-sub">관리자 로그인</div>
      <div class="form-group">
        <label>아이디</label>
        <input v-model="form.username" type="text" placeholder="아이디를 입력하세요" @keyup.enter="doLogin">
      </div>
      <div class="form-group">
        <label>비밀번호</label>
        <input v-model="form.password" type="password" placeholder="비밀번호를 입력하세요" @keyup.enter="doLogin">
      </div>
      <div v-if="error" class="error-msg">{{ error }}</div>
      <button class="login-btn" @click="doLogin" :disabled="loading">
        {{ loading ? '로그인 중...' : '로그인' }}
      </button>
      <RouterLink to="/" class="back-link">← 사이트로 돌아가기</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const error = ref('')
const form = ref({ username: '', password: '' })

async function doLogin() {
  if (!form.value.username || !form.value.password) {
    error.value = '아이디와 비밀번호를 입력해주세요.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.value.username, form.value.password)
    router.push('/admin')
  } catch (e) {
    error.value = '아이디 또는 비밀번호가 올바르지 않습니다.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: calc(100vh - 130px);
  display: flex; align-items: center; justify-content: center;
  background: var(--bg);
}
.login-box {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 16px; padding: 40px; width: 100%; max-width: 400px;
  box-shadow: 0 4px 24px rgba(27,45,79,0.08);
}
.login-logo { font-size: 20px; font-weight: 800; color: var(--navy); text-align: center; margin-bottom: 6px; letter-spacing: -0.5px; }
.login-sub { font-size: 13px; color: var(--muted); text-align: center; margin-bottom: 32px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
.form-group input {
  width: 100%; font-family: 'Pretendard', sans-serif; font-size: 13px;
  border: 1.5px solid var(--border); border-radius: 8px;
  padding: 11px 14px; outline: none; background: var(--bg); color: var(--text);
  transition: border-color 0.2s;
}
.form-group input:focus { border-color: var(--blue); background: var(--white); }
.error-msg { font-size: 12px; color: #a02020; background: #fde8e8; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; font-weight: 500; }
.login-btn {
  width: 100%; background: var(--navy); color: #fff; border: none;
  border-radius: 8px; padding: 13px; font-family: 'Pretendard', sans-serif;
  font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s;
  margin-bottom: 16px;
}
.login-btn:hover { background: #0f1f3d; }
.login-btn:disabled { background: var(--muted); cursor: not-allowed; }
.back-link { display: block; text-align: center; font-size: 12px; color: var(--muted); text-decoration: none; }
.back-link:hover { color: var(--navy); }
</style>
