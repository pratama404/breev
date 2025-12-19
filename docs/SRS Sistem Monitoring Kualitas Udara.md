# **Software Requirements Specification (SRS)**

## **Perancangan Sistem Monitoring dan Prediksi Indeks Kualitas Udara (AQI) Berbasis IoT**

**Versi:** 1.0

**Tanggal:** 10 Desember 2025

**Disiapkan untuk:** Tim Pengembang Teknis dan Pemangku Kepentingan Proyek

**Status Dokumen:** Final Draft \- Siap untuk Implementasi

## ---

**1\. Pendahuluan (Introduction)**

### **1.1 Tujuan (Purpose)**

Dokumen Spesifikasi Kebutuhan Perangkat Lunak (SKPL) ini disusun untuk mendefinisikan secara komprehensif, teknis, dan mengikat mengenai arsitektur, fungsionalitas, dan batasan operasional dari proyek "Perancangan Sistem Monitoring dan Prediksi Indeks Kualitas Udara (AQI) Berbasis IoT". Dokumen ini berfungsi sebagai kontrak teknis utama antara tim pengembang, manajer proyek, dan pemangku kepentingan, yang merinci spesifikasi sistem *end-to-end* mulai dari lapisan fisik (sensor IoT) hingga lapisan aplikasi (Web Dashboard).

Tujuan utama dari dokumen ini adalah untuk menghilangkan ambiguitas dalam pengembangan sistem yang kompleks ini. Mengingat sifat proyek yang multidisiplin—menggabungkan teknik instrumentasi elektronik, protokol komunikasi jaringan, rekayasa data *backend*, kecerdasan buatan berbasis fisika (*Physics-Informed Machine Learning*), dan pengembangan antarmuka web modern—dokumen ini dirancang untuk memberikan panduan yang presisi bagi setiap spesialis yang terlibat. Bagi perekayasa perangkat keras, dokumen ini menetapkan standar kalibrasi dan frekuensi transmisi data sensor MQ135 dan DHT22. Bagi perekayasa data, dokumen ini menguraikan skema penyimpanan MongoDB dan aliran data MQTT. Bagi pengembang *Machine Learning*, dokumen ini menjelaskan integrasi model AirPhyNet yang berbasis pada persamaan adveksi-difusi. Terakhir, bagi pengembang web, dokumen ini menetapkan kebutuhan antarmuka pengguna berbasis Next.js dan Vercel serta integrasi pemindaian QR Code dan visualisasi Grafana.1

### **1.2 Cakupan Produk (Product Scope)**

Sistem ini dirancang sebagai solusi terpadu untuk pemantauan kualitas udara dalam ruangan (*indoor air quality monitoring*) yang proaktif dan prediktif. Berbeda dengan sistem konvensional yang hanya menampilkan data saat ini, produk ini mengintegrasikan model prediksi untuk memberikan peringatan dini mengenai potensi penurunan kualitas udara, memungkinkan intervensi ventilasi sebelum kondisi menjadi berbahaya bagi kesehatan penghuni.

Lingkup produk mencakup komponen-komponen berikut:

1. **Node Sensor Cerdas (IoT Edge):** Perangkat keras berbasis ESP32 yang mengelola akuisisi data dari sensor gas MQ135 (CO₂, NOx, Alkohol, Benzena, Asap) dan sensor lingkungan DHT22 (Suhu, Kelembaban). Node ini bertanggung jawab atas pra-pemrosesan sinyal analog dan transmisi data telemetri melalui protokol MQTT.  
2. **Infrastruktur Makelar Pesan (Message Broker):** Implementasi *cluster* EMQX yang berperan sebagai tulang punggung komunikasi *real-time*, menangani ribuan pesan per detik dengan latensi rendah untuk menghubungkan perangkat IoT dengan layanan *backend*.  
3. **Orkestrasi Aliran Data (Data Orchestration):** Penggunaan Node-RED sebagai *middleware* untuk menormalisasi data, validasi integritas paket, dan perutean data menuju basis data serta layanan prediksi.  
4. **Inteligensi Prediktif (AirPhyNet):** Layanan komputasi yang menjalankan model *Physics-Guided Neural Network* (AirPhyNet). Model ini menggabungkan data sensor *time-series* dengan persamaan diferensial parsial adveksi dan difusi untuk memprediksi penyebaran polutan di dalam ruangan, menghasilkan estimasi AQI untuk interval waktu masa depan (t+1 jam hingga t+6 jam).  
5. **Penyimpanan Data Skala Besar:** Implementasi MongoDB sebagai basis data NoSQL berorientasi dokumen yang dioptimalkan untuk penulisan data sensor bervolume tinggi (*write-heavy workload*) dan penyimpanan riwayat jangka panjang.  
6. **Antarmuka Pengguna Web & PWA:** Aplikasi web progresif yang dibangun di atas kerangka kerja Next.js dan di-*hosting* pada infrastruktur *serverless* Vercel, menyediakan dasbor interaktif bagi pengguna akhir.  
7. **Sistem Akses Berbasis Lokasi (QR Code):** Mekanisme identifikasi ruangan berbasis QR Code yang memungkinkan pengguna memindai kode fisik di lokasi untuk mengakses data kualitas udara spesifik ruangan tersebut secara instan tanpa navigasi manual.  
8. **Analitik Lanjutan (Grafana Integration):** Integrasi panel visualisasi Grafana untuk kebutuhan analisis mendalam oleh administrator, termasuk pemantauan kesehatan perangkat dan tren anomali jangka panjang.

### **1.3 Definisi, Akronim, dan Singkatan**

Untuk memastikan kesamaan pemahaman teknis di seluruh tim pengembang yang mungkin memiliki latar belakang berbeda, berikut adalah definisi operasional dari istilah-istilah kunci yang digunakan dalam dokumen ini:

