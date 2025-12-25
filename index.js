#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListResourceTemplatesRequestSchema // IMPORT BARU
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup Path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_PATH = path.join(__dirname, 'products.json');

const server = new Server(
    {
        name: "server-toko-elektronik",
        version: "1.2.0",
    },
    {
        capabilities: {
            tools: {},
            resources: {},
        },
    }
);

// --- 1. FIX ERROR: Handler untuk Resource Templates ---
// Kita jawab "kosong" agar Inspector tidak error -32601
server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return { resourceTemplates: [] };
});

// --- 2. RESOURCES (Data Pasif) ---
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "file:///toko/stok_barang", // URI unik kita
                name: "Data Stok Produk",
                mimeType: "application/json",
                description: "Daftar lengkap semua produk di toko"
            }
        ]
    };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    if (request.params.uri === "file:///toko/stok_barang") {
        const fileContent = fs.readFileSync(PRODUCTS_PATH, 'utf-8');
        return {
            contents: [{
                uri: request.params.uri,
                mimeType: "application/json",
                text: fileContent
            }]
        };
    }
    throw new Error("Resource tidak ditemukan");
});

// --- 3. TOOLS (Aksi Aktif) ---
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "cari_produk",
                description: "Mencari produk berdasarkan nama (case insensitive)",
                inputSchema: {
                    type: "object",
                    properties: {
                        keyword: { type: "string", description: "Kata kunci nama barang" }
                    },
                    required: ["keyword"]
                },
            },
            {
                name: "beli_barang",
                description: "Simulasi beli barang (mengurangi stok dummy)",
                inputSchema: {
                    type: "object",
                    properties: {
                        id_produk: { type: "number" },
                        jumlah: { type: "number" }
                    },
                    required: ["id_produk", "jumlah"]
                }
            }
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));

    // Tool 1: Cari Produk
    if (request.params.name === "cari_produk") {
        const { keyword } = request.params.arguments;
        const hasil = products.filter(p =>
            p.nama.toLowerCase().includes(keyword.toLowerCase())
        );
        return {
            content: [{ type: "text", text: JSON.stringify(hasil, null, 2) }]
        };
    }

    // Tool 2: Beli Barang
    if (request.params.name === "beli_barang") {
        const { id_produk, jumlah } = request.params.arguments;
        const product = products.find(p => p.id === id_produk);

        if (!product) return { isError: true, content: [{ type: "text", text: "Produk tidak ditemukan" }] };
        if (product.stok < jumlah) return { isError: true, content: [{ type: "text", text: `Stok kurang! Sisa: ${product.stok}` }] };

        // Simulasi pengurangan (tidak save ke file agar data asli aman)
        const sisa = product.stok - jumlah;
        const total_bayar = product.harga * jumlah;

        return {
            content: [{ type: "text", text: `Berhasil beli ${jumlah}x ${product.nama}. Total: Rp${total_bayar}. Sisa stok: ${sisa}` }]
        };
    }

    throw new Error("Tool tidak ditemukan");
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Server Toko Elektronik siap melayani...");