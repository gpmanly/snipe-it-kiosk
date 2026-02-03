<template>
  <div>
    <Button variant="primary" shortcut="o" @click="() => (show = !show)">
      Check-out to other
    </Button>
    <b-modal v-model="show" title="Check-out to other user">
      <template slot="modal-footer">
        <Button variant="primary" shortcut="Esc" @click="() => (show = !show)">
          Close
        </Button>
      </template>

      <!-- Search input -->
      <b-form-group label="Search users:">
        <b-form-input
          v-model="searchQuery"
          placeholder="Type name to search..."
          type="text"
        ></b-form-input>
      </b-form-group>

      <!-- Filtered users list -->
      <b-row>
        <b-col
          class="av"
          sm="6"
          v-for="(user, i) in filteredUsers"
          :key="i"
          @click="selectUser(user)"
        >
          <b-avatar
            variant="primary"
            :text="
              (() => {
                let parts = user.name.split(' ');
                let last = parts[parts.length - 1][0];
                return (
                  parts.length > 1
                    ? `${parts[0][0]}${last || ''}`
                    : parts[0][0]
                ).toUpperCase();
              })()
            "
          />
          <br />
          {{ user.name }}
        </b-col>
      </b-row>

      <!-- No results message -->
      <div v-if="filteredUsers.length === 0" class="text-center text-muted mt-3">
        No users found matching "{{ searchQuery }}"
      </div>
    </b-modal>
  </div>
</template>

<script>
import Button from "./Button.vue";
export default {
  name: "UserSelector",
  components: { Button },
  data: () => ({
    users: [],
    show: false,
    searchQuery: "",
  }),
  computed: {
    filteredUsers: function () {
      if (!this.searchQuery.trim()) {
        return this.users;
      }

      const query = this.searchQuery.toLowerCase();
      return this.users.filter((user) =>
        user.name.toLowerCase().includes(query)
      );
    },
  },
  watch: {
    show: function (newVal) {
      if (newVal) {
        // Disable shortcuts when modal opens
        this.$root.$emit("disableShortcuts", true);
      } else {
        // Enable shortcuts when modal closes
        this.$root.$emit("disableShortcuts", false);
      }
    },
  },
  mounted: function () {
    this.$apiCalls()
      .getAllUsers()
      .then((resp) => {
        this.users = resp.rows;
      });
  },
  methods: {
    selectUser: function (user) {
      this.$emit("user", user);
      this.show = false;
      this.searchQuery = "";
    },
  },
};
</script>

<style>
.av {
  text-align: center;
  border: solid grey 1px;
  padding: 10px;
  cursor: pointer;
}

.av:hover {
  background-color: #f5f5f5;
}
</style>