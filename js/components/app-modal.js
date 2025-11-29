// Component Modal untuk form input

Vue.component("app-modal", {
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      required: true,
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    handleEscape(e) {
      if (e.key === "Escape") {
        this.close();
      }
    },
  },
  mounted() {
    document.addEventListener("keydown", this.handleEscape);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.handleEscape);
  },
  template: `
        <div :class="['modal', {show: show}]" @click.self="close">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>{{ title }}</h2>
                    <span class="close" @click="close">&times;</span>
                </div>
                <div class="modal-body">
                    <slot></slot>
                </div>
            </div>
        </div>
    `,
});
