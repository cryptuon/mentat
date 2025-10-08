<template>
  <aside class="nav">
    <div class="nav__brand">
      <span class="nav__logo">☀️</span>
      <div>
        <strong>Mentat</strong>
        <p>Fremen-grade markets. No spice tax.</p>
      </div>
    </div>

    <nav class="nav__links">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="nav__link"
        :class="{ 'nav__link--active': route.path.startsWith(link.to) }"
      >
        <span class="nav__icon">{{ link.icon }}</span>
        <div>
          <span>{{ link.label }}</span>
          <p>{{ link.caption }}</p>
        </div>
      </RouterLink>
    </nav>

    <div class="nav__footer">
      <p>Spice flow: <span class="pill">Live</span></p>
      <div class="nav__footer-actions">
        <button class="ghost" @click="openHelp">Quick Help</button>
        <button class="ghost">Submit Feedback</button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useHelpStore } from '@/stores/help';

const route = useRoute();
const help = useHelpStore();

const links = [
  {
    to: '/',
    label: 'Sietch Feed',
    caption: 'Trending spice flows',
    icon: '🌵'
  },
  {
    to: '/create',
    label: 'Summon Market',
    caption: 'AI + launch',
    icon: '✨'
  },
  {
    to: '/curate',
    label: 'Sardaukar Check',
    caption: 'Keep it canon',
    icon: '🛡️'
  },
  {
    to: '/proofs',
    label: 'Truth Trance',
    caption: 'Drop zkTLS',
    icon: '🧾'
  },
  {
    to: '/account',
    label: 'Keep Ledger',
    caption: 'Fees & stakes',
    icon: '📊'
  }
];

const openHelp = () => help.toggle('overview');
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2.5rem 2rem;
  background: linear-gradient(155deg, rgba(31, 41, 55, 0.95), rgba(11, 16, 26, 0.9));
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 100vh;
}

.nav__brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav__logo {
  display: grid;
  place-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: radial-gradient(circle at top left, #7d5fff, #4318ff);
  font-size: 1.6rem;
}

.nav__brand strong {
  font-size: 1.35rem;
  letter-spacing: 0.04em;
}

.nav__brand p {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.nav__links {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.nav__link {
  display: grid;
  grid-template-columns: 48px 1fr;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  transition: border 0.2s, background 0.2s;
  color: inherit;
}

.nav__link p {
  margin: 0.3rem 0 0;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.nav__link--active {
  border-color: rgba(125, 95, 255, 0.6);
  background: rgba(125, 95, 255, 0.12);
}

.nav__link:hover {
  border-color: rgba(125, 95, 255, 0.35);
}

.nav__icon {
  display: grid;
  place-content: center;
  font-size: 1.4rem;
}

.nav__footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.nav__footer-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

@media (max-width: 960px) {
  .nav {
    position: static;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 1.25rem;
  }

  .nav__links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .nav__link {
    padding: 0.9rem;
  }

  .nav__footer {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