| Istilah | Definisi Teknis |
| :---- | :---- |
| **AQI (Air Quality Index)** | Indeks numerik yang digunakan untuk mengomunikasikan seberapa tercemar udara saat ini atau seberapa tercemar udara diperkirakan di masa depan. Skala biasanya berkisar dari 0 hingga 500\. 1 |
| **AirPhyNet** | *Air Quality Physical-Informed Neural Network*. Sebuah arsitektur *Deep Learning* hibrida yang membatasi ruang pencarian solusi model saraf dengan hukum fisika fluida (persamaan adveksi-difusi) untuk meningkatkan akurasi prediksi pada data yang jarang (*sparse data*). |
| **Adveksi** | Transportasi zat (polutan) oleh gerakan massal fluida (aliran udara). Dalam konteks ini, perpindahan polutan yang disebabkan oleh ventilasi atau AC. |
| **Difusi** | Penyebaran partikel polutan dari daerah konsentrasi tinggi ke konsentrasi rendah akibat gerak termal acak partikel. |
| **MQTT (Message Queuing Telemetry Transport)** | Protokol konektivitas *machine-to-machine* (M2M) berbasis standar ISO (ISO/IEC 20922\) yang berjalan di atas TCP/IP, dirancang untuk lokasi terpencil dengan *bandwidth* jaringan terbatas. 1 |
| **Broker (EMQX)** | Server pusat dalam arsitektur MQTT yang menerima semua pesan dari klien penerbit (sensor) dan kemudian merutekan pesan tersebut ke klien pelanggan yang sesuai (aplikasi web/backend). |
| **ESP32** | Seri *System on a Chip* (SoC) mikrokontroler berbiaya rendah dan berdaya rendah dengan Wi-Fi dan Bluetooth mode ganda terintegrasi. |
| **Next.js** | Kerangka kerja pengembangan web React sumber terbuka yang memfasilitasi fungsionalitas seperti *server-side rendering* (SSR) dan pembuatan situs web statis. |
| **PWA (Progressive Web App)** | Aplikasi web yang menggunakan kemampuan web modern untuk memberikan pengalaman seperti aplikasi asli pada perangkat seluler. |
| **SaaS/PaaS** | *Software as a Service / Platform as a Service*. Model penyediaan layanan komputasi awan. |

### **1.4 Referensi (References)**

Penyusunan dokumen ini mengacu pada sumber data, standar industri, dan dokumentasi teknis berikut untuk memastikan validitas metodologis dan kepatuhan terhadap praktik terbaik rekayasa perangkat lunak:

1. *IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications*. Institute of Electrical and Electronics Engineers. 2  
2. Dokumen "B-4\_SRS-SAD2025: Software Requirements Specification Breev Air Quality App Versi 1.1". UIN Sunan Ampel Surabaya, 2025\. (Sebagai referensi struktur fitur aplikasi kualitas udara dan parameter kesehatan). 1  
3. Dokumen "Ageng \[ind\] srs-ieee.docx: Software Requirements Specification for Apps Carbon Track Version 1.0". UINSA, 2025\. (Sebagai referensi standar penulisan SRS dan definisi kelas pengguna). 2  
4. Dokumentasi Teknis Sensor Hanwei Electronics untuk MQ-135 Gas Sensor.  
5. Dokumentasi Teknis Aosong Electronics untuk DHT22 (AM2302) Temperature & Humidity Sensor.  
6. *OASIS Standard MQTT Version 5.0*.  
7. Dokumentasi Resmi Next.js, MongoDB, dan EMQX.

### **1.5 Tinjauan Dokumen (Overview)**

Dokumen ini disusun secara sistematis untuk memandu pembaca dari konsep umum hingga detail teknis implementasi. Bagian 2 (Deskripsi Keseluruhan) memberikan konteks operasional sistem, karakteristik pengguna, dan batasan lingkungan. Bagian 3 (Pengumpulan Kebutuhan) menjelaskan metodologi riset dan analisis kesenjangan (*gap analysis*). Bagian 4 dan 5 merinci Kebutuhan Fungsional dan Non-Fungsional secara granular. Bagian 6 menguraikan Fitur Sistem dari perspektif pengguna. Bagian 7 menyajikan Desain Sistem melalui diagram UML lengkap, dan Bagian 8 menjelaskan struktur Repositori Kode. Struktur ini diadopsi untuk memfasilitasi pemahaman lintas disiplin ilmu antar anggota tim.

## ---

**2\. Deskripsi Keseluruhan (Overall Description)**

### **2.1 Perspektif Produk (Product Perspective)**

Dalam lanskap teknologi lingkungan saat ini, terdapat kesenjangan signifikan antara sistem pemantauan udara skala makro (kota/regional) dan skala mikro (ruangan/gedung). Stasiun pemantauan pemerintah memberikan data kualitas udara luar ruangan, namun manusia modern menghabiskan sekitar 90% waktunya di dalam ruangan di mana konsentrasi polutan bisa 2 hingga 5 kali lebih tinggi daripada di luar ruangan. Sistem "Monitoring dan Prediksi AQI Berbasis IoT" ini dikembangkan untuk mengisi kekosongan tersebut.

Sistem ini beroperasi sebagai entitas mandiri namun terhubung, yang terdiri dari subsistem perangkat keras yang didistribusikan secara fisik dan subsistem perangkat lunak yang terpusat di *cloud*. Perspektif produk dapat dilihat dari tiga lapisan interaksi:

1. **Lapisan Persepsi (Perception Layer):** Terdiri dari node sensor otonom yang ditempatkan di setiap ruangan. Node ini tidak hanya pasif mengirim data, tetapi juga melakukan pemfilteran sinyal dasar sebelum transmisi untuk mengurangi beban jaringan.  
2. **Lapisan Jaringan & Transportasi (Network Layer):** Menggunakan protokol MQTT yang sangat ringan. Pemilihan MQTT dibandingkan HTTP didasarkan pada kebutuhan efisiensi daya pada mikrokontroler dan keandalan pengiriman paket pada kondisi jaringan Wi-Fi yang mungkin tidak stabil di lingkungan gedung bertingkat.  
3. **Lapisan Aplikasi & Analitik (Application Layer):** Berbeda dengan aplikasi pemantau biasa yang hanya menampilkan grafik, sistem ini memiliki "otak" berupa model AirPhyNet. Model ini mensimulasikan dinamika fluida udara secara virtual untuk memprediksi ke arah mana polusi akan menyebar dan berapa konsentrasinya di masa depan, memberikan nilai tambah strategis bagi pengguna.

