// Initialize Vue Application
new Vue({
  el: "#app",
  data: {
    activeTab: "stok",
    bahanAjarData: null,
    isLoading: true,
  },
  async created() {
    // Load data saat aplikasi dimulai
    this.bahanAjarData = await DataService.loadData();
    this.isLoading = false;
  },
});
