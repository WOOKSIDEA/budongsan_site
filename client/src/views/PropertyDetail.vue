<template>
  <div v-if="store.loading" class="loading">불러오는 중...</div>
  <div v-else-if="!property" class="loading">매물을 찾을 수 없습니다.</div>
  <div v-else class="detail-wrap">

    <button class="back-btn" @click="router.back()">← 목록으로</button>

    <!-- 이미지 그리드 -->
    <div class="img-section" :class="{ 'single': !property.images || property.images.length <= 1 }">
      <div class="img-main" @click="selectedImg = property.images?.[0] || null">
        <img v-if="property.images?.[0]" :src="property.images[0]" alt="">
        <span v-else class="img-emoji">{{ typeEmoji }}</span>
      </div>
      <template v-if="property.images?.length > 1">
        <div class="img-sub" @click="selectedImg = property.images[1]">
          <img :src="property.images[1]" alt="">
        </div>
        <div class="img-more" v-if="property.images.length > 2" @click="showAllImages = true">
          <span>+{{ property.images.length - 2 }}장 더보기</span>
        </div>
        <div class="img-sub" v-else @click="selectedImg = property.images[1]">
          <img :src="property.images[1]" alt="">
        </div>
      </template>
    </div>

    <!-- 이미지 전체보기 모달 -->
    <div class="img-modal" v-if="showAllImages" @click="showAllImages = false">
      <div class="img-modal-inner" @click.stop>
        <button class="modal-close" @click="showAllImages = false">✕</button>
        <div class="modal-grid">
          <img v-for="(img, i) in property.images" :key="i" :src="img" alt="" @click="selectedImg = img; showAllImages = false">
        </div>
      </div>
    </div>

    <!-- 선택된 이미지 크게 보기 -->
    <div class="img-modal" v-if="selectedImg" @click="selectedImg = null">
      <img :src="selectedImg" alt="" style="max-width:90%;max-height:90vh;border-radius:12px;">
    </div>

    <div class="content-grid">
      <div class="info-left">

        <!-- 헤더 -->
        <div class="prop-header">
          <div class="prop-badges">
            <span class="badge badge-type">{{ property.property_type }}</span>
            <span class="badge" :class="dealBadgeClass">{{ property.price_type }}</span>
            <span class="badge badge-num">No. {{ property.property_number }}</span>
          </div>
          <div class="prop-title">{{ property.title }}</div>
          <div class="prop-addr">📍 {{ property.address }} {{ property.address_detail }}</div>
          <div class="prop-price">{{ formattedPrice }}</div>
        </div>

        <!-- 핵심 정보 -->
        <div class="key-info">
          <div class="key-item"><div class="key-label">면적</div><div class="key-value">{{ property.area }}㎡</div></div>
          <div class="key-item"><div class="key-label">구조</div><div class="key-value">{{ roomBath }}</div></div>
          <div class="key-item" v-if="property.floor"><div class="key-label">층수</div><div class="key-value">{{ property.floor }}층</div></div>
          <div class="key-item" v-if="property.building_year"><div class="key-label">준공</div><div class="key-value">{{ property.building_year }}년</div></div>
        </div>

        <!-- 태그 정보 -->
        <div class="tag-row">
          <span class="info-tag" v-if="property.parking">🚗 주차 가능</span>
          <span class="info-tag" v-else>🚫 주차 불가</span>
          <span class="info-tag" v-if="property.move_in_date">📅 {{ property.move_in_date }}</span>
          <span class="info-tag" v-if="property.total_floors">🏢 전체 {{ property.total_floors }}층</span>
          <span class="info-tag">📋 매물번호 {{ property.property_number }}</span>
          <span class="info-tag">🗓 {{ createdDate }} 등록</span>
        </div>

        <div class="divider"></div>

        <!-- 설명 -->
        <div v-if="property.description">
          <div class="section-title">매물 설명</div>
          <div class="desc-text">{{ property.description }}</div>
          <div class="divider"></div>
        </div>

        <!-- 지도 -->
        <div class="section-title">위치</div>
        <div id="kakao-map"></div>

        <div class="divider"></div>

        <!-- 문의 폼 -->
        <div class="section-title">📞 매물 문의</div>
        <div class="inquiry-box">
          <div class="agent-card">
            <div class="agent-avatar">👩‍💼</div>
            <div>
              <div class="agent-name">구래부동산</div>
              <div class="agent-tel">031-000-0000</div>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>이름</label>
              <input v-model="form.name" type="text" placeholder="홍길동">
            </div>
            <div class="form-group">
              <label>연락처</label>
              <input v-model="form.phone" type="tel" placeholder="010-0000-0000">
            </div>
          </div>
          <div class="form-group">
            <label>문의 내용</label>
            <textarea v-model="form.message" rows="4" placeholder="문의하실 내용을 입력해주세요."></textarea>
          </div>
          <div class="inquiry-btns">
            <button class="submit-btn" @click="submitInquiry" :disabled="submitting">
              {{ submitting ? '전송 중...' : '문의 보내기' }}
            </button>
            <button class="kakao-btn">💬 카카오톡으로 문의</button>
          </div>
          <div v-if="submitDone" class="submit-done">✅ 문의가 접수되었습니다. 빠르게 연락드리겠습니다!</div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/property'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const store = usePropertyStore()