Sistem ini menggantikan proses manual pengecekan kondisi ruangan atau asumsi subjektif mengenai kenyamanan udara, mengubahnya menjadi keputusan berbasis data kuantitatif yang presisi. Integrasi dengan platform Vercel menjamin ketersediaan tinggi (*high availability*) dan latensi akses global bagi antarmuka pengguna, sementara integrasi Grafana menyediakan kedalaman analitik bagi tim operasional fasilitas.

### **2.2 Fungsi Produk (Product Functions)**

Sistem ini menyediakan serangkaian fungsi terintegrasi yang dirancang untuk siklus hidup pemantauan kualitas udara yang lengkap:

* **Akuisisi Data Multi-Parameter:** Secara simultan mengukur konsentrasi gas berbahaya (diwakili oleh resistansi sensor MQ135 terhadap berbagai gas VOC) serta parameter termal (Suhu dan Kelembaban) yang mempengaruhi kenyamanan dan laju reaksi kimia di udara.  
* **Transmisi Telemetri Real-Time:** Mengirimkan paket data sensor secara *real-time* ke server pusat dengan mekanisme *publish-subscribe* yang efisien.  
* **Prediksi Berbasis Fisika:** Melakukan komputasi prediksi AQI masa depan dengan mempertimbangkan data historis dan hukum fisika penyebaran gas, memberikan wawasan proaktif.  
* **Identifikasi Lokasi Cepat (QR Scanning):** Menghubungkan dunia fisik dan digital melalui QR Code, memungkinkan pengguna mengakses data spesifik lokasi secara instan tanpa navigasi menu yang rumit.  
* **Manajemen Perangkat Terpusat:** Memungkinkan administrator untuk mendaftarkan, mengonfigurasi, dan memantau status kesehatan armada sensor dari satu dasbor terpadu.  
* **Visualisasi & Pelaporan:** Menyajikan data dalam bentuk grafik interaktif, indikator visual (warna peringatan), dan laporan historis melalui integrasi Grafana.

### **2.3 Golongan dan Karakteristik Pengguna (User Classes and Characteristics)**

Berdasarkan analisis kebutuhan yang mendalam, sistem ini melayani tiga kategori pengguna utama dengan profil psikografis dan kebutuhan fungsional yang berbeda:

#### **2.3.1 Pengguna Umum (Building Occupant/Visitor)**

* **Profil:** Pegawai kantor, mahasiswa, atau penghuni gedung yang berada di lokasi. Mereka umumnya tidak memiliki latar belakang teknis mendalam tentang IoT atau kimia atmosfer.  
* **Motivasi:** Peduli akan kenyamanan dan kesehatan pribadi. Ingin memastikan ruangan yang mereka tempati aman dari risiko penularan penyakit via udara (terkait ventilasi) atau polutan penyebab *Sick Building Syndrome*.  
* **Pola Interaksi:** Intermiten dan berbasis lokasi. Mereka berinteraksi dengan sistem terutama melalui pemindaian QR Code saat akan memasuki ruangan atau melalui tampilan dasbor publik di layar lobi.  
* **Kebutuhan Utama:** Informasi instan yang mudah dipahami (misal: "Aman" / "Tidak Aman"), indikator warna yang jelas, dan rekomendasi tindakan sederhana (misal: "Buka Jendela"). 1

#### **2.3.2 Administrator Fasilitas (Facility Manager/Admin)**

* **Profil:** Staf teknis atau manajer operasional gedung yang bertanggung jawab atas infrastruktur dan kenyamanan lingkungan kerja. Memiliki literasi teknologi yang baik.  
* **Motivasi:** Menjaga kepatuhan terhadap standar kesehatan lingkungan kerja, mengoptimalkan penggunaan energi (HVAC), dan memastikan seluruh sensor berfungsi normal.  
* **Pola Interaksi:** Rutin dan mendalam. Menggunakan sistem melalui *desktop* untuk memantau dasbor Grafana, mengelola inventaris sensor, dan men-*generate* QR Code untuk ruangan baru.  
* **Kebutuhan Utama:** Stabilitas sistem, notifikasi jika ada sensor *offline*, kemampuan manajemen data massal, dan visualisasi tren makro seluruh gedung.

#### **2.3.3 Peneliti Lingkungan / Data Scientist (Secondary User)**

* **Profil:** Akademisi atau analis data yang menggunakan data sistem untuk studi jangka panjang atau kalibrasi model.  
* **Motivasi:** Memvalidasi akurasi model AirPhyNet, mempelajari pola polusi jam sibuk, dan korelasi antara suhu dan emisi VOC.  
* **Pola Interaksi:** Analitis dan berorientasi *batch*. Mengakses data mentah atau laporan historis.  
* **Kebutuhan Utama:** Akses ke data granular, kemampuan ekspor data, dan transparansi metrik model ML. 2

### **2.4 Lingkungan Operasi (Operating Environment)**

Sistem harus beroperasi dengan andal dalam lingkungan yang heterogen dengan spesifikasi sebagai berikut:

* **Lingkungan Perangkat Keras (Node IoT):**  
  * Catu Daya: 5V DC via USB (harus stabil).  
  * Suhu Operasional: 0°C hingga 50°C.  
  * Konektivitas: Wi-Fi 802.11 b/g/n pada frekuensi 2.4 GHz (ESP32 tidak mendukung 5 GHz). Sinyal RSSI minimal \-80 dBm disarankan untuk stabilitas MQTT.  
* **Lingkungan Server (Backend):**  
  * Arsitektur: Kontainerisasi (Docker) atau *Serverless Functions*.  
  * OS: Linux (Ubuntu/Debian) untuk *deployment* Docker (EMQX, MongoDB, Node-RED, Grafana).  
  * Runtime: Node.js v18+ (LTS) untuk backend kustom dan AirPhyNet Service (Python 3.9+).  
