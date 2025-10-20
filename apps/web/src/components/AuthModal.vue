<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ mode === 'login' ? 'Sign In' : 'Create Account' }}</h2>
        <button class="close-btn" @click="close">&times;</button>
      </div>

      <div class="modal-body">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- Wallet Address (required) -->
          <label>
            Wallet Address
            <input
              v-model="form.wallet_address"
              type="text"
              placeholder="Your Solana wallet address"
              required
            />
          </label>

          <!-- Username (optional for registration) -->
          <label v-if="mode === 'register'">
            Username (optional)
            <input v-model="form.username" type="text" placeholder="Choose a username" />
          </label>

          <!-- Email (optional) -->
          <label>
            Email (optional)
            <input v-model="form.email" type="email" placeholder="your@email.com" />
          </label>

          <!-- Password (optional) -->
          <label>
            Password (optional)
            <input v-model="form.password" type="password" placeholder="••••••••" />
            <small>You can use wallet-only authentication or add email/password</small>
          </label>

          <div class="actions">
            <button type="button" class="ghost" @click="close" :disabled="isLoading">
              Cancel
            </button>
            <button type="submit" class="cta" :disabled="isLoading">
              {{ isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Register' }}
            </button>
          </div>
        </form>

        <div class="mode-switch">
          <template v-if="mode === 'login'">
            Don't have an account?
            <button @click="switchMode" class="link-btn">Register</button>
          </template>
          <template v-else>
            Already have an account?
            <button @click="switchMode" class="link-btn">Sign In</button>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';

const props = defineProps<{
  isOpen: boolean;
  initialMode?: 'login' | 'register';
}>();

const emit = defineEmits<{
  close: [];
  success: [];
}>();

const authStore = useAuthStore();

const mode = ref<'login' | 'register'>(props.initialMode || 'login');
const isLoading = ref(false);
const error = ref<string | null>(null);

const form = reactive({
  wallet_address: '',
  username: '',
  email: '',
  password: '',
});

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      // Reset form when modal opens
      form.wallet_address = '';
      form.username = '';
      form.email = '';
      form.password = '';
      error.value = null;
      mode.value = props.initialMode || 'login';
    }
  }
);

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login';
  error.value = null;
}

async function handleSubmit() {
  error.value = null;
  isLoading.value = true;

  try {
    if (mode.value === 'register') {
      await authStore.register({
        wallet_address: form.wallet_address,
        username: form.username || undefined,
        email: form.email || undefined,
        password: form.password || undefined,
      });
    } else {
      await authStore.login({
        wallet_address: form.wallet_address || undefined,
        email: form.email || undefined,
        password: form.password || undefined,
      });
    }

    emit('success');
    close();
  } catch (err: any) {
    error.value = err.response?.data?.detail || 'Authentication failed';
  } finally {
    isLoading.value = false;
  }
}

function close() {
  emit('close');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.4rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.error-message {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 0.75rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

form {
  display: grid;
  gap: 1rem;
}

label {
  display: grid;
  gap: 0.45rem;
  font-size: 0.9rem;
  font-weight: 500;
}

input {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  font-size: 0.95rem;
}

input:focus {
  outline: none;
  border-color: var(--color-accent);
}

small {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-weight: 400;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

.mode-switch {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.link-btn:hover {
  color: #1f4bf2;
}
</style>
