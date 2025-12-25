#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
    ListResourceTemplatesRequestSchema,
    ListPromptsRequestSchema, // BARU
    GetPromptRequestSchema    // BARU
} from "@modelcontextprotocol/sdk/types.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_PATH = path.join(__dirname, 'products.json');

const server = new Server(
    {
        name: "server-toko-elektronik",
        version: "1.3.0",
    },
    {
        capabilities: {
            tools: {},
            resources: {},
            prompts: {}, // BARU: Kita punya kemampuan Prompts
        },
    }
);

// --- HANDLERS LAMA (Resource Templates, Resources, Tools) ---
// (Saya ringkas bagian ini agar fokus, asumsikan kode Resource & Tools sama seperti sebelumnya)

server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
    return { resourceTemplates: [] };
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "file:///toko/stok_barang",
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

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "cari_produk",
                description: "Mencari produk berdasarkan nama",
                inputSchema: {
                    type: "object",
                    properties: { keyword: { type: "string" } },
                    required: ["keyword"]
                },
            },
            // ... tool beli_barang (kode sama seperti sebelumnya)
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // ... (Logika tools sama seperti sebelumnya)
    // Agar kode pendek, asumsikan logika cari_produk dan beli_barang ada di sini
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8'));

    if (request.params.name === "cari_produk") {
        const { keyword } = request.params.arguments;
        const hasil = products.filter(p => p.nama.toLowerCase().includes(keyword.toLowerCase()));
        return { content: [{ type: "text", text: JSON.stringify(hasil, null, 2) }] };
    }

    return { content: [{ type: "text", text: "Tool action placeholder" }] };
});


// --- 🚀 BAGIAN BARU: PROMPTS ---

// 1. Daftar Prompts (Menu Resep)
server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
        prompts: [
            {
                name: "analisa_restock",
                description: "Analisa stok menipis dan buat laporan pembelian",
            }
        ]
    };
});

// 2. Ambil Isi Prompt (Koki Memberikan Resep)
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name === "analisa_restock") {
        return {
            messages: [
                {
                    role: "user",
                    content: {
                        type: "text",
                        text: "Tolong analisa data stok barang berikut. Identifikasi barang yang stoknya kurang dari 10 unit. Berikan rekomendasi jumlah restock agar minimal menjadi 20 unit per barang."
                    }
                },
                {
                    role: "user",
                    content: {
                        type: "resource",
                        resource: {
                            uri: "file:///toko/stok_barang", // Otomatis menyertakan data resource!
                            mimeType: "application/json",
                            text: fs.readFileSync(PRODUCTS_PATH, 'utf-8') // Kita load manual disini atau biarkan client load (tergantung implementasi, cara paling aman embed text langsung)
                        }
                    }
                }
            ]
        };
    }
    throw new Error("Prompt tidak ditemukan");
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Server Toko Elektronik (Full Features) siap...");