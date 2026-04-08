<template>
  <footer class="portal-footer">
    <div class="footer-main">
      <div class="footer-brand">
        <img src="/log.svg" alt="栖居" class="footer-logo" />
        <span class="slogan">发现独特的住宿体验</span>
      </div>

      <div class="footer-links">
        <div class="link-group">
          <h4>经营端</h4>
          <router-link to="/login?role=host">房东登录</router-link>
          <a href="#">帮助中心</a>
          <a href="#">结算规则</a>
        </div>
        <div class="link-group">
          <h4>旅客端</h4>
          <a href="#">iOS APP</a>
          <a href="#">Android APP</a>
          <a href="#">用户体验计划</a>
        </div>
        <div class="link-group">
          <h4>关于</h4>
          <a href="#">关于栖居</a>
          <a href="#">联系我们</a>
          <span class="contact-email">support@housestay.com</span>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 栖居民宿预订系统</span>
      <span class="separator">·</span>
      <span>基于 Vue3 + SpringBoot 构建</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.portal-footer {
  background: #1a1a1a;
  color: #ffffff;
  padding: 60px 0 32px;
}

.footer-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  justify-content: space-between;
  gap: 80px;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .footer-logo {
    height: 36px;
    width: auto;
  }

  .slogan {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.5);
  }
}

.footer-links {
  display: flex;
  gap: 64px;

  .link-group {
    display: flex;
    flex-direction: column;
    gap: 12px;

    h4 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: rgba(255, 255, 255, 0.4);
      font-weight: 500;
      margin-bottom: 4px;
    }

    a, span {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      transition: color 0.3s;
      cursor: pointer;

      &:hover {
        color: #FF5A5F;
      }
    }

    .contact-email {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.4);
      cursor: default;

      &:hover {
        color: rgba(255, 255, 255, 0.4);
      }
    }
  }
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 48px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);

  .separator {
    opacity: 0.4;
  }
}

// 响应式
@media (max-width: 1024px) {
  .footer-main {
    flex-direction: column;
    gap: 40px;
    padding-bottom: 32px;
  }

  .footer-links {
    gap: 40px;
  }
}

@media (max-width: 768px) {
  .portal-footer {
    padding: 48px 0 24px;
  }

  .footer-main,
  .footer-bottom {
    padding-left: 24px;
    padding-right: 24px;
  }

  .footer-links {
    flex-wrap: wrap;
    gap: 32px;

    .link-group {
      min-width: 140px;
    }
  }

  .footer-bottom {
    flex-direction: column;
    gap: 8px;
    text-align: center;

    .separator {
      display: none;
    }
  }
}
</style>
