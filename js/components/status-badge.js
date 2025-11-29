// Component untuk menampilkan status badge

Vue.component("status-badge", {
  props: {
    qty: {
      type: Number,
      required: true,
    },
    safety: {
      type: Number,
      required: true,
    },
    catatan: {
      type: String,
      default: "",
    },
  },
  computed: {
    statusClass() {
      if (this.qty === 0) return "status-kosong";
      if (this.qty < this.safety) return "status-menipis";
      return "status-aman";
    },
    statusText() {
      if (this.qty === 0) return "Kosong";
      if (this.qty < this.safety) return "Menipis";
      return "Aman";
    },
    statusIcon() {
      if (this.qty === 0) return "⛔";
      if (this.qty < this.safety) return "⚠️";
      return "✅";
    },
  },
  template: `
        <div class="tooltip-container">
            <span :class="['status-badge', statusClass]">
                {{ statusIcon }} {{ statusText }}
            </span>
            <div class="tooltip-text" v-if="catatan" v-html="catatan"></div>
        </div>
    `,
});
