import { defineStore } from 'pinia';

export type HelpTopic = 'overview' | 'creator' | 'curator' | 'trader' | 'proof';

export const useHelpStore = defineStore('help', {
  state: () => ({
    open: false,
    topic: 'overview' as HelpTopic
  }),
  actions: {
    show(topic: HelpTopic = 'overview') {
      this.open = true;
      this.topic = topic;
    },
    hide() {
      this.open = false;
    },
    toggle(topic: HelpTopic = 'overview') {
      if (this.open && this.topic === topic) {
        this.hide();
      } else {
        this.show(topic);
      }
    }
  }
});
