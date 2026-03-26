<template>
  <div>
    <!-- 히어로 -->
    <div class="hero">
      <div class="hero-tag">📍 경기도 김포시 구래동</div>
      <h1>믿을 수 있는 동네 부동산<br><em>구래부동산</em>입니다</h1>
      <p>20년 지역 경험을 바탕으로<br>매매·전세·월세 모든 거래를 안전하게 도와드립니다.</p>
      <div class="search-wrap">
        <input v-model="searchKeyword" type="text" placeholder="지역, 단지명으로 검색하세요" @keyup.enter="doSearch">
        <button @click="doSearch">검색</button>
      </div>
    </div>

    <!-- 통계 -->
    <div class="stats-row">
      <div class="stat"><div class="stat-icon">🏠</div><div><div class="stat-num">{{ store.properties.length }}</div><div class="stat-label">현재 매물</div></div></div>
      <div class="stat"><div class="stat-icon">✅</div><div><div class="stat-num">1,240</div><div class="stat-label">거래 완료</div></div></div>
      <div class="stat"><div class="stat-icon">⭐</div><div><div class="stat-num">20년</div><div class="stat-label">영업 경력</div></div></div>
      <div class="stat phone-stat"><div class="stat-icon">📞</div><div><div class="stat-num">031-000-0000</div><div class="stat-label">언제든 문의하세요</div></div></div>
    </div>

    <!-- 필터 -->
    <div class="filter-area">
      <div class="cat-tabs">
        <div v-for="cat in categories" :key="cat.value"
          class="cat-tab" :class="{ active: selectedCat === cat.value }"
          @click="selectCat(cat.value)">
          <span>{{ cat.icon }}</span> {{ cat.label }}
          <span class="cat-count">{{ catCount(cat.value) }}</span>
        </div>
      </div>
      <div class="deal-tabs">
        <span class="deal-label">거래유형</span>
        <div v-for="deal in currentDeals" :key="deal"
          class="deal-tab" :class="{ active: selectedDeal === deal }"
          @click="selectedDeal = deal">
          {{ deal }}
        </div>
      </div>
    </div>

    <!-- 매물 목록 -->
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
}
function catCount(cat) {
  return store.properties.filter(p => p.property_type === cat).length
}
const filteredProperties = computed(() => {
  return store.properties.filter(p => {
    const matchCat  = p.property_type === selectedCat.value
    const matchDeal = selectedDeal.value === '전체' || p.price_type === selectedDeal.value
    const matchSearch = !searchKeyword.value ||
      p.title?.includes(searchKeyword.value) ||
      p.address?.includes(searchKeyword.value)
    return matchCat && matchDeal && matchSearch
  })
})
function doSearch() {}
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

.stats-row { display: flex; background: var(--white); border-bottom: 1px solid var(--border); }
.stat { flex: 1; padding: 16px 28px; border-right: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
.stat:last-child { border-right: none; }
.stat-icon { width: 36px; height: 36px; background: var(--blue-light); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
.stat-num { font-size: 17px; font-weight: 800; color: var(--navy); line-height: 1; margin-bottom: 3px; letter-spacing: -0.5px; }
.stat-label { font-size: 11px; color: var(--muted); }

.filter-area { background: var(--white); border-bottom: 1px solid var(--border); padding: 0 40px; }
.cat-tabs { display: flex; border-bottom: 1px solid var(--border); overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-tab { display: flex; align-items: center; gap: 6px; padding: 14px 22px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; white-space: nowrap; flex-shrink: 0; }
.cat-tab:hover { color: var(--navy); }
.cat-tab.active { color: var(--navy); font-weight: 700; border-bottom-color: var(--blue); }
.cat-count { font-size: 10px; background: var(--bg); color: var(--muted); padding: 2px 7px; border-radius: 10px; font-weight: 500; }
.cat-tab.active .cat-count { background: var(--blue); color: #fff; }
.deal-tabs { display: flex; gap: 6px; padding: 12px 0; align-items: center; overflow-x: auto; }
.deal-label { font-size: 11px; color: var(--muted); margin-right: 4px; font-weight: 500; white-space: nowrap; }
.deal-tab { padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1.5px solid var(--border); background: var(--white); color: var(--muted); transition: all 0.15s; white-space: nowrap; }
.deal-tab:hover { border-color: var(--navy); color: var(--navy); }
.deal-tab.active { background: var(--navy); color: #fff; border-color: var(--navy); }

.listings { padding: 28px 40px; }
.listings-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
.listings-title { font-size: 16px; font-weight: 800; color: var(--navy); }
.listings-meta { font-size: 12px; color: var(--muted); }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.empty { text-align: center; padding: 80px 0; color: var(--muted); font-size: 14px; }

/* 반응형 */
@media (max-width: 768px) {
  .hero { padding: 32px 20px 28px; }
  .hero h1 { font-size: 22px; }
  .search-wrap { max-width: 100%; }
  .search-wrap button { padding: 11px 16px; }

  .stats-row { flex-wrap: wrap; }
  .stat { flex: 1 1 45%; border-right: none; border-bottom: 1px solid var(--border); padding: 14px 16px; }
  .phone-stat { flex: 1 1 100%; }
  .stat-num { font-size: 14px; }

  .filter-area { padding: 0 16px; }
  .cat-tab { padding: 12px 14px; font-size: 12px; }
  .deal-tabs { padding: 10px 0; flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; }

  .listings { padding: 20px 16px; }
  .cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}

@media (max-width: 480px) {
  .cards { grid-template-columns: 1fr; }
  .hero h1 { font-size: 20px; }
}
</style>