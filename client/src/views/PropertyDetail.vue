<template>
  <div v-if="store.loading" class="loading">불러오는 중...</div>
  <div v-else-if="!property" class="loading">매물을 찾을 수 없습니다.</div>
  <div v-else class="detail-wrap">

    <!-- 이미지 영역 -->
    <div class="img-section">
      <div class="main-img">
        <img v-if="selectedImg" :src="selectedImg" alt="매물 사진">
        <div v-else class="img-placeholder">{{ typeEmoji }}</div>
      </div>
      <div class="thumb-list" v-if="property.images?.length > 1">
        <div v-for="(img, i) in property.images" :key="i"
          class="thumb" :class="{ active: selectedImg === img }"
          @click="selectedImg = img">
          <img :src="img" alt="">
        </div>
      </div>
    </div>

    <!-- 상세 정보 -->
    <div class="info-section">
      <div class="info-left">
        <div class="badges">
          <span class="badge badge-type">{{ property.property_type }}</span>
          <span class="badge" :class="dealBadgeClass">{{ property.price_type }}</span>
        </div>
        <h1 class="property-title">{{ property.title }}</h1>
        <div class="property-addr">📍 {{ property.address }}</div>
        <div class="property-price">{{ formattedPrice }}</div>

        <div class="meta-grid">
          <div class="meta-item">
            <div class="meta-label">면적</div>
            <div class="meta-value">{{ property.area }}㎡</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">구조</div>
            <div class="meta-value">{{ property.rooms }}룸</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">거래유형</div>
            <div class="meta-value">{{ property.price_type }}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">등록일</div>
            <div class="meta-value">{{ createdDate }}</div>
          </div>
        </div>

        <div class="description" v-if="property.description">
          <div class="desc-title">매물 설명</div>
          <p>{{ property.description }}</p>
        </div>
      </div>

      <!-- 문의 폼 -->
      <div class="inquiry-box">
        <div class="inquiry-title">📞 매물 문의</div>
        <div class="inquiry-agent">
          <div class="agent-avatar">👩‍💼</div>
          <div>
            <div class="agent-name">구래부동산</div>
            <div class="agent-tel">031-000-0000</div>
          </div>
        </div>
        <div class="form-group">
          <label>이름</label>
          <input v-model="form.name" type="text" placeholder="홍길동">
        </div>
        <div class="form-group">
          <label>연락처</label>
          <input v-model="form.phone" type="tel" placeholder="010-0000-0000">
        </div>
        <div class="form-group">
          <label>문의 내용</label>
          <textarea v-model="form.message" placeholder="문의하실 내용을 입력해주세요." rows="4"></textarea>
        </div>
        <button class="submit-btn" @click="submitInquiry" :disabled="submitting">
          {{ submitting ? '전송 중...' : '문의 보내기' }}
        </button>
        <div v-if="submitDone" class="submit-done">✅ 문의가 접수되었습니다. 빠르게 연락드리겠습니다!</div>
      </div>
    </div>

    <div class="back-wrap">
      <button class="back-btn" @click="router.back()">← 목록으로 돌아가기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/property'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const store = usePropertyStore()
const property = computed(() => store.current)
const selectedImg = ref(null)
const submitting = ref(false)
const submitDone = ref(false)
const form = ref({ name: '', phone: '', message: '' })

const typeEmoji = computed(() => {
  const map = { '아파트': '🏢', '오피스텔': '🏬', '상가': '🏪', '기타': '🌿' }
  return map[property.value?.property_type] || '🏠'
})

const dealBadgeClass = computed(() => {
  const map = { '매매': 'badge-sell', '전세': 'badge-jeonse', '월세': 'badge-monthly' }
  return map[property.value?.price_type] || ''
})

const formattedPrice = computed(() => {
  const price = property.value?.price
  if (!price) return '가격 문의'
  const eok = Math.floor(price / 100000000)
  const man = Math.floor((price % 100000000) / 10000)
  let str = ''
  if (eok > 0) str += `${eok}억 `
  if (man > 0) str += `${man.toLocaleString()}만`
  return str + '원'
})

const createdDate = computed(() => {
  if (!property.value?.created_at) return '-'
  return new Date(property.value.created_at).toLocaleDateString('ko-KR')
})

async function submitInquiry() {
  if (!form.value.name || !form.value.phone) return alert('이름과 연락처를 입력해주세요.')
  submitting.value = true
  try {
    await axios.post('https://budongsan-site.onrender.com/api/inquiries', {
      property_id: route.params.id,
      ...form.value
    })
    submitDone.value = true
    form.value = { name: '', phone: '', message: '' }
  } catch (e) {
    alert('오류가 발생했습니다. 다시 시도해주세요.')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await store.fetchOne(route.params.id)
  if (store.current?.images?.length) {
    selectedImg.value = store.current.images[0]
  }
})
</script>

