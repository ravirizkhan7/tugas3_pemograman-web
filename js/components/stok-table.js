// expects template with id tpl-stock-table
app.component("ba-stock-table", {
  template: "#tpl-stock-table",
  props: ["dataSource"],
  data() {
    return {
      stok: [],
      upbjjList: [],
      kategoriList: [],
      filters: { upbjj: "", kategori: "", stockMode: "all" },
      sortBy: "judul",
      modal: { show: false, item: null },
      newItem: {
        kode: "",
        judul: "",
        kategori: "MK Wajib",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
      },
      tooltip: null,
    };
  },
  created() {
    API.loadJSON(this.dataSource).then((j) => {
      this.upbjjList = j.upbjjList || [];
      this.kategoriList = j.kategoriList || [];
      this.stok = (j.stok || []).map((x) => Object.assign({}, x));
    });
  },
  computed: {
    displayed() {
      let out = this.stok.slice();
      if (this.filters.upbjj)
        out = out.filter((i) => i.upbjj === this.filters.upbjj);
      if (this.filters.kategori)
        out = out.filter((i) => i.kategori === this.filters.kategori);
      if (this.filters.stockMode === "below")
        out = out.filter((i) => i.qty < i.safety);
      if (this.filters.stockMode === "zero")
        out = out.filter((i) => i.qty === 0);

      // sort
      out.sort((a, b) => {
        if (this.sortBy === "judul") return a.judul.localeCompare(b.judul);
        if (this.sortBy === "qty") return b.qty - a.qty;
        if (this.sortBy === "harga") return b.harga - a.harga;
        return 0;
      });
      return out;
    },
  },
  watch: {
    "filters.upbjj"(nv) {
      // dependent: reset kategori when upbjj cleared
      if (!nv) this.filters.kategori = "";
    },
    stok: {
      handler(newVal) {
        // example watcher: save to localStorage so changes persist during dev
        localStorage.setItem("stok-sample", JSON.stringify(newVal));
      },
      deep: true,
    },
  },
  methods: {
    resetFilters() {
      this.filters = { upbjj: "", kategori: "", stockMode: "all" };
    },
    createItem() {
      // basic validation
      if (!this.newItem.judul) return alert("judul wajib");
      const kode = "NEW-" + Math.random().toString(36).slice(2, 7);
      const obj = Object.assign({ kode }, this.newItem);
      this.stok.push(obj);
      this.newItem = {
        kode: "",
        judul: "",
        kategori: "MK Wajib",
        upbjj: "",
        lokasiRak: "",
        harga: 0,
        qty: 0,
        safety: 0,
      };
    },
    editItem(item) {
      const newName = prompt("Edit judul", item.judul);
      if (newName !== null) item.judul = newName;
    },
    confirmDelete(item) {
      this.modal = { show: true, item };
    },
    doDelete(item) {
      const idx = this.stok.indexOf(item);
      if (idx > -1) this.stok.splice(idx, 1);
      this.modal = { show: false, item: null };
    },
    onQtyChange(item) {
      // watcher stok deep will pick this up
    },
    showTooltip(evt, html) {
      this.hideTooltip();
      const div = document.createElement("div");
      div.className = "tooltip";
      div.style.left = evt.pageX + 8 + "px";
      div.style.top = evt.pageY + 8 + "px";
      div.innerHTML = html || "—";
      document.body.appendChild(div);
      this.tooltip = div;
    },
    hideTooltip() {
      if (this.tooltip) {
        this.tooltip.remove();
        this.tooltip = null;
      }
    },
  },
});