const property = computed(() => store.current)
const selectedImg = ref(null)
const showAllImages = ref(false)
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
const roomBath = computed(() => {
  const r = property.value?.rooms
  const b = property.value?.bathrooms
  if (r && b) return `방${r}/화${b}`
  if (r) return `${r}룸`
  return '-'
})
const formattedPrice = computed(() => {
  const p = property.value
  if (!p) return ''
  if (p.price_type === '월세') {
    const dep = p.deposit ? toKorean(p.deposit) : ''
    const mon = p.monthly_rent ? toKorean(p.monthly_rent) : ''
    return `보증 ${dep} / 월 ${mon}`
  }
  return p.price ? toKorean(p.price) : '가격 문의'
})
function toKorean(num) {
  const eok = Math.floor(num / 100000000)
  const man = Math.floor((num % 100000000) / 10000)
  let str = ''
  if (eok > 0) str += eok + '억 '
  if (man > 0) str += man.toLocaleString() + '만'
  return str + '원'
}
const createdDate = computed(() => {
  if (!property.value?.created_at) return '-'
  return new Date(property.value.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
})

function initMap(address) {
  const loadMap = () => {
    const container = document.getElementById('kakao-map')
    if (!container) return
    const options = { center: new kakao.maps.LatLng(37.5665, 126.9780), level: 4 }
    const map = new kakao.maps.Map(container, options)
    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.addressSearch(address, (result, status) => {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x)
        new kakao.maps.Marker({ map, position: coords })
        map.setCenter(coords)
      }
    })
  }
  if (window.kakao && window.kakao.maps) {
    loadMap()
  } else {
    const script = document.createElement('script')
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=d6a424243849b346c82c835678da17ed&libraries=services&autoload=false`
    script.onload = () => kakao.maps.load(loadMap)
    document.head.appendChild(script)
  }
}

async function submitInquiry() {
  if (!form.value.name || !form.value.phone) return alert('이름과 연락처를 입력해주세요.')
  submitting.value = true
  try {
    await axios.post(import.meta.env.VITE_API_URL + '/api/inquiries', {
      property_id: route.params.id, ...form.value
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
  await nextTick()
  if (store.current?.address) initMap(store.current.address)
})
</script>

<style scoped>
.loading { text-align: center; padding: 100px; color: var(--muted); }
.detail-wrap { max-width: 960px; margin: 0 auto; padding: 32px 40px; }
.back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--muted); margin-bottom: 20px; cursor: pointer; background: none; border: none; font-family: Pretendard, sans-serif; }
.back-btn:hover { color: var(--navy); }

/* 이미지 그리드 */
.img-section { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 280px 140px; gap: 6px; border-radius: 16px; overflow: hidden; margin-bottom: 32px; }
.img-section.single { grid-template-columns: 1fr; grid-template-rows: 420px; }
.img-main { grid-row: 1 / 3; background: linear-gradient(135deg, #dde8f8, #c5d8f0); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
.img-section.single .img-main { grid-row: 1; }
.img-main img { width: 100%; height: 100%; object-fit: cover; }
.img-emoji { font-size: 64px; }
.img-sub { background: linear-gradient(135deg, #f5ede0, #e0c8a0); display: flex; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; }
.img-sub img { width: 100%; height: 100%; object-fit: cover; }
.img-more { background: rgba(27,45,79,0.85); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; cursor: pointer; }

/* 모달 */
.img-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.img-modal-inner { background: var(--white); border-radius: 16px; padding: 24px; max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto; position: relative; }
.modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 18px; cursor: pointer; color: var(--muted); }
.modal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.modal-grid img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; cursor: pointer; }

.content-grid { display: grid; grid-template-columns: 1fr; }

/* 헤더 */
.prop-badges { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.badge { font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 5px; }
.badge-type { background: rgba(27,45,79,0.1); color: var(--navy); }
.badge-num { background: var(--blue-light); color: var(--blue); }
.badge-sell { background: #e4f4e4; color: #1e7a1e; }
.badge-jeonse { background: #fff4e0; color: #a06000; }
.badge-monthly { background: #fde8e8; color: #a02020; }
.prop-title { font-size: 22px; font-weight: 800; color: var(--navy); line-height: 1.4; margin-bottom: 6px; letter-spacing: -0.5px; }
.prop-addr { font-size: 13px; color: var(--muted); margin-bottom: 4px; }
.prop-price { font-size: 30px; font-weight: 800; color: var(--text); letter-spacing: -1px; margin: 16px 0; }

/* 핵심 정보 */
.key-info { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
.key-item { background: var(--white); border: 1px solid var(--border); border-radius: 10px; padding: 14px; text-align: center; }
.key-label { font-size: 10px; color: var(--muted); font-weight: 500; margin-bottom: 6px; }
.key-value { font-size: 15px; font-weight: 800; color: var(--navy); }

/* 태그 */
.tag-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.info-tag { background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 500; color: var(--navy); }

.divider { height: 1px; background: var(--border); margin: 24px 0; }
.section-title { font-size: 16px; font-weight: 800; color: var(--navy); margin-bottom: 14px; }
.desc-text { font-size: 13px; color: #444; line-height: 1.9; white-space: pre-wrap; }

/* 지도 */
#kakao-map { width: 100%; height: 280px; border-radius: 12px; border: 1px solid var(--border); }

/* 문의 박스 */
.inquiry-box { background: var(--white); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
.agent-card { display: flex; align-items: center; gap: 12px; background: var(--bg); border-radius: 10px; padding: 14px; margin-bottom: 20px; }
.agent-avatar { width: 44px; height: 44px; background: var(--blue-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.agent-name { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 2px; }
.agent-tel { font-size: 13px; color: var(--blue); font-weight: 600; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 12px; }
.form-group label { display: block; font-size: 11px; font-weight: 700; color: var(--muted); margin-bottom: 6px; }
.form-group input, .form-group textarea { width: 100%; font-family: Pretendard, sans-serif; font-size: 13px; border: 1.5px solid var(--border); border-radius: 8px; padding: 10px 14px; outline: none; background: var(--bg); color: var(--text); resize: none; transition: border-color 0.2s; }
.form-group input:focus, .form-group textarea:focus { border-color: var(--blue); background: var(--white); }
.inquiry-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 4px; }
.submit-btn { background: var(--blue); color: #fff; border: none; border-radius: 10px; padding: 14px; font-family: Pretendard, sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
.submit-btn:hover { background: #1e4bc4; }
.submit-btn:disabled { background: var(--muted); cursor: not-allowed; }
.kakao-btn { background: #FEE500; color: #1b1b1b; border: none; border-radius: 10px; padding: 14px; font-family: Pretendard, sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; }
.submit-done { margin-top: 12px; font-size: 12px; color: #1e7a1e; text-align: center; font-weight: 500; background: #e4f4e4; padding: 10px; border-radius: 8px; }

@media (max-width: 768px) {
  .detail-wrap { padding: 20px 16px; }
  .img-section { grid-template-columns: 1fr 1fr; grid-template-rows: 180px 90px; }
  .prop-title { font-size: 18px; }
  .prop-price { font-size: 22px; }
  .key-info { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .inquiry-btns { grid-template-columns: 1fr; }
  #kakao-map { height: 220px; }
  .modal-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>