<template>
  <KeyboardReader @read="(resp) => read(resp)" :match="new RegExp('.+')" />
</template>

<script>
import KeyboardReader from "@/components/KeyboardReader.vue";
export default {
  name: "TimeoutHandler",
  components: { KeyboardReader },
  props: {
    timeout: {
      type: Number,
      default: 5000,
    },
  data() {
    return {
      countdown: Math.floor(this.timeout / 1000),
      interval: null,
      timer: null,
    }
  }
  },
  methods: {
    read: function () {
      this.resetTimers();
    },
    resetTimers() {
      clearTimeout(this.timer);
      clearInterval(this.interval);

      this.countdown = Math.floor(this.timeout / 1000);
      this.$emit("timeout-update", this.countdown);

      this.interval = setInterval(() => {
        this.countdown--;
        this.$emit("timeout-update", this.countdown);
      }, 1000);

      this.timer = setTimeout(this.logout, this.timeout);
    },
    logout: function () {
      this.timeoutInstance = null;
      this.$router.go(); // not so nice, because page reloads, but will look for alternative
      this.$store.commit("logout");
    },
  },
  mounted: function () {
    this.resetTimers();
  },
  beforeDestroy: function () {
    if (this.timeoutInstance) {
      clearTimeout(this.timeoutInstance);
      this.timeoutInstance = null;
    }
  },
};
</script>

<style></style>
