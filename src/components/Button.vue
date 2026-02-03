<template>
  <b-btn
    v-bind="$attrs"
    @click="
      (e) => (this.href ? this.$router.push(this.href) : this.$emit('click', e))
    "
  >
    <slot />
    <span v-if="this.shortcut && !isShortcutsDisabled">
      [{{ this.shortcut }}]
    </span>
    <Shortcut
      v-if="this.shortcut != null && !isShortcutsDisabled"
      :shortcut="this.shortcut"
      :href="this.href"
      @click="(e) => this.$emit('click', e)"
    />
  </b-btn>
</template>
<script>
import Shortcut from "./Shortcut.vue";
export default {
  name: "Button",
  components: { Shortcut },
  props: {
    href: {
      type: String,
      default: null,
    },
    shortcut: {
      type: String,
      default: null,
    },
  },
  data: () => ({
    isShortcutsDisabled: false,
  }),
  mounted: function () {
    // Listen for disable/enable shortcuts signal
    this.$root.$on("disableShortcuts", (disabled) => {
      this.isShortcutsDisabled = disabled;
    });
  },
  beforeDestroy: function () {
    this.$root.$off("disableShortcuts");
  },
};
</script>
<style></style>