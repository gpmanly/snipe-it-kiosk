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
    <TimeoutHandler 
      :timeout="this.$store.state.config.logoutTimeout || 5000" 
      @timeout-update="(val) => timeout = val"
    />
    <b-alert variant="warning" show v-if="timeout > 0"
      class="d-inline-block px-3 py-2"
      style="width: auto; white-space: nowrap;"
      >
                Logging out in {{ timeout }} seconds...
    </b-alert>
  </b-container>
</template>

<script>
import Scanner from "../components/Scanner.vue";
import TimeoutHandler from "../components/TimeoutHandler.vue";

export default {
  components: {Scanner, TimeoutHandler },
  name: "Scan",
  data: () => ({
    showAlert: false,
    loading: false,
    timeout: 0,
  }),
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
