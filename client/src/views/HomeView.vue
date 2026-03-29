<template>
  <div>
    <div class="hero">
      <div class="hero-tag">📍 경기도 김포시 구래동</div>
      <h1>믿을 수 있는 동네 부동산<br><em>구래부동산</em>입니다</h1>
      <p>20년 지역 경험을 바탕으로<br>매매·전세·월세 모든 거래를 안전하게 도와드립니다.</p>
      <div class="search-wrap">
        <input v-model="searchKeyword" type="text" placeholder="지역, 단지명으로 검색하세요" @keyup.enter="doSearch">
        <button @click="doSearch">검색</button>
      </div>
    </div>

    <div class="contact-row">
      <a class="contact-btn kakao" href="#" target="_blank">
        <div class="contact-icon">💬</div>
        <div><span class="contact-title">카카오톡 문의</span><span class="contact-sub">오픈채팅으로 빠르게</span></div>
      </a>
      <a class="contact-btn phone" href="tel:031-000-0000">
        <div class="contact-icon">📞</div>
        <div><span class="contact-title">전화 문의</span><span class="contact-sub">031-000-0000</span></div>
      </a>
    </div>

    <!-- 필터 -->
    <div class="filter-area">
      <div class="filter-line">
        <span class="fl-label">물건종류</span>
        <div class="fl-tabs">
          <div class="fl-tab" :class="{ active: selectedCat === '전체' }" @click="selectCat('전체')">전체</div>
          <div v-for="cat in categories" :key="cat.value"
            class="fl-tab" :class="{ active: selectedCat === cat.value }"
            @click="selectCat(cat.value)">
            {{ cat.icon }} {{ cat.label }}
          </div>
        </div>
      </div>
      <div class="filter-line">
        <span class="fl-label">거래유형</span>
        <div class="fl-tabs">
          <div class="fl-tab" :class="{ active: selectedDeal === '전체' }" @click="selectedDeal = '전체'">전체</div>
          <div class="fl-tab" :class="{ 'active-sell': selectedDeal === '매매' }" @click="selectedDeal = '매매'">매매</div>
          <div class="fl-tab" :class="{ 'active-jeonse': selectedDeal === '전세' }" @click="selectedDeal = '전세'">전세</div>
          <div class="fl-tab" :class="{ 'active-monthly': selectedDeal === '월세' }" @click="selectedDeal = '월세'">월세</div>
        </div>
      </div>
    </div>

    <!-- 매물 목록 -->
    <div class="listings">
      <div class="listings-header">
        <div class="listings-title">{{ listingsTitle }}</div>
        <div class="listings-meta">총 {{ filteredProperties.length }}개</div>
      </div>
      <div v-if="store.loading" class="empty">불러오는 중...</div>
      <div v-else-if="filteredProperties.length === 0" class="empty">조건에 맞는 매물이 없습니다.</div>
      <div v-else class="cards">
        <PropertyCard
          v-for="p in filteredProperties"
          :key="p.id"
          :property="p"
          @click="goDetail(p.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertyStore } from '../stores/property'
import PropertyCard from '../components/PropertyCard.vue'

const router = useRouter()
const store = usePropertyStore()
const searchKeyword = ref('')
const selectedCat = ref('전체')
const selectedDeal = ref('전체')

const categories = [
  { value: '아파트',   label: '아파트',   icon: '🏢' },
  { value: '오피스텔', label: '오피스텔', icon: '🏬' },
  { value: '상가',     label: '상가',     icon: '🏪' },
  { value: '기타',     label: '기타',     icon: '🌿' },
]

function selectCat(val) {
  selectedCat.value = val
  searchKeyword.value = ''
}

function doSearch() {
  selectedCat.value = '전체'
  selectedDeal.value = '전체'
}

const listingsTitle = computed(() => {
  const parts = []
  if (selectedCat.value !== '전체') parts.push(selectedCat.value)
  if (selectedDeal.value !== '전체') parts.push(selectedDeal.value)
  if (searchKeyword.value) parts.push(`"${searchKeyword.value}" 검색 결과`)
  return parts.length > 0 ? parts.join(' · ') + ' 매물' : '전체 매물'
})

const filteredProperties = computed(() => {
  return store.properties.filter(p => {
    const matchCat = selectedCat.value === '전체' || p.property_type === selectedCat.value
    const matchDeal = selectedDeal.value === '전체' || p.price_type === selectedDeal.value
    const keyword = searchKeyword.value.trim()
    const matchSearch = !keyword ||
      (p.title && p.title.includes(keyword)) ||
      (p.address && p.address.includes(keyword)) ||
      (p.description && p.description.includes(keyword))
    return matchCat && matchDeal && matchSearch
  })
})