<style scoped>
.loading { text-align: center; padding: 100px; color: var(--muted); }
.detail-wrap { max-width: 1100px; margin: 0 auto; padding: 40px; }

.img-section { margin-bottom: 40px; }
.main-img {
  width: 100%; height: 420px; border-radius: 12px; overflow: hidden;
  background: linear-gradient(135deg, #dde8f8, #c5d8f0);
  display: flex; align-items: center; justify-content: center;
}
.main-img img { width: 100%; height: 100%; object-fit: cover; }
.img-placeholder { font-size: 64px; }
.thumb-list { display: flex; gap: 10px; margin-top: 10px; }
.thumb {
  width: 80px; height: 60px; border-radius: 8px; overflow: hidden;
  cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s;
}
.thumb.active { border-color: var(--blue); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }

.info-section { display: grid; grid-template-columns: 1fr 340px; gap: 40px; }

.badges { display: flex; gap: 6px; margin-bottom: 14px; }
.badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 5px; }
.badge-type { background: rgba(27,45,79,0.1); color: var(--navy); }
.badge-sell { background: #e4f4e4; color: #1e7a1e; }
.badge-jeonse { background: #fff4e0; color: #a06000; }
.badge-monthly { background: #fde8e8; color: #a02020; }

.property-title { font-size: 22px; font-weight: 800; color: var(--navy); margin-bottom: 8px; letter-spacing: -0.5px; line-height: 1.4; }
.property-addr { font-size: 13px; color: var(--muted); margin-bottom: 16px; }
.property-price { font-size: 28px; font-weight: 800; color: var(--text); margin-bottom: 28px; letter-spacing: -1px; }

.meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 28px; }
.meta-item { background: var(--bg); border-radius: 8px; padding: 14px 16px; }
.meta-label { font-size: 11px; color: var(--muted); margin-bottom: 4px; font-weight: 400; }
.meta-value { font-size: 15px; font-weight: 700; color: var(--navy); letter-spacing: -0.3px; }

.description { background: var(--bg); border-radius: 8px; padding: 20px; }
.desc-title { font-size: 13px; font-weight: 700; color: var(--navy); margin-bottom: 10px; }
.description p { font-size: 13px; color: var(--text); line-height: 1.8; white-space: pre-wrap; }

.inquiry-box {
  background: var(--white); border: 1px solid var(--border);
  border-radius: 12px; padding: 24px; height: fit-content;
  position: sticky; top: 80px;
}
.inquiry-title { font-size: 15px; font-weight: 800; color: var(--navy); margin-bottom: 16px; letter-spacing: -0.3px; }
.inquiry-agent { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--bg); border-radius: 8px; margin-bottom: 20px; }
.agent-avatar { font-size: 28px; }
.agent-name { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
.agent-tel { font-size: 13px; color: var(--blue); font-weight: 600; }

.form-group { margin-bottom: 14px; }
.form-group label { display: block; font-size: 12px; font-weight: 600; color: var(--navy); margin-bottom: 6px; }
.form-group input, .form-group textarea {
  width: 100%; font-family: 'Pretendard', sans-serif; font-size: 13px;
  border: 1.5px solid var(--border); border-radius: 8px;
  padding: 10px 14px; outline: none; background: var(--bg); color: var(--text);
  transition: border-color 0.2s; resize: none;
}
.form-group input:focus, .form-group textarea:focus { border-color: var(--blue); background: var(--white); }

.submit-btn {
  width: 100%; background: var(--blue); color: #fff; border: none;
  border-radius: 8px; padding: 13px; font-family: 'Pretendard', sans-serif;
  font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s;
  letter-spacing: -0.2px;
}
.submit-btn:hover { background: #1e4bc4; }
.submit-btn:disabled { background: var(--muted); cursor: not-allowed; }
.submit-done { margin-top: 12px; font-size: 12px; color: #1e7a1e; text-align: center; font-weight: 500; background: #e4f4e4; padding: 10px; border-radius: 8px; }

.back-wrap { margin-top: 40px; }
.back-btn { background: none; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 20px; font-family: 'Pretendard', sans-serif; font-size: 13px; color: var(--muted); cursor: pointer; transition: all 0.2s; }
.back-btn:hover { border-color: var(--navy); color: var(--navy); }
</style>
