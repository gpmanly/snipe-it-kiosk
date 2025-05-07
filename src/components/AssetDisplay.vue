<template>
  <div>
    <h2 class="text-left">{{ this.asset.manufacturer.name }} {{ this.asset.model.name }} {{ this.asset.name }}</h2>
    <b-row class="mt-4" v-if="this.checkState == 0">
      <b-col>
        <b-table :items="items">
          <template #head(icon)="">
            <span></span>
          </template>
          <template #cell(icon)="data">
            <b-icon :icon="data.value" />
          </template>
        </b-table>
        <img :src="this.asset.image" v-if="this.asset.image" style="max-width: 400px; height: auto;" />
      </b-col>
      <b-col>
        <b-alert
          show
          variant="info"
          v-if="this.asset.status_label.status_meta == 'deployed'"
        >
          <div class="text-center">
            <!-- Avatar Image -->
            <img 
              :src="user.avatar" 
              v-if="user.avatar"
              alt="Assigned User Avatar"
              class="rounded-circle"
              width="auto" height="200"
            />
            <!-- Assigned User Info -->
            <div class="ml-2">
              This asset is deployed to:<br />
              {{ this.asset.assigned_to.name }} ({{ this.asset.assigned_to.type }})
            </div>
          </div>
        </b-alert>
        
        <b-alert
          show
          variant="danger"
          v-else-if="this.asset.status_label.status_meta == 'undeployable'"
        >
          <b-icon-exclamation-circle-fill show variant="danger" style="width: 20px; height: 20px;" />    HOLD! This asset can not be deployed<br />
          State: {{ this.asset.status_label.name }}
        </b-alert>

        <b-alert show variant="danger" v-else>
          <b-icon-exclamation-circle-fill show variant="danger" style="width: 20px; height: 20px;" />    HOLD! This asset is not checked-out to anyone.
        </b-alert>

        <Button
          variant="primary"
          shortcut="Enter"
          @click="() => checkout()"
          v-if="
            this.asset.status_label.status_meta != 'undeployable' &&
            this.asset.status_label.status_meta != 'deployed'
          "
        >
          Check-out to me
        </Button>
        <Button
          variant="primary"
          shortcut="Enter"
          @click="() => checkin()"
          v-if="
            this.asset.status_label.status_meta != 'undeployable' &&
            this.asset.status_label.status_meta == 'deployed'
          "
        >
          Check-in
        </Button>
        <Button
          variant="primary"
          @click="$router.back()"
          shortcut="b"
          class="ml-2"
        >
          Back
        </Button>
        <UserSelector class="mt-2" @user="(id) => checkout(id)" />
      </b-col>
    </b-row>
    <b-row v-if="this.checkState != 0">
      <b-col>
        <b-spinner class="spinner-big mt-4 mb-4" v-if="this.checkState == 1" />
        <div v-if="this.checkState == 2">
          <b-icon-check variant="success" class="icon-big mt-4 mb-4" />
          <h5>Checked out to {{ this.selectedUser.name }}</h5>
        </div>
        <div v-if="this.checkState == 3">
          <b-icon-check variant="success" class="icon-big mt-4 mb-4" />
          <h5>
            Checked in
            <span v-if="this.locationOnCheckin">
              , please put it to location: {{ this.locationOnCheckin }}
            </span>
          </h5>
        </div>
        <div v-if="this.checkState == 4">
          <b-icon-exclamation-octagon
            variant="danger"
            class="icon-big mt-4 mb-4"
          />
          <h5>Please put the item back!</h5>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import Button from "./Button.vue";
import UserSelector from "./UserSelector.vue";

export default {
  components: { Button, UserSelector },
  name: "AssetDisplay",
  data: () => ({
    checkState: 0, // 0: init, 1: loading, 2: success checkout, 3: success checkin, 4: error;
    locationOnCheckin: null,
    selectedUser: null,
    user: {
      avatar: null,
    },
  }),
  mounted: function() {
    this.getUserAvatar(this.asset.assigned_to.id);
  },
  computed: {
    items: function () {
      let a = [
        { icon: "hdd", name: "Model number", value: this.asset.model_number },
        { icon: "tag", name: "Asset tag", value: this.asset.asset_tag},
        { icon: "key", name: "Serial number", value: this.asset.serial },
        {
          icon: "map",
          name: "Location",
          value: this.asset.rtd_location ? this.asset.rtd_location.name : "-",
        },
      ];
      Object.keys(this.asset.custom_fields).forEach((i) => {
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
    checkout: function (user) {
      let id = null;
      if (user == null) {
        id = this.$store.state.user.id;
        this.selectedUser = this.$store.state.user;
      } else {
        id = user.id;
        this.selectedUser = user;
      }
      this.checkState = 1;
      this.$apiCalls()
        .checkoutAssetByTag(this.asset.asset_tag, id)
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
    checkin: function () {
      this.checkState = 1;
      this.$apiCalls()
        .checkinAssetByTag(this.asset.asset_tag)
        .then((resp) => {
          this.locationOnCheckin = resp.location ? resp.location.name : null;
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

<style></style>
