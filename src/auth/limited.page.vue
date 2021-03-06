<template>
  <div class="wrap">
    <div class="warning">
      <h1>Just so you know...</h1>
      <p>
        <strong>This is a Dreamer account.</strong> When you use a Dreamer account, you should know:
      </p>
      <ul>
        <li>
          <strong>Your documents are not private.</strong> Anyone who logs in on this computer may be able to see and edit them.
        </li>
        <li>
          <strong>Your documents are not safe.</strong> If you reinstall your browser, clear your browsing data, or wipe your hard drive, all your work will be deleted. If you use more space than your browser allows, it may erase all your data without warning.
        </li>
        <li>
          <strong>Your documents are not online.</strong> You can't access them from any other computer.
        </li>
      </ul>
      <p>
        Dreamer accounts are not intended for long-term use, but you can use yours for as long as you want.
        <router-link to="/account">
          <strong>Or upgrade to an Author account</strong>
        </router-link>
        to get <strong>private, safe, permanent online storage</strong> for all your documents. It's only $7.99 per month.
      </p>
    </div>
    <div class="fill"/>
    <div class="actions">
      <router-link to="/account">
        <button class="button-green">
          Upgrade to Author
        </button>
      </router-link>
      <button 
        class="continue-button button-link" 
        @click="noPremium()">
        Continue as a Dreamer
      </button>
    </div>
  </div>
</template>

<script>
import { goToApp } from './shared'

export default {
  computed: {
    user() {
      const record = this.$route.matched.find(record => record && record.meta.getCurrentUser)
      return record && record.meta && record.meta.getCurrentUser()
    },
  },
  created() {
    if (this.user.isPremium) {
      goToApp()
    }
  },
  data() {
    return {}
  },
  methods: {
    noPremium() {
      goToApp()
    },
  },
  props: {},
}
</script>

<style scoped>
.wrap {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
}

.warning {
  padding: 0 50px;
}

ul {
  padding-left: 6px;
}

.fill {
  flex: 1;
}

.actions {
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 12px 0;
  width: 300px;
}

.continue-button {
  margin-bottom: 8px;
}
</style>
