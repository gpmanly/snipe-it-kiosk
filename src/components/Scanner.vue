<template>
  <b-container class="text-center mt-5">
    <KeyboardReader
      @read="(resp) => scan(resp)"
      @startReading="$emit('startScan')"
    />
  </b-container>
</template>
<script>
import KeyboardReader from "@/components/KeyboardReader.vue";
export default {
  name: "Scanner",
  components: { KeyboardReader },
  methods: {
    scan: function (resp) {
      this.$emit("loading", true);

      let apiCall;

      // If response starts with "http://", extract the ID after the last "/" and use getAssetByID
      if (resp.startsWith("http")) {
        const assetId = resp.substring(resp.lastIndexOf("/") + 1);
        apiCall = this.$apiCalls().getAssetByID(assetId);
      } else {
        // Otherwise, use getAssetByTag
        apiCall = this.$apiCalls().getAssetByTag(resp);
      }

      apiCall
        .then((resp) => {
          this.$emit("loading", false);
          this.$emit("scan", resp);
        })
        .catch(() => {
          this.$emit("loading", false);
          this.$emit("scan", "ERROR");
        });
    },
  },
};
</script>

<style></style>