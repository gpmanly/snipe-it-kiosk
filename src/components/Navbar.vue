<template>
  <b-navbar type="dark" variant="primary" class="fixed-navbar">
    <b-navbar-brand class="pl-2 fixed-font">
      {{ this.$store.state.config.pageTitle }}
    </b-navbar-brand>
  </b-navbar>
</template>

<style scoped>
.fixed-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 16px; /* Fixed height */
  width: 100%;
  z-index: 1030;
  padding: 0 10px; /* Optional: fixed horizontal padding */
  display: flex;
  align-items: center;
  font-size: 0; /* Removes spacing between inline elements */
  overflow: hidden;
}

.fixed-font {
  font-size: 10px; /* Fixed font size in px */
  font-family: 'Inter', sans-serif;
  line-height: 1;
  white-space: nowrap;
}
</style>
