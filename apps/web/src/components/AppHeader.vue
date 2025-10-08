<template>
  <header class="header">
    <div class="header__inner">
      <RouterLink to="/" class="brand">
        <img src="/logo.svg" alt="Mentat" class="brand__icon" />
        <span class="brand__name">Mentat</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/" class="nav__link" :class="{ active: route.path === '/' }">
          Markets
        </RouterLink>
        <RouterLink to="/create" class="nav__link" :class="{ active: route.path.startsWith('/create') }">
          Create
        </RouterLink>
        <RouterLink to="/curate" class="nav__link" :class="{ active: route.path.startsWith('/curate') }">
          Curate
        </RouterLink>
        <RouterLink to="/proofs" class="nav__link" :class="{ active: route.path.startsWith('/proofs') }">
          Proof Ops
        </RouterLink>
      </nav>

      <div class="actions">
        <button class="ghost">Sign in</button>
        <button class="cta">Connect Wallet</button>
      </div>

      <button class="menu" @click="toggleMobileNav" aria-label="Toggle navigation">
        <span />
        <span />
        <span />
      </button>
    </div>

    <transition name="slide">
      <nav v-if="mobileOpen" class="mobile-nav">
        <RouterLink to="/" @click="closeMobile" :class="{ active: route.path === '/' }">
          Markets
        </RouterLink>
        <RouterLink to="/create" @click="closeMobile" :class="{ active: route.path.startsWith('/create') }">
          Create
        </RouterLink>
        <RouterLink to="/curate" @click="closeMobile" :class="{ active: route.path.startsWith('/curate') }">
          Curate
        </RouterLink>
        <RouterLink to="/proofs" @click="closeMobile" :class="{ active: route.path.startsWith('/proofs') }">
          Proof Ops
        </RouterLink>
        <button class="ghost">Sign in</button>
        <button class="cta">Connect Wallet</button>
      </nav>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const mobileOpen = ref(false);

function toggleMobileNav() {
  mobileOpen.value = !mobileOpen.value;
}

function closeMobile() {
  mobileOpen.value = false;
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  backdrop-filter: blur(12px);
  background: rgba(245, 246, 251, 0.85);
  border-bottom: 1px solid rgba(228, 231, 242, 0.8);
  z-index: 20;
}

.header__inner {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem clamp(1.5rem, 5vw, 2.5rem);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--color-text-primary);
  font-weight: 700;
  font-size: 1.15rem;
}

.brand__icon {
  width: 28px;
  height: 28px;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav__link {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  position: relative;
  padding-bottom: 0.25rem;
}

.nav__link.active {
  color: var(--color-text-primary);
}

.nav__link.active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.45rem;
  height: 2px;
  background: var(--color-accent);
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.menu {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: #fff;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.menu span {
  width: 16px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: 999px;
}

.mobile-nav {
  display: none;
}

.slide-enter-active,
.slide-leave-active {
  transition: max-height 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 320px;
}

@media (max-width: 860px) {
  .nav,
  .actions {
    display: none;
  }

  .menu {
    display: flex;
  }

  .mobile-nav {
    display: grid;
    gap: 0.75rem;
    padding: 0 1.5rem 1.25rem;
    background: rgba(255, 255, 255, 0.94);
    border-top: 1px solid var(--color-border);
  }

  .mobile-nav a {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-text-secondary);
  }

  .mobile-nav a.active {
    color: var(--color-text-primary);
  }
}
</style>