* **Lingkungan Klien (Frontend):**  
  * Browser: Kompatibilitas penuh dengan Chrome (v90+), Firefox (v88+), Safari (v14+), dan Edge (v90+).  
  * Perangkat: Responsif pada *Mobile* (Android/iOS), Tablet, dan Desktop.

### **2.5 Batasan Desain dan Implementasi (Design and Implementation Constraints)**

Pengembangan sistem dibatasi oleh faktor-faktor teknis dan regulasi berikut:

1. **Keterbatasan Sensor MQ135:** Sensor ini adalah tipe *Metal Oxide Semiconductor* (MOS) yang memerlukan pemanas internal. Hal ini menyebabkan konsumsi daya yang relatif tinggi (sekitar 800mW), sehingga perangkat tidak dapat dioperasikan hanya dengan baterai kecil untuk jangka panjang; harus menggunakan adaptor listrik. Selain itu, sensor ini memerlukan waktu "pre-heat" minimal 24 jam sebelum penggunaan pertama untuk menstabilkan pembacaan kimiawi.  
2. **Konektivitas Jaringan:** ESP32 sangat bergantung pada ketersediaan Wi-Fi. Sistem harus dirancang dengan mekanisme *store-and-forward* (penyimpanan lokal sementara) atau *reconnection logic* yang kuat jika koneksi terputus, agar data tidak hilang.  
3. **Hukum Fisika Model AirPhyNet:** Model prediksi berbasis adveksi-difusi memerlukan parameter batas (*boundary conditions*) yang akurat. Akurasi prediksi akan menurun jika ada faktor eksternal yang tidak terukur secara drastis (misal: seseorang menyemprotkan parfum tepat di depan sensor), yang menciptakan *outlier* mendadak yang tidak sesuai dengan pola difusi alami.  
4. **Regulasi Frekuensi:** Penggunaan modul Wi-Fi harus mematuhi regulasi spektrum frekuensi radio di Indonesia (Postel/Kominfo), meskipun penggunaan frekuensi 2.4 GHz ISM band umumnya bebas lisensi.  
5. **Batasan Protokol MQTT:** Pesan MQTT dibatasi ukurannya oleh konfigurasi broker (default EMQX biasanya 1MB), namun payload data sensor sangat kecil (JSON \< 1KB), sehingga ini bukan masalah utama, namun frekuensi pengiriman (misal: 1 detik sekali) dapat membebani *bandwidth* jika jumlah sensor mencapai ribuan.

## ---

**3\. Pengumpulan Kebutuhan (Requirements Gathering)**

### **3.1 Strategi Pengumpulan Data**

Sesuai dengan praktik terbaik rekayasa perangkat lunak 1, proses pengumpulan kebutuhan dilakukan melalui pendekatan campuran (*mixed-methods*) yang meliputi studi literatur terhadap dokumen spesifikasi produk sejenis (seperti Breev App dan Carbon Track) dan analisis teknis terhadap komponen perangkat keras yang digunakan. Fokus utama adalah mengidentifikasi parameter fisik yang relevan untuk kualitas udara dan memetakan alur data yang optimal dari sensor hingga antarmuka pengguna.

Analisis terhadap dokumen referensi "Breev App" 1 memberikan wawasan krusial mengenai kebutuhan pengguna akan rekomendasi kesehatan (misal: penggunaan masker) dan klasifikasi AQI. Sementara itu, referensi "Carbon Track" 2 memberikan kerangka kerja yang kuat untuk struktur dokumentasi IEEE dan definisi karakteristik pengguna, yang diadopsi ke dalam struktur dokumen ini untuk menjamin profesionalitas dan kelengkapan.

### **3.2 Analisis Kesenjangan (As-Is vs To-Be)**

#### **3.2.1 Kondisi Saat Ini (As-Is)**

Dalam skenario operasional saat ini di sebagian besar gedung atau ruangan:

* **Monitoring:** Tidak ada visibilitas mengenai kualitas udara. Penghuni tidak menyadari adanya akumulasi CO₂ yang tinggi yang menyebabkan kantuk dan penurunan produktivitas, atau keberadaan VOC dari cat dinding/perabot baru.  
* **Deteksi:** Hanya mengandalkan indra penciuman manusia yang tidak sensitif terhadap gas tidak berbau seperti CO₂ atau CO dalam konsentrasi rendah.  
* **Akses Informasi:** Jika ada alat ukur portabel, data hanya bisa dilihat di layar alat tersebut. Tidak ada riwayat data, tidak ada akses jarak jauh, dan tidak ada agregasi data antar ruangan.  
* **Mitigasi:** Tindakan (seperti membuka jendela) bersifat reaktif, dilakukan hanya setelah penghuni merasa pengap atau sakit.

#### **3.2.2 Kondisi Yang Diharapkan (To-Be)**

Sistem yang diusulkan akan mentransformasi kondisi tersebut menjadi:

* **Monitoring:** Pemantauan kontinu 24/7. Data dikirim setiap interval tertentu (misal: 30 detik) ke *cloud*.  
* **Deteksi:** Sensor presisi mendeteksi perubahan PPM gas dan parameter lingkungan.  
* **Akses Informasi:** Data terdemokratisasi. Siapapun dengan *smartphone* dapat memindai QR Code di pintu untuk melihat kondisi udara di dalam sebelum masuk. Admin dapat melihat status seluruh gedung dari satu layar.  
* **Mitigasi:** Sistem prediktif AirPhyNet memberikan peringatan dini (*early warning*). "Prediksi AQI akan memburuk dalam 30 menit, sarankan nyalakan ventilasi sekarang." Tindakan menjadi preventif.

### **3.3 Identifikasi Kebutuhan Parameter**

Berdasarkan spesifikasi sensor dan kebutuhan model ML:

1. **MQ135:** Menghasilkan sinyal analog yang berkorelasi dengan resistansi sensor ($R\_s$). Rasio $R\_s/R\_o$ (dimana $R\_o$ adalah resistansi pada udara bersih) digunakan untuk menghitung konsentrasi gas dalam PPM. Target gas: Karbon Dioksida (CO₂), Amonia, Benzena, Alkohol, Asap.  
2. **DHT22:** Menghasilkan sinyal digital berisi data suhu (akurasi ±0.5°C) dan kelembaban (akurasi ±2-5% RH). Data ini penting karena sensitivitas MQ135 dipengaruhi oleh suhu dan kelembaban, sehingga diperlukan kompensasi nilai pembacaan.

