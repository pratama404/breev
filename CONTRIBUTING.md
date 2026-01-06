# 🤝 Berkontribusi pada Breev

Terima kasih telah tertarik untuk mengembangkan Breev! Berikut panduan singkat untuk kontributor.

## 🛠️ Setup Development Environment
1.  **Fork** repository ini ke akun GitHub Anda.
2.  **Clone** ke lokal komputer Anda:
    ```bash
    git clone https://github.com/USERNAME/breev.git
    ```
3.  **Branching**: Buat branch baru untuk fitur Anda.
    ```bash
    git checkout -b fitur/nama-fitur-keren
    ```

## 📝 Standards
### Frontend (Next.js)
*   Gunakan **Functional Components** dan Hooks.
*   Styling menggunakan **Tailwind CSS**. Hindari CSS custom jika memungkinkan.
*   Pastikan komponen responsif (Mobile First).

### Backend (Python/FastAPI)
*   Gunakan **Type Hints** pada fungsi Python.
*   Ikuti style guide **PE8**.
*   Pastikan setiap endpoint baru memiliki validasi `API Key`.

### Firmware (C++)
*   Gunakan `#define` untuk konstanta konfigurasi.
*   Jangan hardcode kredensial (gunakan placeholder).

## 🚀 Mengirim Perubahan (Pull Request)
1.  Push branch Anda ke GitHub.
2.  Buka Pull Request ke branch `main` repository ini.
3.  Jelaskan apa yang Anda ubah dan sertakan screenshot jika ada perubahan UI.

## 🐛 Melaporkan Bug
Jika menemukan bug, silakan buat **Issue** baru dengan format:
*   **Judul**: Deskripsi singkat error.
*   **Langkah Reproduksi**: Cara memunculkan error tersebut.
*   **Expected Behavior**: Apa yang seharusnya terjadi.
