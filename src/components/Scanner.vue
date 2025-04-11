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
      this.$apiCalls()
        .getAssetByTag(resp)
        .then((resp) => {
          const asset = assetResp;

          // If the asset has an assigned user, fetch user details
          if (asset.assigned_to && asset.assigned_to.id) {
            return this.$apiCalls()
              .getUserById(asset.assigned_to.id)
              .then((user) => {
                asset.assigned_to.details = user; // Optional: store full user details
                this.$emit("loading", false);
                this.$emit("scan", asset);
            });

          } else {
          this.$emit("loading", false);
          this.$emit("scan", resp);
          }
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
