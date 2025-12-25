#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// 1. Inisialisasi Server
const server = new Server(
    {
        name: "server-diskon-sederhana",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {}, // Kita memberitahu Host bahwa kita punya kemampuan 'tools'
        },
    }
);

// 2. Definisikan Daftar Tools (Menu)
// GANTI BLOK INI:
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "hitung_diskon",
                description: "Menghitung harga akhir setelah diskon",
                inputSchema: {
                    type: "object",
                    properties: {
                        harga: {
                            type: "number",
                            description: "Harga asli barang"
                        },
                        persen_diskon: {
                            type: "number",
                            description: "Persentase diskon (0-100)"
                        }
                    },
                    required: ["harga", "persen_diskon"]
                },
            },
        ],
    };
});

// 3. Tangani Eksekusi Tool (Koki Memasak)
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "hitung_diskon") {
        const { harga, persen_diskon } = request.params.arguments;

        // Logika bisnis sederhana
        const potongan = (harga * persen_diskon) / 100;
        const harga_akhir = harga - potongan;

        return {
            content: [
                {
                    type: "text",
                    text: `Harga awal Rp${harga}, diskon ${persen_diskon}%. Harga akhir: Rp${harga_akhir}`,
                },
            ],
        };
    }

    throw new Error("Tool tidak ditemukan");
});

// 4. Hubungkan ke Transport Layer (Stdio)
const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Server Diskon MCP berjalan di Stdio..."); // Ingat! Log ke stderr