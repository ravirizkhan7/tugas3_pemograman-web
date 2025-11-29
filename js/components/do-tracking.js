// Component untuk tracking delivery order

Vue.component("do-tracking", {
  props: {
    initialData: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      trackingList: [],
      paketList: [],
      pengirimanList: [],
      stokList: [],

      // Search
      searchType: "do", // 'do' or 'nim'
      searchQuery: "",

      // Show results
      searchResults: [],
      showResults: false,

      // Add new DO
      showAddModal: false,
      showProgressModal: false,
      currentDO: null,

      // Form data
      formData: {
        nomorDO: "",
        nim: "",
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: "",
        total: 0,
      },

      // Progress form
      progressData: {
        waktu: "",
        keterangan: "",
      },

      formErrors: {},
    };
  },
  computed: {
    // Generate nomor DO otomatis
    nextDONumber() {
      const year = new Date().getFullYear();
      const existingDOs = this.trackingList.filter((t) =>
        t.nomorDO.startsWith(`DO${year}`)
      );
      const maxSeq =
        existingDOs.length > 0
          ? Math.max(
              ...existingDOs.map((t) => {
                const parts = t.nomorDO.split("-");
                return parseInt(parts[1]);
              })
            )
          : 0;

      const nextSeq = (maxSeq + 1).toString().padStart(3, "0");
      return `DO${year}-${nextSeq}`;
    },

    // Get paket details
    selectedPaketDetails() {
      if (!this.formData.paket) return null;

      const paket = this.paketList.find((p) => p.kode === this.formData.paket);
      if (!paket) return null;

      // Get detail bahan ajar
      const details = paket.isi.map((kode) => {
        const stok = this.stokList.find((s) => s.kode === kode);
        return stok ? `${stok.kode} - ${stok.judul}` : kode;
      });

      return {
        ...paket,
        details,
      };
    },
  },
  watch: {
    // Watcher untuk paket - update total harga
    "formData.paket"(newVal) {
      if (newVal) {
        const paket = this.paketList.find((p) => p.kode === newVal);
        if (paket) {
          this.formData.total = paket.harga;
        }
      }
    },
  },
  methods: {
    // Format tanggal
    formatTanggal(dateStr) {
      const date = new Date(dateStr);
      const months = [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ];

      return `${date.getDate()} ${
        months[date.getMonth()]
      } ${date.getFullYear()}`;
    },

    // Format harga
    formatHarga(harga) {
      return "Rp " + harga.toLocaleString("id-ID");
    },

    // Search DO
    handleSearch() {
      if (!this.searchQuery.trim()) {
        this.showResults = false;
        this.searchResults = [];
        return;
      }

      const query = this.searchQuery.toLowerCase().trim();

      if (this.searchType === "do") {
        this.searchResults = this.trackingList.filter((t) =>
          t.nomorDO.toLowerCase().includes(query)
        );
      } else {
        this.searchResults = this.trackingList.filter((t) =>
          t.nim.includes(query)
        );
      }

      this.showResults = true;
    },

    // Clear search (ESC key)
    clearSearch() {
      this.searchQuery = "";
      this.searchResults = [];
      this.showResults = false;
    },

    // Handle keyboard events
    handleSearchKeydown(e) {
      if (e.key === "Enter") {
        this.handleSearch();
      } else if (e.key === "Escape") {
        this.clearSearch();
      }
    },

    // Open add DO modal
    openAddModal() {
      this.formData = {
        nomorDO: this.nextDONumber,
        nim: "",
        nama: "",
        ekspedisi: "",
        paket: "",
        tanggalKirim: this.getCurrentDate(),
        total: 0,
      };
      this.formErrors = {};
      this.showAddModal = true;
    },

    // Close add modal
    closeAddModal() {
      this.showAddModal = false;
    },

    // Get current date
    getCurrentDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },

    // Get current datetime
    getCurrentDateTime() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },

    // Validate form
    validateForm() {
      this.formErrors = {};

      if (!this.formData.nim) {
        this.formErrors.nim = "NIM harus diisi";
      }

      if (!this.formData.nama) {
        this.formErrors.nama = "Nama harus diisi";
      }

      if (!this.formData.ekspedisi) {
        this.formErrors.ekspedisi = "Ekspedisi harus dipilih";
      }

      if (!this.formData.paket) {
        this.formErrors.paket = "Paket harus dipilih";
      }

      if (!this.formData.tanggalKirim) {
        this.formErrors.tanggalKirim = "Tanggal kirim harus diisi";
      }

      return Object.keys(this.formErrors).length === 0;
    },

    // Submit add DO form
    handleAddDO() {
      if (!this.validateForm()) {
        return;
      }

      const newDO = {
        nomorDO: this.formData.nomorDO,
        nim: this.formData.nim,
        nama: this.formData.nama,
        status: "Dalam Perjalanan",
        ekspedisi: this.formData.ekspedisi,
        tanggalKirim: this.formData.tanggalKirim,
        paket: this.formData.paket,
        total: this.formData.total,
        perjalanan: [
          {
            waktu: this.getCurrentDateTime(),
            keterangan: "Pesanan dibuat dan siap dikirim",
          },
        ],
      };

      this.trackingList.push(newDO);
      this.closeAddModal();

      // Auto search to show the new DO
      this.searchType = "do";
      this.searchQuery = newDO.nomorDO;
      this.handleSearch();
    },

    // Open progress modal
    openProgressModal(doItem) {
      this.currentDO = doItem;
      this.progressData = {
        waktu: this.getCurrentDateTime(),
        keterangan: "",
      };
      this.showProgressModal = true;
    },

    // Close progress modal
    closeProgressModal() {
      this.showProgressModal = false;
      this.currentDO = null;
    },

    // Add progress
    handleAddProgress() {
      if (!this.progressData.keterangan.trim()) {
        alert("Keterangan harus diisi");
        return;
      }

      const newProgress = {
        waktu: this.progressData.waktu,
        keterangan: this.progressData.keterangan,
      };

      this.currentDO.perjalanan.push(newProgress);
      this.closeProgressModal();
    },

    // Get ekspedisi name
    getEkspedisiName(kode) {
      const ekspedisi = this.pengirimanList.find((e) => e.kode === kode);
      return ekspedisi ? ekspedisi.nama : kode;
    },

    // Get paket name
    getPaketName(kode) {
      const paket = this.paketList.find((p) => p.kode === kode);
      return paket ? paket.nama : kode;
    },
  },
  created() {
    // Initialize data
    this.trackingList = [...this.initialData.tracking];
    this.paketList = [...this.initialData.paket];
    this.pengirimanList = [...this.initialData.pengirimanList];
    this.stokList = [...this.initialData.stok];
  },
  template: `
        <div>
            <!-- Search Box -->
            <div class="search-box">
                <h3 style="margin-bottom: 1rem;">Cari Tracking DO</h3>
                <div class="search-group">
                    <div class="filter-group">
                        <label>Cari Berdasarkan</label>
                        <select v-model="searchType">
                            <option value="do">Nomor DO</option>
                            <option value="nim">NIM</option>
                        </select>
                    </div>
                    
                    <div class="filter-group" style="flex: 2;">
                        <label>{{ searchType === 'do' ? 'Nomor DO' : 'NIM' }}</label>
                        <input 
                            v-model="searchQuery" 
                            type="text" 
                            :placeholder="searchType === 'do' ? 'Contoh: DO2025-001' : 'Contoh: 123456789'"
                            @keydown="handleSearchKeydown">
                    </div>
                    
                    <div class="filter-group">
                        <button @click="handleSearch" class="btn btn-primary">Cari</button>
                    </div>
                    
                    <div class="filter-group">
                        <button @click="clearSearch" class="btn btn-secondary">Reset</button>
                    </div>
                    
                    <div class="filter-group">
                        <button @click="openAddModal" class="btn btn-success">+ Tambah DO Baru</button>
                    </div>
                </div>
                <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #718096;">
                    <em>Tekan Enter untuk cari, Esc untuk reset</em>
                </div>
            </div>
            
            <!-- Search Results -->
            <div v-if="showResults">
                <div v-if="searchResults.length === 0" class="card">
                    <p style="text-align: center; color: #718096;">Tidak ada hasil yang ditemukan</p>
                </div>
                
                <div v-for="(item, index) in searchResults" :key="item.nomorDO" class="card">
                    <div class="card-header">
                        <div>
                            <div class="card-title">{{ item.nomorDO }}</div>
                            <div style="color: #718096; margin-top: 0.25rem;">
                                {{ item.nama }} ({{ item.nim }})
                            </div>
                        </div>
                        <div>
                            <span :class="['status-badge', item.status === 'Terkirim' ? 'status-aman' : 'status-menipis']">
                                {{ item.status }}
                            </span>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div>
                            <strong>Ekspedisi:</strong><br>
                            {{ getEkspedisiName(item.ekspedisi) }}
                        </div>
                        <div>
                            <strong>Tanggal Kirim:</strong><br>
                            {{ formatTanggal(item.tanggalKirim) }}
                        </div>
                        <div>
                            <strong>Paket:</strong><br>
                            {{ item.paket }} - {{ getPaketName(item.paket) }}
                        </div>
                        <div>
                            <strong>Total:</strong><br>
                            {{ formatHarga(item.total) }}
                        </div>
                    </div>
                    
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                            <h4>Perjalanan Paket</h4>
                            <button @click="openProgressModal(item)" class="btn btn-primary btn-small">
                                + Tambah Progress
                            </button>
                        </div>
                        
                        <div class="timeline">
                            <div v-for="(progress, pIndex) in item.perjalanan" :key="pIndex" class="timeline-item">
                                <div class="timeline-time">{{ progress.waktu }}</div>
                                <div class="timeline-desc">{{ progress.keterangan }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Add DO Modal -->
            <app-modal :show="showAddModal" title="Tambah Delivery Order Baru" @close="closeAddModal">
                <form @submit.prevent="handleAddDO">
                    <div class="form-group">
                        <label>Nomor DO</label>
                        <input v-model="formData.nomorDO" type="text" readonly style="background: #f7fafc;">
                        <div style="font-size: 0.875rem; color: #718096; margin-top: 0.25rem;">
                            <em>Tergenerate otomatis</em>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>NIM *</label>
                        <input v-model="formData.nim" type="text" placeholder="Contoh: 123456789">
                        <div class="form-error" v-if="formErrors.nim">{{ formErrors.nim }}</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Nama *</label>
                        <input v-model="formData.nama" type="text" placeholder="Contoh: Rina Wulandari">
                        <div class="form-error" v-if="formErrors.nama">{{ formErrors.nama }}</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Ekspedisi *</label>
                        <select v-model="formData.ekspedisi">
                            <option value="">Pilih Ekspedisi</option>
                            <option v-for="eks in pengirimanList" :key="eks.kode" :value="eks.kode">
                                {{ eks.nama }}
                            </option>
                        </select>
                        <div class="form-error" v-if="formErrors.ekspedisi">{{ formErrors.ekspedisi }}</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Paket Bahan Ajar *</label>
                        <select v-model="formData.paket">
                            <option value="">Pilih Paket</option>
                            <option v-for="paket in paketList" :key="paket.kode" :value="paket.kode">
                                {{ paket.kode }} - {{ paket.nama }}
                            </option>
                        </select>
                        <div class="form-error" v-if="formErrors.paket">{{ formErrors.paket }}</div>
                    </div>
                    
                    <div v-if="selectedPaketDetails" style="background: #f7fafc; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                        <strong>Isi Paket:</strong>
                        <ul style="margin-top: 0.5rem; margin-left: 1.5rem;">
                            <li v-for="(detail, idx) in selectedPaketDetails.details" :key="idx">
                                {{ detail }}
                            </li>
                        </ul>
                    </div>
                    
                    <div class="form-group">
                        <label>Tanggal Kirim *</label>
                        <input v-model="formData.tanggalKirim" type="date">
                        <div class="form-error" v-if="formErrors.tanggalKirim">{{ formErrors.tanggalKirim }}</div>
                    </div>
                    
                    <div class="form-group">
                        <label>Total Harga</label>
                        <input :value="formatHarga(formData.total)" type="text" readonly style="background: #f7fafc;">
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" @click="closeAddModal" class="btn btn-secondary">Batal</button>
                        <button type="submit" class="btn btn-success">Simpan DO</button>
                    </div>
                </form>
            </app-modal>
            
            <!-- Add Progress Modal -->
            <app-modal :show="showProgressModal" title="Tambah Status Progress" @close="closeProgressModal">
                <form @submit.prevent="handleAddProgress">
                    <div class="form-group">
                        <label>Waktu</label>
                        <input v-model="progressData.waktu" type="text" readonly style="background: #f7fafc;">
                    </div>
                    
                    <div class="form-group">
                        <label>Keterangan *</label>
                        <textarea v-model="progressData.keterangan" rows="3" 
                            placeholder="Contoh: Paket tiba di gudang sortir Jakarta"></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" @click="closeProgressModal" class="btn btn-secondary">Batal</button>
                        <button type="submit" class="btn btn-success">Tambah Progress</button>
                    </div>
                </form>
            </app-modal>
        </div>
    `,
});