function goDetail(id) { router.push('/property/' + id) }
onMounted(() => { store.fetchAll() })
</script>

<style scoped>
.hero { background: var(--white); padding: 48px 40px 40px; border-bottom: 1px solid var(--border); }
.hero-tag { display: inline-flex; align-items: center; gap: 5px; background: var(--blue-light); color: var(--blue); font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px; margin-bottom: 18px; }
.hero h1 { font-size: 28px; font-weight: 800; color: var(--navy); line-height: 1.45; margin-bottom: 10px; letter-spacing: -0.5px; }
.hero h1 em { font-style: normal; color: var(--blue); }
.hero p { color: var(--muted); font-size: 13px; margin-bottom: 26px; line-height: 1.8; }
.search-wrap { display: flex; gap: 8px; max-width: 520px; }
.search-wrap input { flex: 1; font-family: Pretendard, sans-serif; font-size: 13px; border: 1.5px solid var(--border); border-radius: 8px; padding: 11px 16px; outline: none; background: var(--bg); transition: border-color 0.2s; }
.search-wrap input:focus { border-color: var(--blue); background: var(--white); }
.search-wrap button { background: var(--blue); color: #fff; border: none; border-radius: 8px; padding: 11px 24px; font-family: Pretendard, sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.search-wrap button:hover { background: #1e4bc4; }

.contact-row { display: flex; gap: 12px; padding: 16px 40px; background: var(--white); border-bottom: 1px solid var(--border); }
.contact-btn { flex: 1; border-radius: 12px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; cursor: pointer; border: none; font-family: Pretendard, sans-serif; transition: all 0.2s; text-decoration: none; }
.contact-btn.kakao { background: #FEE500; }
.contact-btn.kakao:hover { background: #f5dc00; }
.contact-btn.phone { background: #e8f0ff; }
.contact-btn.phone:hover { background: #d4e4fb; }
.contact-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; background: rgba(0,0,0,0.08); }
.contact-title { font-size: 14px; font-weight: 700; color: #1b1b1b; display: block; margin-bottom: 2px; }
.contact-sub { font-size: 11px; color: rgba(0,0,0,0.5); display: block; }

/* 필터 */
.filter-area { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 40px; position: sticky; top: 60px; z-index: 90; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.filter-line { display: flex; align-items: center; border-bottom: 1px solid var(--border); }
.filter-line:last-child { border-bottom: none; }
.fl-label { font-size: 11px; font-weight: 700; color: var(--muted); width: 56px; flex-shrink: 0; padding: 12px 0; }
.fl-tabs { display: flex; gap: 0; overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.fl-tabs::-webkit-scrollbar { display: none; }
.fl-tab { padding: 12px 16px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s; user-select: none; -webkit-user-select: none; margin-bottom: -1px; }
.fl-tab:hover { color: var(--navy); }
.fl-tab.active { color: var(--navy); font-weight: 700; border-bottom-color: var(--navy); }
.fl-tab.active-sell { color: #1e7a1e; font-weight: 700; border-bottom-color: #1e7a1e; }
.fl-tab.active-jeonse { color: #a06000; font-weight: 700; border-bottom-color: #a06000; }
.fl-tab.active-monthly { color: #a02020; font-weight: 700; border-bottom-color: #a02020; }

.listings { padding: 28px 40px; }
.listings-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.listings-title { font-size: 16px; font-weight: 800; color: var(--navy); }
.listings-meta { font-size: 12px; color: var(--muted); }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.empty { text-align: center; padding: 80px 0; color: var(--muted); font-size: 14px; }

@media (max-width: 768px) {
  .hero { padding: 32px 20px 28px; }
  .hero h1 { font-size: 22px; }
  .search-wrap { max-width: 100%; }
  .search-wrap button { padding: 11px 16px; }
  .contact-row { padding: 12px 16px; gap: 8px; }
  .contact-btn { padding: 12px 14px; gap: 10px; }
  .contact-icon { width: 34px; height: 34px; font-size: 16px; }
  .contact-title { font-size: 13px; }
  .contact-sub { font-size: 10px; }
  .filter-area { padding: 0 16px; top: 60px; }
  .fl-label { font-size: 10px; width: 44px; }
  .fl-tab { padding: 10px 12px; font-size: 12px; }
  .listings { padding: 20px 16px; }
  .cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}

@media (max-width: 480px) {
  .cards { grid-template-columns: 1fr; }
  .hero h1 { font-size: 20px; }
}
</style>