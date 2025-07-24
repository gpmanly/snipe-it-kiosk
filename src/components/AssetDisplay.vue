<template>
  <div>
    <h2 class="text-left">{{ this.asset.manufacturer.name }} {{ this.asset.model.name }} {{ this.asset.name }}</h2>

    <b-row class="mt-4" v-if="this.checkState == 0">
      <b-col>
        <b-table :items="items" :fields="['icon', 'name', 'value']" :row-class="rowClass" class="text-left">
          <template #head(icon)="">
            <span></span>
          </template>
          <template #cell(icon)="data">
            <b-icon :icon="data.value" />
          </template>
          <template #cell(name)="datum">
            <span v-if="datum.item.name === 'Asset Status'">
                <b-badge variant="info" class="badge-big">{{ datum.item.name }}</b-badge> </span>
            <span v-else>{{ datum.item.name }}</span>
          </template>
          <template #cell(value)="data">
              <span v-if="data.item.value === 'IN'">
                <b-badge variant="success" class="badge-big">{{ data.item.value }}</b-badge> </span>
              <span v-else-if="data.item.value === 'OUT'">
                <b-badge variant="primary" class="badge-big">{{ data.item.value }}</b-badge> </span>
              <span v-else-if="data.item.value === 'HOLD'">
                <b-badge variant="warning" class="badge-big">{{ data.item.value }}</b-badge> </span>
            <span v-else>{{ data.item.value }}</span>
          </template>
        </b-table>
        <img :src="this.asset.image" v-if="this.asset.image" style="max-width: 400px; height: auto;" />
      </b-col>
      <b-col>

        <b-alert show variant="info" v-if="this.asset.status_label.status_meta == 'deployed'">
          <div class="text-center">
            <!-- Avatar Image -->
            <img :src="user.avatar" v-if="user.avatar" alt="Assigned User Avatar" class="rounded-circle" width="auto"
              height="200" />
            <!-- Assigned User Info -->
            <div class="ml-2">
              This asset is deployed to:<br />
              <b-badge variant="success" class="badge-big">{{ this.asset.assigned_to.name }}</b-badge>
            </div>

          </div>
        </b-alert>

        <b-alert show variant="danger" v-else-if="this.asset.status_label.status_meta == 'undeployable'">
          <b-badge variant="danger" class="badge-big"><b-icon-exclamation-circle-fill show variant="danger" style="width: 20px; height: 20px;" /> HOLD! This asset
          can not
          be deployed<br />
          State: {{ this.asset.status_label.name }}</b-badge>
        </b-alert>

        <b-alert show variant="danger" v-else>
          <b-badge variant="danger" class="badge-big"><b-icon-exclamation-circle-fill show variant="danger" style="width: 20px; height: 20px;" /> HOLD! This asset
          is not
          checked-out to anyone.</b-badge>
        </b-alert>

        <b-alert variant="warning" show v-if="countdown > 0" class="d-inline-block px-3 py-2"
          style="width: auto; white-space: nowrap;">
          Redirecting in {{ countdown }} seconds...
        </b-alert>

        <KeyboardReader @read="(resp) => onKeyboardRead(resp)" @startReading="$emit('startScan')" />
        <div>
          <Button variant="primary" @click="() => assetOUT()" class="ml-2" v-if="
            this.asset.custom_fields['Asset Status'].value == 'IN' &&
            this.asset.custom_fields['Asset Status'].value != 'HOLD'
          ">
            <b-icon-upc-scan /> Scan IN/OUT
          </Button>

          <Button variant="primary" @click="() => assetIN()" class="ml-2" v-if="
            this.asset.custom_fields['Asset Status'].value == 'OUT' &&
            this.asset.custom_fields['Asset Status'].value != 'HOLD'
          ">
            <b-icon-upc-scan /> Scan IN/OUT
          </Button>

          <Button variant="warning" @click="() => hold()" class="ml-2" v-if="
            this.asset.custom_fields['Asset Status'].value == 'OUT' ||
            this.asset.custom_fields['Asset Status'].value == 'IN' &&
            this.asset.custom_fields['Asset Status'].value != 'HOLD'
          ">
            <b-icon-upc-scan /> Scan HOLD
          </Button>
        </div>
      </b-col>

    </b-row>
    <b-row v-if="this.checkState != 0">
      <b-col>
        <b-spinner class="spinner-big mt-4 mb-4" v-if="this.checkState == 1" />
        <div v-if="this.checkState == 2">
          <b-icon-check variant="primary" class="icon-big mt-4 mb-4" />
          <h5>
            Asset is now OUT
          </h5>
        </div>
        <div v-if="this.checkState == 3">
          <b-icon-check variant="success" class="icon-big mt-4 mb-4" />
          <h5>
            Asset is now IN
          </h5>
        </div>
        <div v-if="this.checkState == 4">
          <b-icon-exclamation-octagon variant="danger" class="icon-big mt-4 mb-4" />
          <h5>Please put the item back!</h5>
        </div>
        <div v-if="this.checkState == 5">
          <b-icon-exclamation-triangle variant="warning" class="icon-big mt-4 mb-4" />
          <h5>
            Asset is put on HOLD
          </h5>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Button from "./Button.vue";
