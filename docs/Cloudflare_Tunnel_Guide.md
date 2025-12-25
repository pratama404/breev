# Panduan Akses Cepat (Quick Tunnel) & SSH Web

Panduan ini untuk Anda yang **tidak memiliki domain sendiri** di Cloudflare dan ingin cara cepat mengekspos service (API, Node-RED, SSH) ke internet menggunakan **Quick Tunnel (TryCloudflare)**.

## 1. Quick Tunnel (Tanpa Login)

Cara ini akan menghasilkan URL acak (misal: `https://slap-giggle-random.trycloudflare.com`) setiap kali dijalankan.

### A. Expose Backend API (Port 8000)
```bash
cloudflared tunnel --url http://localhost:8000
```
*Salin URL yang muncul di terminal. Gunakan URL ini di Frontend Vercel (`AIRPHYNET_API_URL`).*

### B. Expose Node-RED (Port 1880)
```bash
cloudflared tunnel --url http://localhost:1880
```
*Akses dashboard Node-RED dari mana saja.*

### C. Expose Grafana (Port 3000)
```bash
cloudflared tunnel --url http://localhost:3000
```

---

## 2. SSH Lewat Browser (ttyd)

Agar Anda bisa mengakses terminal Proxmox/Ubuntu Anda lewat browser (berguna jika IP dynamic atau kena firewall), kita gunakan `ttyd`.

### A. Install ttyd
1.  Download binary terbaru:
    ```bash
    wget https://github.com/tsl0922/ttyd/releases/download/1.7.3/ttyd.x86_64
    ```
2.  Beri izin eksekusi dan pindahkan:
    ```bash
    chmod +x ttyd.x86_64
    sudo mv ttyd.x86_64 /usr/local/bin/ttyd
    ```

### B. Jalankan ttyd (Background)
Jalankan ttyd di port `5555` (atau port lain yg bebas), dengan fitur login (Wajib demi keamanan!):
```bash
# Format: ttyd -p PORT -c USER:PASS bash
nohup ttyd -p 5555 -c admin:rahasia123 -W bash > ttyd.log 2>&1 &
```
*(Ganti `admin:rahasia123` dengan username/password yang kuat!)*

### C. Expose ttyd via Tunnel
```bash
cloudflared tunnel --url http://localhost:5555
```

Sekarang Anda bisa buka URL acak tersebut, login dengan user/pass tadi, dan Anda punya **Full Terminal Access** lewat browser! 🚀

---

## 3. Menjalankan Banyak Tunnel Sekaligus (Config File)

Karena `cloudflared tunnel --url` memblokir terminal, jika ingin menjalankan banyak sekaligus dengan rapi, gunakan Config File (Ingress Rules).

1.  Buat folder config: `mkdir -p ~/.cloudflared`
2.  Buat file `config.yml`:
    ```yaml
    tunnel: <TUNNEL_UUID> # Kosongkan jika pakai Quick Tunnel (tapi Quick Tunnel susah multiple ingress tanpa login).
    # Untuk Quick Tunnel, lebih mudah jalankan command terppisah di screen/tmux.
    ```

**Rekomendasi untuk Quick Tunnel:**
Gunakan `tmux` atau `screen` agar terminal tidak mati saat Anda disconnect.

```bash
# Install tmux
sudo apt install tmux -y

# Buka sesi baru
tmux new -s tunnels

# Tab 1: API
cloudflared tunnel --url http://localhost:8000
# Tekan Ctrl+B lalu C (Create new tab)

# Tab 2: Node-RED
cloudflared tunnel --url http://localhost:1880
# Tekan Ctrl+B lalu C

# Tab 3: ttyd
cloudflared tunnel --url http://localhost:5555

# Detach (keluar tanpa mematikan): Ctrl+B lalu D
```
Untuk masuk lagi: `tmux attach -t tunnels`
