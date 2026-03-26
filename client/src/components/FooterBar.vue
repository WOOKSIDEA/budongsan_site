<template>
  <footer id="footer">
    <div class="footer-top">
      <div>
        <div class="footer-logo">구래부동산</div>
        <div class="footer-info">
          대표 · 김OO &nbsp;|&nbsp; 사업자등록번호 · 000-00-00000<br>
          주소 · 경기도 김포시 구래동 OOO<br>
          공인중개사 등록번호 · 제000호
        </div>
      </div>
      <div>
        <div class="footer-tel">031-000-0000</div>
        <div class="footer-tel-label">평일 09:00 – 18:00</div>
      </div>
    </div>
    <div class="copyright">© 2026 구래부동산. All rights reserved.</div>
  </footer>
</template>

<style scoped>
footer {
  background: var(--navy);
  padding: 32px 40px;
  margin-top: 8px;
}
.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  margin-bottom: 14px;
}
.footer-logo { font-size: 17px; font-weight: 800; color: #fff; margin-bottom: 8px; letter-spacing: -0.3px; }
.footer-info { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 400; line-height: 2; }
.footer-tel { font-size: 20px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
.footer-tel-label { font-size: 11px; color: rgba(255,255,255,0.4); text-align: right; }
.copyright { font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 400; }
</style>
