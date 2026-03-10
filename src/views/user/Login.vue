<template>
  <div class="login-page">
    <div class="login-card">
      <h2>欢迎回到栖居</h2>
      <el-form :model="form" label-position="top">
        <el-form-item label="手机号码">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-button type="primary" class="login-btn" @click="handleLogin" :loading="loading">
          登录
        </el-button>
        <div class="footer-links">
          <el-link type="info">忘记密码?</el-link>
          <el-link type="primary">注册新账号</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { users } from '@/mock/data';
import { ElMessage } from 'element-plus';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

const form = reactive({
  phone: '13800138000',
  password: 'password'
});

const handleLogin = () => {
  loading.value = true;
  // Simulate API
  setTimeout(() => {
    const user = users.find(u => u.phone === form.phone);
    if (user) {
      userStore.login(user, 'mock-jwt-token-123456');
      ElMessage.success('登录成功');
      
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user.role === 'host') {
        router.push('/host/dashboard');
      } else {
        router.push('/');
      }
    } else {
      ElMessage.error('用户不存在');
    }
    loading.value = false;
  }, 1000);
};
</script>

<style scoped lang="scss">
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f7f7;
}

.login-card {
  width: 400px;
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);

  h2 {
    text-align: center;
    margin-bottom: 32px;
    color: var(--color-primary);
  }

  .login-btn {
    width: 100%;
    margin-top: 24px;
    font-weight: 600;
  }

  .footer-links {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }
}
</style>