## ---

**4\. Kebutuhan Fungsional (Functional Requirements)**

### **4.1 Modul IoT & Akuisisi Data (Edge Layer)**

**REQ-F.01: Inisialisasi dan Pembacaan Sensor**

* **REQ-F.01.1:** Mikrokontroler ESP32 harus melakukan inisialisasi koneksi sensor MQ135 pada pin analog (ADC) dan DHT22 pada pin digital GPIO saat *booting*.  
* **REQ-F.01.2:** Sistem harus membaca data tegangan keluaran sensor MQ135 dan mengonversinya menjadi nilai resistansi sensor ($R\_s$).  
* **REQ-F.01.3:** Sistem harus mengaplikasikan algoritma kalibrasi dasar dengan membandingkan $R\_s$ dengan nilai basis $R\_o$ (udara bersih) untuk mengestimasi kadar polutan dalam satuan PPM (*Parts Per Million*) menggunakan pendekatan kurva logaritmik sesuai *datasheet*.  
* **REQ-F.01.4:** Sistem harus membaca data suhu dan kelembaban dari DHT22 dengan interval sampling minimal 2 detik (batas fisik sensor).

**REQ-F.02: Konektivitas dan Transmisi MQTT**

* **REQ-F.02.1:** Perangkat harus memiliki kemampuan *auto-connect* ke jaringan Wi-Fi yang telah dikonfigurasi dalam kode *firmware*.  
* **REQ-F.02.2:** Perangkat harus membangun koneksi TCP/IP persisten ke *Broker* EMQX pada port standar 1883 atau port aman 8883 (SSL/TLS).  
* **REQ-F.02.3:** Perangkat harus mempublikasikan (*publish*) paket data telemetri ke topik MQTT dengan struktur hierarki: aqi/sensor/{sensor\_id}/telemetry.  
* **REQ-F.02.4:** Payload data harus diformat dalam JSON standar:  
  JSON  
  {  
    "sensor\_id": "ESP32\_A101",  
    "timestamp": 1678889900,  
    "temperature": 28.5,  
    "humidity": 60.2,  
    "mq135\_raw": 1024,  
    "co2\_ppm": 450.5,  
    "aqi\_calculated": 45  
  }

* **REQ-F.02.5:** Sistem harus menggunakan QoS Level 1 (*At least once*) untuk memastikan data sampai ke broker.

### **4.2 Modul Pemrosesan & Penyimpanan Data (Backend Layer)**

**REQ-F.03: Alur Kerja Node-RED**

* **REQ-F.03.1:** Node-RED harus bertindak sebagai *subscriber* aktif untuk topik *wildcard* aqi/sensor/+/telemetry.  
* **REQ-F.03.2:** Sistem harus melakukan validasi struktur JSON. Data yang tidak lengkap atau korup harus dibuang dan dicatat dalam log *error*.  
* **REQ-F.03.3:** Sistem harus menyisipkan *metadata* tambahan jika diperlukan (misal: waktu server) sebelum penyimpanan.  
* **REQ-F.03.4:** Node-RED harus merutekan data tervalidasi ke node penyimpanan MongoDB.

**REQ-F.04: Manajemen Database MongoDB**

* **REQ-F.04.1:** Basis data harus menyimpan data dalam koleksi sensor\_logs dengan skema yang fleksibel namun terindeks berdasarkan sensor\_id dan timestamp untuk mempercepat kueri grafik historis.  
* **REQ-F.04.2:** Basis data harus memiliki koleksi devices untuk menyimpan metadata sensor (Lokasi, Nama Ruangan, Tanggal Instalasi, ID QR Code).

**REQ-F.05: Prediksi Cerdas (AirPhyNet Service)**

* **REQ-F.05.1:** Sistem harus memicu layanan prediksi secara berkala (misal: setiap 10 menit) atau *event-based*.  
* **REQ-F.05.2:** Model AirPhyNet harus mengambil input sekuens data historis (window size $t-n$ sampai $t$) dan memprosesnya melalui lapisan LSTM yang dipandu oleh persamaan fisika.  
* **REQ-F.05.3:** Persamaan adveksi-difusi: $\\frac{\\partial C}{\\partial t} \+ \\nabla \\cdot (uC) \= \\nabla \\cdot (D \\nabla C) \+ S$, dimana $C$ adalah konsentrasi, $u$ kecepatan angin (adveksi), $D$ koefisien difusi, dan $S$ sumber polutan, harus diintegrasikan sebagai *regularization term* dalam fungsi kerugian (*loss function*) model untuk memastikan prediksi yang konsisten secara fisik.  
* **REQ-F.05.4:** Hasil prediksi (AQI masa depan) harus disimpan kembali ke koleksi predictions di MongoDB.

### **4.3 Modul Antarmuka Pengguna (Frontend Layer)**

**REQ-F.06: Dashboard Web Next.js**

* **REQ-F.06.1:** Aplikasi harus memiliki halaman Publik (/room/\[id\]) yang menampilkan data *real-time* ruangan tersebut: Nilai AQI (angka & warna), Suhu, dan Kelembaban.  
* **REQ-F.06.2:** Halaman harus me-render grafik interaktif (menggunakan library seperti Recharts atau Chart.js) yang memvisualisasikan data historis 24 jam terakhir dan data prediksi 6 jam ke depan.  
* **REQ-F.06.3:** Sistem harus menampilkan rekomendasi kesehatan dinamis berdasarkan level AQI, merujuk pada referensi Breev App 1 (misal: AQI \> 150 \-\> "Udara Tidak Sehat, Nyalakan Air Purifier").

**REQ-F.07: Fitur QR Code**