import KeyboardReader from "@/components/KeyboardReader.vue";

export default {
  components: { Button, KeyboardReader },
  name: "AssetDisplay",
  data: () => ({
    checkState: 0, // 0: init, 1: loading, 2: success assetOUT, 3: success assetIN, 4: error, 5: warning hold;
    locationOnCheckin: null,
    selectedUser: null,
    user: {
      avatar: null,
    },
    timeoutId: null,
    countdown: 10,
    countdownInterval: null,
  }),
  mounted: function () {
    if (this.asset.status_label.status_meta == 'deployed') {
      this.getUserAvatar(this.asset.assigned_to.id);
    }

    // Start countdown timer and update every second
    this.countdownInterval = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.countdownInterval);
        this.$router.push("/scan"); // Reset checkState after countdown
      }
    }, 1000);

  },
  computed: {
    items: function () {
      let a = [
        { icon: "hdd", name: "Model number", value: this.asset.model_number },
        { icon: "tag", name: "Asset tag", value: this.asset.asset_tag },
        { icon: "key", name: "Serial number", value: this.asset.serial },
        {
          icon: "map",
          name: "Location",
          value: this.asset.rtd_location ? this.asset.rtd_location.name : "-",
        },
      ];
      Object.keys(this.asset.custom_fields).slice(0,1).forEach((i) => {
        a.push({
          icon: "",
          name: i,
          value: this.asset.custom_fields[i].value,
        });
      });
      return a;
    },
  },
  props: {
    asset: {
      required: true,
      type: Object,
    }
  },
  methods: {
    rowClass(item, type) {
      if (!item || type !== 'row') return '';
      return item.name === 'Asset Status' ? 'highlight-row' : '';
    },
    onKeyboardRead: function (input) {
      const val = input;
      if (val === 'out') {
        this.assetOUT();
      } else if (val === 'in') {
        this.assetIN();
      } else if (val === 'hold') {
        this.hold();
      } else {
        console.warn("Unrecognized keyboard input:", val);
      }
    },
    assetOUT: function () {
      clearInterval(this.countdownInterval);
      this.checkState = 1;
      this.$apiCalls()
        .updateAssetOutByTag(this.asset.id)
        .then(() => {
          this.checkState = 2;
          setTimeout(() => {
            this.$router.push("/scan");
          }, 1000);

          return;
        })
        .catch(() => {
          this.checkState = 4;
        });
    },
    assetIN: function () {
      clearInterval(this.countdownInterval);
      this.checkState = 1;
      this.$apiCalls()
        .updateAssetInByTag(this.asset.id)
        .then(() => {
          this.checkState = 3;
          setTimeout(() => {
            this.$router.push("/scan");
          }, 1000);
          return;
        })
        .catch((e) => {
          console.error(e);
          this.checkState = 4;
        });
    },
    hold: function () {
      clearInterval(this.countdownInterval);
      this.checkState = 1;
      this.$apiCalls()
        .updateAssetHoldByTag(this.asset.id)
        .then(() => {
          this.checkState = 5;
          setTimeout(() => {
            this.$router.push("/scan");
          }, 2000);

          return;
        })
        .catch(() => {
          this.checkState = 4;
        });
    },
    getUserAvatar: function (user) {
      let id = null;
      if (user == null) {
        id = null;
        return;
      } else {
        id = user;
      }
      this.$apiCalls()
        .getUserById(id)
        .then((resp) => {
          this.user.avatar = resp.avatar;
        })
        .catch((e) => {
          console.error(e);
          this.checkState = 4;
        });
    },
  },
};
</script>

<style scoped>
.badge-big {
  font-size: 1.5rem !important;
  padding: 0.25rem 2rem !important;
}
</style>
