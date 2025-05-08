<template>
  <b-container class="text-center mt-5">
    <h1>Please scan the Asset</h1>
    <b-icon-upc-scan class="icon-big mt-4 mb-4" v-if="!this.loading" />
    <b-spinner class="spinner-big mt-4 mb-4" v-else />
    <b-alert :show="this.showAlert" variant="danger" fade>
      This asset was not found.
    </b-alert>
    <div class="mt-5">

    </div>
    <Scanner
      @scan="this.scan"
      @startScan="showAlert = false"
      @loading="(l) => (this.loading = l)"
    />
    <b-alert variant="warning" show v-if="countdown > 0">
                Logging out in {{ countdown }} seconds...
    </b-alert>
  </b-container>
</template>

<script>
import Scanner from "../components/Scanner.vue";
export default {
  components: {Scanner },
  name: "Scan",
  data: () => ({
    showAlert: false,
    loading: false,
    timeoutId: null,
    countdown: 300,
    countdownInterval: null,
  }),
  mounted: function() {
    // Start countdown timer and update every second
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.countdownInterval);
        this.$router.push("/login"); // Reset checkState after countdown
      }
    }, 1000);
    
  },
  methods: {
    scan: function (resp) {
      if (resp == "ERROR") {
        this.showAlert = true;
      } else {
        this.$router.push({
          name: "ScanResult",
          params: {
            result: resp,
          },
        });
      }
    },
  },
};
</script>
