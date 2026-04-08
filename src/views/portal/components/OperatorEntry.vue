<template>
  <section class="operator-entry" id="operator">
    <div class="container">
      <div class="section-header light">
        <h2>加入栖居</h2>
        <p>无论您是民宿房东还是平台管理员</p>
      </div>

      <div class="entry-grid">
        <!-- 房东入口 -->
        <router-link to="/login?role=host" class="entry-card primary">
          <div class="card-content">
            <div class="entry-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9,22 9,12 15,12 15,22" />
              </svg>
            </div>
            <h3>房东工作台</h3>
            <p>房源管理 · 房态同步 · 数据经营</p>
            <div class="entry-action">
              <span>进入工作台</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>

        <!-- 管理员入口 -->
        <router-link to="/login?role=admin" class="entry-card secondary">
          <div class="card-content">
            <div class="entry-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <h3>管理后台</h3>
            <p>运营监控 · 系统配置 · 数据洞察</p>
            <div class="entry-action">
              <span>进入后台</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.operator-entry {
  padding: 120px 0;
  background: #0F0F0F;
  color: white;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 48px;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;

  &.light h2 {
    font-size: 36px;
    font-weight: 300;
    margin-bottom: 12px;
    letter-spacing: 0.05em;
    color: #ffffff;
  }

  &.light p {
    color: rgba(255, 255, 255, 0.6);
    font-size: 16px;
  }
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

.entry-card {
  position: relative;
  padding: 48px 40px;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }

  // 房东入口 - 琥珀金主题
  &.primary {
    background: linear-gradient(135deg, #D4A574 0%, #C9956A 100%);
    color: #0F0F0F;
    border: none;

    &:hover {
      box-shadow: 0 20px 40px rgba(212, 165, 116, 0.3);
    }

    .entry-icon {
      background: rgba(15, 15, 15, 0.15);
      color: #0F0F0F;
    }
  }

  // 管理员入口 - 深色玻璃
  &.secondary {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }

    .entry-icon {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
  }
}

.card-content {
  position: relative;
  z-index: 1;

  .entry-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
  }

  h3 {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  p {
    font-size: 14px;
    opacity: 0.7;
    margin-bottom: 32px;
    letter-spacing: 0.05em;
  }
}

.entry-action {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
  transition: gap 0.3s;

  svg {
    transition: transform 0.3s;
  }

  .entry-card:hover & {
    gap: 12px;
    opacity: 1;

    svg {
      transform: translateX(4px);
    }
  }
}

@media (max-width: 768px) {
  .operator-entry {
    padding: 80px 0;
  }

  .container {
    padding: 0 24px;
  }

  .section-header {
    margin-bottom: 40px;

    &.light h2 {
      font-size: 28px;
    }
  }

  .entry-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .entry-card {
    padding: 36px 28px;

    .card-content {
      h3 {
        font-size: 20px;
      }

      p {
        margin-bottom: 24px;
      }
    }
  }
}
</style>