* **REQ-F.07.1:** Admin harus dapat men-*generate* kode QR melalui antarmuka admin.  
* **REQ-F.07.2:** Kode QR harus mengodekan URL lengkap menuju halaman monitoring spesifik ruangan tersebut (misal: https://aqi-app.vercel.app/room/meeting-room-1).  
* **REQ-F.07.3:** Fitur *print layout* harus disediakan agar admin dapat mencetak label QR Code dengan format yang rapi.

**REQ-F.08: Monitoring Admin & Grafana**

* **REQ-F.08.1:** Sistem harus menyediakan autentikasi admin (Login/Logout).  
* **REQ-F.08.2:** Admin Dashboard di Web harus memungkinkan penambahan sensor baru (Pairing ID Sensor dengan Nama Ruangan).  
* **REQ-F.08.3:** Sistem harus mengintegrasikan visualisasi Grafana, baik melalui *iframe* atau tautan langsung, yang terhubung ke sumber data MongoDB untuk analisis *heatmap* dan korelasi multi-sensor.

## ---

**5\. Kebutuhan Non-Fungsional (Non-Functional Requirements)**

Kebutuhan non-fungsional mendefinisikan atribut kualitas sistem yang menjamin operasional yang efektif dan memuaskan.2

### **5.1 Kinerja (Performance)**

* **REQ-NF.01 (Latensi):** Waktu propagasi data dari pembacaan sensor hingga tampil di dasbor pengguna (*end-to-end latency*) tidak boleh melebihi 2.000 milidetik (2 detik) pada kondisi jaringan normal. Ini mencakup waktu transmisi MQTT, pemrosesan Node-RED, penulisan DB, dan *fetching* API Next.js.  
* **REQ-NF.02 (Throughput Broker):** Infrastruktur EMQX harus dikonfigurasi untuk mampu menangani minimal 500 pesan masuk per detik (mendukung ekspansi hingga 500 sensor dengan interval kirim 1 detik) tanpa *packet loss*.  
* **REQ-NF.03 (Waktu Muat Laman):** Halaman monitoring ruangan (hasil scan QR) harus memiliki *First Contentful Paint* (FCP) di bawah 1,5 detik pada jaringan 4G, memanfaatkan optimasi *Server-Side Rendering* (SSR) Next.js.

### **5.2 Keandalan (Reliability)**

* **REQ-NF.04 (Ketahanan Koneksi):** *Firmware* ESP32 harus mengimplementasikan algoritma *exponential backoff* untuk koneksi ulang otomatis ke Wi-Fi dan MQTT Broker jika terputus.  
* **REQ-NF.05 (Integritas Data):** Tidak boleh ada data parsial yang disimpan. Transaksi database harus bersifat atomik (dokumen tersimpan utuh atau tidak sama sekali).

### **5.3 Keamanan (Security)**

* **REQ-NF.06 (Enkripsi Transmisi):** Seluruh komunikasi antara Web Client dan Server (Vercel) wajib menggunakan HTTPS (TLS 1.2+). Komunikasi MQTT disarankan menggunakan MQTTS pada port 8883\.  
* **REQ-NF.07 (Otorisasi Akses):** Halaman Admin harus dilindungi oleh autentikasi berbasis sesi atau token (JWT). Halaman monitoring ruangan publik bersifat *read-only* dan tidak boleh mengekspos data pribadi atau konfigurasi sistem.  
* **REQ-NF.08 (Sanitasi Input):** API Endpoint harus memvalidasi semua input untuk mencegah serangan injeksi NoSQL (*NoSQL Injection*).

### **5.4 Skalabilitas (Scalability)**

* **REQ-NF.09 (Horizontal Scaling):** Desain sistem harus memungkinkan penambahan node sensor dalam jumlah tidak terbatas (hanya dibatasi kapasitas lisensi/sumber daya Broker). Broker EMQX harus mendukung klasterisasi.  
* **REQ-NF.10 (Database Sharding):** Skema MongoDB harus dirancang untuk mendukung *sharding* di masa depan jika volume data log sensor melebihi kapasitas satu *node* basis data.

### **5.5 Pemeliharaan (Maintainability)**

* **REQ-NF.11 (Modularitas Kode):** Kode repositori harus terstruktur secara modular (memisahkan *firmware*, *backend*, *frontend*, *model*) untuk memudahkan pembaruan independen.  
* **REQ-NF.12 (Logging):** Sistem harus mencatat *log* aktivitas penting (error koneksi, kegagalan prediksi) untuk keperluan *debugging* dan audit.

## ---

**6\. Fitur Sistem (System Features)**

Bagian ini mendeskripsikan fitur-fitur utama dari sudut pandang pengguna, menjelaskan apa yang sistem lakukan untuk memenuhi kebutuhan mereka.

### **6.1 Monitoring Kualitas Udara Real-Time**

Fitur inti sistem ini adalah penyajian data kondisi udara saat ini. Sensor MQ135 dan DHT22 bekerja secara sinkron untuk mengambil data lingkungan. Data mentah dikalibrasi di *edge* (ESP32) dan dikirim ke cloud. Di sisi *frontend*, data ini ditampilkan dalam bentuk *Gauge Meter* yang intuitif. Warna *gauge* berubah secara dinamis: Hijau (Baik, AQI 0-50), Kuning (Sedang, AQI 51-100), Jingga (Tidak Sehat bagi Kelompok Sensitif, AQI 101-150), Merah (Tidak Sehat, AQI \> 150), hingga Ungu (Berbahaya). Ini memberikan pemahaman instan bagi pengguna awam tanpa perlu menafsirkan angka PPM teknis.

### **6.2 Prediksi AQI Berbasis AirPhyNet**

Berbeda dengan sistem monitoring biasa, fitur ini menatap masa depan. Menggunakan model AirPhyNet yang berjalan di server, sistem menganalisis tren perubahan parameter gas dan kondisi termal. Dengan memasukkan variabel fisika difusi gas, model memprediksi level AQI untuk 1 jam, 3 jam, dan 6 jam ke depan. Fitur ini ditampilkan sebagai grafik garis putus-putus (*dashed line*) yang menyambung dari grafik data historis, memberikan visualisasi tren: apakah kualitas udara akan membaik atau memburuk. Ini memungkinkan pengguna mengambil tindakan preventif, seperti menyalakan *air purifier* sebelum ruangan digunakan untuk rapat.

### **6.3 Pemindaian QR Code Akses Ruangan**

Fitur ini menjembatani interaksi fisik dan digital. Setiap node sensor yang terpasang di ruangan memiliki identitas unik. Admin dapat men-*generate* QR Code yang mewakili URL unik ruangan tersebut (misal: domain.com/room/R-Lantai1-05). Kode ini dicetak dan ditempel di pintu masuk. Pengunjung atau penghuni cukup memindai kode tersebut dengan kamera ponsel mereka untuk langsung diarahkan ke halaman dasbor ruangan tersebut. Fitur ini menghilangkan friksi pengguna dalam mencari data ruangan di aplikasi dan meningkatkan transparansi kualitas udara gedung.

### **6.4 Manajemen Perangkat dan Administrasi**

Fitur ini memberikan kontrol penuh kepada pengelola gedung. Melalui panel admin yang aman, manajer fasilitas dapat:

1. **Menambah Sensor Baru:** Mendaftarkan ID perangkat (MAC Address/UUID) dan memberinya label lokasi yang ramah pengguna (misal: "Ruang Server", "Lobi Utama").  
2. **Generate QR Code:** Membuat dan mengunduh gambar QR Code untuk perangkat yang telah didaftarkan.  
3. **Kalibrasi Jarak Jauh (Opsional):** Mengirim parameter *offset* kalibrasi ke sensor jika terjadi penyimpangan pembacaan (drift) seiring waktu.

### **6.5 Analitik Lanjut via Grafana**

Fitur ini ditujukan untuk pengguna tingkat lanjut (Admin/Data Analyst). Panel Grafana yang terhubung langsung ke MongoDB menyajikan visualisasi data yang lebih kompleks yang tidak ditampilkan di aplikasi web publik.

* **Heatmap Gedung:** Menampilkan distribusi suhu atau polusi di seluruh gedung dalam satu tampilan peta warna.  
* **Deteksi Anomali:** Grafik yang menyoroti lonjakan tiba-tiba yang mungkin mengindikasikan kejadian spesifik (misal: kebakaran kecil, tumpahan bahan kimia, atau kegagalan ventilasi).  
* **Analisis Korelasi:** Scatter plot yang menunjukkan hubungan antara Suhu vs. Kadar VOC, membantu analisis sumber polusi.

## ---

**7\. Desain Sistem (System Design)**

Bagian ini menguraikan arsitektur teknis dan rancangan logis sistem menggunakan notasi UML (*Unified Modeling Language*) dan DFD (*Data Flow Diagram*).

### **7.1 Arsitektur Perangkat Lunak**

Sistem mengadopsi arsitektur *Hybrid IoT-Cloud* dengan pola *Event-Driven*.

* **Device Layer:** ESP32 \+ Sensor (C++ Firmware).  
* **Communication Layer:** MQTT Protocol (Pub/Sub).  
* **Integration Layer:** Node-RED (Flow-based programming) untuk ETL (*Extract, Transform, Load*).  
* **Data Layer:** MongoDB (Document Store).  
* **Intelligence Layer:** Python Service (PyTorch/TensorFlow) untuk inferensi model AirPhyNet.  
* **Application Layer:** Next.js (React Framework) di Vercel.

### **7.2 Diagram Use Case**

Diagram Use Case memvisualisasikan interaksi aktor dengan fungsi sistem.

* **Aktor: Pengguna Umum**  
  * *Scan QR Code*: Mengakses data ruangan.  
  * *Melihat Monitoring Real-time*: Melihat data AQI, suhu, kelembaban.  
  * *Melihat Rekomendasi*: Membaca saran kesehatan.  
* **Aktor: Admin**  
  * *Login*: Autentikasi sistem.  
  * *Kelola Sensor*: CRUD (*Create, Read, Update, Delete*) data sensor.  
  * *Generate QR*: Membuat kode akses.  
  * *Akses Grafana*: Analisis mendalam.  
* **Aktor: Sistem (Timer)**  
  * *Trigger Prediksi*: Memicu model ML secara berkala.  
  * *Trigger Simpan Data*: Menyimpan data telemetri masuk.

### **7.3 Diagram Aktivitas (Activity Diagram): Alur Data Sensor ke Web**

Diagram ini menggambarkan aliran kerja proses utama:

1. **Mulai.** Sensor bangun dari *sleep mode*.  
2. **Baca Data.** ESP32 mengambil nilai ADC dari MQ135 dan Digital dari DHT22.  
3. **Validasi Lokal.** Cek apakah nilai NaN atau di luar jangkauan wajar. Jika *error*, ulangi baca.  
4. **Koneksi MQTT.** Cek koneksi ke Broker. Jika putus, lakukan *reconnect*.  
5. **Publish.** Kirim paket JSON ke topik telemetry.  
6. **Terima (Node-RED).** Broker meneruskan ke Node-RED.  
7. **Proses & Simpan.** Node-RED memformat data dan menyimpannya ke MongoDB sensor\_logs.  
8. **Update UI.** Frontend Next.js (saat diakses) melakukan *fetch* data terbaru dari DB melalui API.  
9. **Selesai.**

### **7.4 Diagram Sekuens (Sequence Diagram): Skenario Scan QR**

Diagram ini menunjukkan interaksi objek berdasarkan waktu:

1. **User** mengarahkan kamera ke **QR Code**.  
2. **Smartphone** menerjemahkan QR menjadi URL dan mengirim *HTTP Request* ke **Next.js Server**.  
3. **Next.js Server** (API Route) memanggil **MongoDB**.  
4. **MongoDB** menjalankan kueri agregasi untuk mengambil data terakhir (sensors.find({id}).sort({time:-1}).limit(1)).  
5. **MongoDB** mengembalikan dokumen data JSON.  
6. **Next.js Server** memanggil **ML Service** (opsional/cached) untuk data prediksi.  
7. **Next.js Server** melakukan *Server-Side Rendering* (SSR) halaman HTML dengan data yang sudah terisi.  
8. **Smartphone** menerima halaman dan menampilkannya ke **User**.

### **7.5 Diagram Kelas (Class Diagram)**

Diagram ini mendefinisikan struktur data:

* **Class Sensor:** Atribut (sensorId, macAddress, name, locationId, status). Method (calibrate(), sendTelemetry()).  
* **Class Reading:** Atribut (timestamp, sensorId, co2, temp, humidity). Terhubung N-to-1 dengan Sensor.  
* **Class Prediction:** Atribut (generatedAt, targetTime, aqiValue, confidence). Terhubung N-to-1 dengan Sensor.  
* **Class User (Admin):** Atribut (userId, username, passwordHash, role). Method (login(), addSensor(), generateQR()).

### **7.6 Diagram Deployment**

Diagram ini memetakan komponen perangkat lunak ke perangkat keras/infrastruktur:

* **Node IoT (Device):** Menjalankan *Firmware* ESP32. Protokol: MQTT.  
* **Cloud Server (VPS/Docker Host):**  
  * *Container* EMQX (Port 1883/8083).  
  * *Container* MongoDB (Port 27017).  
  * *Container* Node-RED/ML Service.  
  * *Container* Grafana (Port 3000).  
* **Platform Vercel:** Menjalankan Next.js Application. Terhubung ke Cloud Server via HTTPS (API).  
* **Client Device:** *Smartphone/Laptop* User mengakses via HTTPS.

### **7.7 Data Flow Diagram (DFD) Level 1**

Menggambarkan transformasi data:

1. **Proses 1.0 Akuisisi:** Input dari Lingkungan \-\> Data Mentah \-\> Output Paket MQTT.  
2. **Proses 2.0 Ingesti & Penyimpanan:** Input Paket MQTT \-\> Validasi & Routing (Node-RED) \-\> Data Tersimpan (MongoDB).  
3. **Proses 3.0 Analisis Prediktif:** Input Data Historis \-\> Model AirPhyNet \-\> Output Nilai Prediksi.  
4. **Proses 4.0 Visualisasi:** Input Data Tersimpan \+ Prediksi \-\> Agregasi API \-\> Output Tampilan Dashboard.

## ---

**8\. Repositori Kode (Code Repository)**

Pengelolaan kode sumber dilakukan menggunakan Git dengan struktur repositori yang mendukung pengembangan terpisah namun terintegrasi (*Monorepo* atau *Multi-repo* terkoordinasi). Struktur direktori yang direkomendasikan adalah sebagai berikut:

/aqi-iot-system-master  
│  
├── /firmware (IoT Edge Code)  
│ ├── /src  
│ │ ├── main.cpp \# Entry point: Setup WiFi, MQTT, Loop utama  
│ │ ├── sensors\_driver.cpp \# Implementasi pembacaan MQ135 & DHT22  
│ │ ├── mqtt\_handler.cpp \# Fungsi connect, publish, subscribe  
│ │ └── config.h \# Konfigurasi kredensial (sebaiknya di-ignore git)  
│ ├── platformio.ini \# Library dependencies (PubSubClient, DHTLib)  
│ └── README.md  
│  
├── /backend-services (Data Processing & ML)  
│ ├── /node-red-flows \# File ekspor JSON flow Node-RED  
│ ├── /airphynet-model  
│ │ ├── model.py \# Definisi arsitektur Neural Network (PyTorch)  
│ │ ├── train.py \# Skrip pelatihan dengan loss function fisika  
│ │ ├── inference\_api.py \# Flask/FastAPI untuk melayani prediksi  
│ │ └── requirements.txt \# Python dependencies  
│ └── /database-scripts \# Script inisialisasi indeks MongoDB  
│  
├── /web-frontend (Next.js App)  
│ ├── /pages  
│ │ ├── \_app.js \# Entry point aplikasi  
│ │ ├── index.js \# Landing page  
│ │ ├── login.js \# Halaman login admin  
│ │ ├── /admin \# Dashboard Admin (Protected Route)  
│ │ └── /room \# untuk QR Scan result  
│ │ └── \[id\].js  
│ ├── /components \# Komponen UI Reusable  
│ │ ├── GaugeChart.js \# Visualisasi AQI  
│ │ ├── TrendGraph.js \# Grafik Line Chart  
│ │ └── QRGenerator.js \# Komponen pembuat QR  
│ ├── /lib \# Helper functions  
│ │ ├── db.js \# Koneksi MongoDB  
│ │ └── api.js \# Wrapper fetch API  
│ ├── public \# Aset statis  
│ ├── package.json  
│ └── next.config.js  
│  
└── /docs \# Dokumentasi Proyek  
├── SRS\_Document.md \# File ini  
├── Architecture\_Diagrams/ \# File gambar diagram (PNG/SVG)  
└── Manual\_Instalasi.pdf \# Panduan deployment

### **Strategi Cabang (Branching Strategy)**

Untuk menjaga stabilitas kode produksi, proyek ini menggunakan alur kerja *Gitflow*:

* main: Cabang utama yang berisi kode produksi yang stabil dan teruji. *Deploy* otomatis ke Vercel (untuk web) terjadi saat ada *push* ke sini.  
* develop: Cabang integrasi utama. Semua fitur baru digabungkan ke sini sebelum rilis.  
* feature/nama-fitur: Cabang untuk pengembangan fitur spesifik (misal: feature/grafana-integration, feature/airphynet-optimization). Dibuat dari develop dan di-*merge* kembali melalui *Pull Request*.  
* hotfix/nama-bug: Cabang darurat untuk perbaikan *bug* kritis di main.

Dengan struktur ini, pengembangan dapat dilakukan secara paralel oleh tim IoT, tim Backend/ML, dan tim Frontend tanpa konflik kode yang berarti.

---

**Penyusun:**

*Senior IoT Systems Architect*

Untuk Proyek Monitoring AQI Berbasis IoT

10 Desember 2025

#### **Works cited**

1. B-4\_SRS-SAD2025  
2. Ageng \[ind\] srs-ieee.docx