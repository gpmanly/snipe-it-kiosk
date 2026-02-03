<template>
  <b-container class="text-center mt-5">
    <h1>Credentials-Generator</h1>

    <div v-if="!this.badgeScanned" class="card p-4 mt-4">
      <h3>Step 1: Scan Badge</h3>
      <p class="text-muted">
        Please scan an RFID badge to create a credential file
      </p>
      <b-icon-person-badge
        class="login-icon mt-4 mb-4"
        style="font-size: 3rem"
      />
      <KeyboardReader @read="this.scanBadge" />
    </div>

    <div
      v-else-if="this.badgeScanned && !this.apiKeyEntered"
      class="card p-4 mt-4"
    >
      <h3>Step 2: Enter API Key</h3>
      <p class="text-muted mb-3">
        Badge ID: <code>{{ this.badgeId }}</code>
      </p>

      <div class="form-group">
        <label for="apiKeyInput"><strong>Snipe-IT API Key:</strong></label>
        <textarea
          id="apiKeyInput"
          v-model="apiKey"
          class="form-control"
          rows="4"
          placeholder="Paste the API key from Snipe-IT here"
          autofocus
        ></textarea>
      </div>

      <div class="mt-3">
        <button
          @click="this.createCredential"
          class="btn btn-success mr-2"
          :disabled="!this.apiKey.trim() || this.loading"
        >
          <b-spinner small v-if="this.loading" class="mr-2"></b-spinner>
          {{ this.loading ? "Creating..." : "Create Credential File" }}
        </button>
        <button @click="this.resetForm" class="btn btn-secondary">
          Cancel
        </button>
      </div>
    </div>

    <div v-else-if="this.error" class="alert alert-danger mt-4">
      <strong>Error:</strong> {{ this.error }}
      <button
        @click="this.resetForm"
        class="btn btn-sm btn-outline-danger mt-2"
      >
        Start Over
      </button>
    </div>

    <div v-else-if="this.success" class="alert alert-success mt-4">
      <h4>✓ Success!</h4>
      <p>Credential file created:</p>
      <code class="d-block my-3">{{ this.keyResult }}</code>
      <p class="text-muted">
        <small>File saved in keys folder with API key as content</small>
      </p>
      <button @click="this.resetForm" class="btn btn-sm btn-success mt-3">
        Create Another
      </button>
    </div>

    <div class="mt-5">
      <Button
        v-if="this.$store.state.loggedIn"
        variant="primary"
        href="/"
        shortcut="b"
      >
        Back
      </Button>
      <Button v-else variant="primary" href="/" shortcut="l">
        Login
      </Button>
    </div>
  </b-container>
</template>

<script>
import sha512 from "js-sha512";
import axios from "axios";
import Button from "../components/Button.vue";
import KeyboardReader from "@/components/KeyboardReader.vue";

export default {
  components: { Button, KeyboardReader },
  name: "Generator",
  data: () => ({
    badgeId: null,
    badgeScanned: false,
    apiKey: "",
    apiKeyEntered: false,
    keyResult: null,
    loading: false,
    error: null,
    success: false,
    keySalt: "",
  }),
  async mounted() {
    // Load keySalt directly from config file
    try {
      const response = await fetch("../config.json");
      if (response.ok) {
        const config = await response.json();
        this.keySalt = config.keySalt || "";
      }
    } catch (e) {
      console.error("Failed to load config:", e);
      this.keySalt = "";
    }
  },
  methods: {
    scanBadge: function (resp) {
      try {
        if (resp === "ERROR") {
          this.error = "Failed to read badge. Please try again.";
          return;
        }

        this.badgeId = resp;
        this.badgeScanned = true;
        this.error = null;
      } catch (e) {
        console.error("Error in scanBadge:", e);
      }
    },

    createCredential: async function () {
      try {
        if (!this.apiKey.trim()) {
          this.error = "Please enter an API key.";
          return;
        }

        this.loading = true;
        this.error = null;
        this.success = false;

        // Hash the badge ID to create filename
        const hashedId = sha512(this.badgeId + this.keySalt);

        // Send to server to create the credential file
        await axios.post("/api/credentials/generate", {
          credentialId: hashedId,
          badgeId: this.badgeId,
          apiKey: this.apiKey.trim(),
        });

        this.keyResult = hashedId;
        this.apiKeyEntered = true;
        this.success = true;
        this.loading = false;

        // Reset after 5 seconds for next scan
        setTimeout(() => {
          this.resetForm();
        }, 5000);
      } catch (error) {
        this.loading = false;
        this.error =
          error.response?.data?.error ||
          "Failed to create credential file. Check server logs.";
        console.error("Error creating credential:", error);
      }
    },

    resetForm() {
      this.badgeId = null;
      this.badgeScanned = false;
      this.apiKey = "";
      this.apiKeyEntered = false;
      this.keyResult = null;
      this.loading = false;
      this.error = null;
      this.success = false;
    },
  },
};
</script>

<style scoped>
.login-icon {
  color: #007bff;
}

.card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

code {
  background-color: #f4f4f4;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
  font-size: 0.9rem;
}

.alert {
  margin-top: 2rem;
  padding: 1.5rem;
}

textarea {
  font-family: monospace;
  font-size: 0.9rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  font-weight: 500;
}
</style>