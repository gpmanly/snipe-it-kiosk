<template>
  <span></span>
</template>

<script>
export default {
  name: "KeyboardReader",
  data: () => ({
    clearInterval: null,
    text: "",
    index: -1,
    instance: null,
  }),
  props: {
    match: {
      type: RegExp,
      default: null,
    },
  },
  mounted: function () {
    let self = this;
    if (window.onkeypress == null) {
      window.onkeypresshandlers  = [];
      window.onkeypress = function (e) {
        Object.values(window.onkeypresshandlers ).forEach((h) => h(e));
      };
    }
    this.instance = function (e) {
      self.showAlert = false;
      self.$emit("startReading");
      if (e.key == "Enter" && self.match == null) {
        clearInterval(self.clearInterval);
        self.$emit("read", self.text);
        self.text = "";
      } else {
        self.text += e.key;
        if (self.match != null) {
          if (!self.text.match(self.match)) {
            console.log("Clearing");
            self.text = "";
          } else {
            self.$emit("read", self.text);
            self.text = "";
          }
          clearInterval(self.clearInterval);
        }
        console.log(self.text);
        self.setClearInterval();
      }
    };
    this.index = window.onkeypresshandlers.push(this.instance) - 1;
  },
  beforeDestroy: function () {
    console.log(
      "Destroying",
      this.match,
      this.index,
      window.onkeypresshandlers.indexOf(this.instance)
    );
    window.onkeypresshandlers.splice(
      window.onkeypresshandlers.indexOf(this.instance),
      1
    );
    if (window.onkeypresshandlers.length == 0) {
      window.onkeypress = null;
    }
    clearInterval(this.clearInterval);
  },
  methods: {
    setClearInterval: function () {
      let self = this;
      clearInterval(this.clearInterval);
      this.clearInterval = setInterval(() => (self.text = ""), 2000);
    },
  },
};
</script>

<style lang="scss" scoped></style>
