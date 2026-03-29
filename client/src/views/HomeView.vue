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
        <div>
          <span class="contact-title">카카오톡 문의</span>
          <span class="contact-sub">오픈채팅으로 빠르게</span>
        </div>
      </a>
      <a class="contact-btn phone" href="tel:031-000-0000">
        <div class="contact-icon">📞</div>
        <div>
          <span class="contact-title">전화 문의</span>
          <span class="contact-sub">031-000-0000</span>
        </div>
      </a>
    </div>

    <div class="filter-area">
      <div class="cat-cards">
        <div v-for="cat in categories" :key="cat.value"
          class="cat-card" :class="{ active: selectedCat === cat.value }"
          @click="selectCat(cat.value)">
          <div class="cat-card-icon">{{ cat.icon }}</div>
          <div class="cat-card-label">{{ cat.label }}</div>
          <div class="cat-card-count">{{ catCount(cat.value) }}개</div>
        </div>
      </div>
      <div class="deal-tabs">
        <div v-for="deal in currentDeals" :key="deal"
          class="deal-tab" :class="{ active: selectedDeal === deal }"
          @click="selectedDeal = deal">
          {{ deal }}
        </div>
      </div>
    </div>

    <div class="listings">
      <div class="listings-header">
        <div class="listings-title">{{ currentCatLabel }} 매물</div>
        <div class="listings-meta">총 {{ filteredProperties.length }}개</div>
      </div>
      <div v-if="store.loading" class="empty">불러오는 중...</div>
      <div v-else-if="filteredProperties.length === 0" class="empty">등록된 매물이 없습니다.</div>
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
const selectedCat = ref('아파트')
const selectedDeal = ref('전체')

const categories = [
  { value: '아파트',   label: '아파트',   icon: '🏢', deals: ['전체','매매','전세','월세'] },
  { value: '오피스텔', label: '오피스텔', icon: '🏬', deals: ['전체','매매','전세','월세'] },
  { value: '상가',     label: '상가',     icon: '🏪', deals: ['전체','매매','월세'] },
  { value: '기타',     label: '기타',     icon: '🌿', deals: ['전체','매매','월세'] },
]

const currentDeals = computed(() =>
  categories.find(c => c.value === selectedCat.value)?.deals || ['전체']
)
const currentCatLabel = computed(() =>
  categories.find(c => c.value === selectedCat.value)?.label || ''
)
function selectCat(val) {
  selectedCat.value = val
  selectedDeal.value = '전체'
  searchKeyword.value = ''
}
function catCount(cat) {
  return store.properties.filter(p => p.property_type === cat).length
}
const filteredProperties = computed(() => {
  return store.properties.filter(p => {
    const hasSearch = searchKeyword.value.trim() !== ''
    const matchCat  = hasSearch ? true : p.property_type === selectedCat.value
    const matchDeal = selectedDeal.value === '전체' || p.price_type === selectedDeal.value
    const keyword = searchKeyword.value.trim()
    const matchSearch = !keyword ||
      (p.title && p.title.includes(keyword)) ||
      (p.address && p.address.includes(keyword)) ||
      (p.description && p.description.includes(keyword))
    return matchCat && matchDeal && matchSearch
  })
})
function doSearch() {
  if (searchKeyword.value) selectedDeal.value = '전체'
}
function goDetail(id) { router.push("/property/" + id) }
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

.filter-area { background: var(--white); border-bottom: 1px solid var(--border); padding: 16px 40px 0; position: sticky; top: 60px; z-index: 90; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.cat-cards { display: flex; gap: 10px; margin-bottom: 12px; }
.cat-card { flex: 1; background: var(--bg); border: 2px solid var(--border); border-radius: 12px; padding: 14px 12px; text-align: center; cursor: pointer; transition: all 0.2s; user-select: none; -webkit-user-select: none; }
.cat-card:hover { border-color: var(--navy); }
.cat-card.active { border-color: var(--navy); background: var(--navy); }
.cat-card-icon { font-size: 22px; margin-bottom: 6px; }
.cat-card-label { font-size: 12px; font-weight: 700; color: var(--navy); }
.cat-card.active .cat-card-label { color: #fff; }
.cat-card-count { font-size: 10px; color: var(--muted); margin-top: 2px; }
.cat-card.active .cat-card-count { color: rgba(255,255,255,0.6); }

.deal-tabs { display: flex; gap: 8px; padding: 12px 0; align-items: center; overflow-x: auto; scrollbar-width: none; touch-action: pan-x; }
.deal-tabs::-webkit-scrollbar { display: none; }
.deal-label { font-size: 11px; color: var(--muted); margin-right: 4px; font-weight: 500; white-space: nowrap; }
.deal-tab { padding: 8px 20px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border); background: var(--white); color: var(--muted); transition: all 0.15s; white-space: nowrap; user-select: none; -webkit-user-select: none; }
.deal-tab:hover { border-color: var(--navy); color: var(--navy); }
.deal-tab.active { background: var(--navy); color: #fff; border-color: var(--navy); }

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
  .filter-area { padding: 12px 16px 0; top: 60px; }
  .cat-cards { gap: 6px; }
  .cat-card { padding: 10px 6px; border-radius: 10px; }
  .cat-card-icon { font-size: 18px; margin-bottom: 4px; }
  .cat-card-label { font-size: 11px; }
  .cat-card-count { display: none; }
  .deal-tabs { padding: 0; }
  .listings { padding: 20px 16px; }
  .cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}

@media (max-width: 480px) {
  .cards { grid-template-columns: 1fr; }
  .hero h1 { font-size: 20px; }
}
</style>