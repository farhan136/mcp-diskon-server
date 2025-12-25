# MCP Toko Elektronik Server

Server MCP (Model Context Protocol) sederhana untuk mensimulasikan operasional toko elektronik, mencakup manajemen stok, pencarian produk, dan analisis restock.

## 🚀 Fitur

Server ini mengimplementasikan tiga pilar utama MCP:

### 1. Resources
- **Data Stok Produk** (`file:///toko/stok_barang`): Menyediakan data lengkap inventaris toko dalam format JSON.

### 2. Tools
- **`cari_produk`**: Mencari produk berdasarkan kata kunci nama.
- **`beli_barang`**: (Placeholder) Simulasi logika pembelian barang.

### 3. Prompts
- **`analisa_restock`**: Prompt siap pakai untuk meminta AI menganalisa stok yang menipis ( < 10 unit) dan memberikan rekomendasi pengadaan barang kembali.

## 🛠 Instalasi

1. Clone repositori ini atau masuk ke direktori proyek.
2. Pastikan Anda memiliki [Node.js](https://nodejs.org/) terinstal.
3. Instal dependensi:
   ```bash
   npm install
   ```

## ⚙️ Konfigurasi Claude Desktop

Untuk menggunakan server ini di Claude Desktop, tambahkan konfigurasi berikut ke file `claude_desktop_config.json` Anda:

**macOS:** `~/Library/Application Support/Cursor/User/globalStorage/saoudrizwan.claude-dev/settings/claude_desktop_config.json` (atau lokasi standar Claude Desktop)
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "toko-elektronik": {
      "command": "node",
      "args": ["/home/farhan/non_kerjaan/mcp-diskon-server/index.js"]
    }
  }
}
```

> [!IMPORTANT]
> Pastikan path ke `index.js` adalah path absolut yang sesuai dengan lokasi folder di komputer Anda.

## 📁 Struktur Proyek

- `index.js`: Implementasi server MCP menggunakan SDK `@modelcontextprotocol/sdk`.
- `products.json`: Database sederhana untuk menyimpan data produk.
- `package.json`: Definisi dependensi dan tipe modul.

## 📝 Lisensi
ISC
