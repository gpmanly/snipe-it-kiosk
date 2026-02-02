<template>
  <b-container class="mt-5">
    <h1>Logged in as {{ this.$store.state.user.name }}</h1>
          <div class="text-left">
            <!-- Avatar Image -->
            <img :src="user.avatar" v-if="user.avatar" alt="Assigned User Avatar" class="rounded" width="auto"
              height="270" />
            <!-- Assigned User Info -->
            <div class="ml-2">
              <b-badge variant="success" class="badge-bigger text-wrap">{{ this.$store.state.user.name }}</b-badge>
            </div>
          </div>
    E-Mail: {{ this.$store.state.user.email }}<br />
    User-ID: {{ this.$store.state.user.id }}
    <div class="mt-5">
      <Button variant="primary" href="/" shortcut="b">Back</Button>
    </div>
  </b-container>
</template>

<script>
import Button from "../components/Button.vue";
export default {
  name: "User",
  components: { Button },
  data: () => ({
    user: {
      avatar: null,
    },
  }),
  mounted: function () {
    this.getUserAvatar(this.$store.state.user.id);
  },
  methods: {
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
        .catch(() => {
          this.user.avatar = null;
        });
    },
  },
};
</script>
