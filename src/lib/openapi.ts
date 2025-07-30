// src/lib/openapi.ts
import type { OpenAPIV3_1 } from "openapi-types";

export const openapi: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  info: {
    title: "PairPay API",
    version: "0.1.0",
    description:
      "LINE の postback 受信、購入/入金リクエスト作成、残高取得などの API。",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local" },
    { url: "https://{host}", description: "Ngrok/Preview", variables: {
      host: { default: "example.ngrok-free.app" }
    }},
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT", // Firebase ID Token
      },
      lineSignature: {
        type: "apiKey",
        in: "header",
        name: "x-line-signature",
        description: "LINE Webhook 署名（HMAC-SHA256 Base64）",
      },
    },
    schemas: {
      PurchaseCreate: {
        type: "object",
        required: ["item", "cost"],
        properties: {
          item: { type: "string", example: "ゴミ袋45L" },
          cost: { type: "number", example: 450 },
          link: { type: ["string", "null"] },
          memo: { type: ["string", "null"] },
        },
      },
      DepositCreate: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "number", example: 3000 },
          memo: { type: ["string", "null"] },
        },
      },
      BalanceResponse: {
        type: "object",
        properties: {
          balance: { type: "number", example: 12345 },
          totalExpense: { type: "number", example: 1000 },
          totalDeposit: { type: "number", example: 13345 },
        },
      },
      Rule: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "飲食は承認不要" },
          condition: { type: "object", additionalProperties: true },
          action: { type: "object", properties: { autoApprove: { type: "boolean" } } },
        },
      },
      SavingsCreate: {
        type: "object",
        required: ["amount"],
        properties: {
          amount: { type: "number", example: 1000 },
          memo: { type: ["string", "null"] },
        },
      },
      CardMasked: {
        type: "object",
        properties: { masked: { type: "string", example: "**** **** **** 1234" } },
      },
      ShareTokenResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "short-lived-jwt" },
          expiresIn: { type: "number", example: 300 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }], // 既定で Bearer 必須（除外するパスは個別に上書き）
  paths: {
    "/api/auth/callback": {
      get: {
        summary: "LINE 認可コードを受け取り、customToken を返す",
        security: [], // 認証不要
        parameters: [
          { name: "code", in: "query", required: true, schema: { type: "string" } },
          { name: "redirect_uri", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    userId: { type: "string" },
                    userName: { type: "string" },
                    customToken: { type: "string" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/line/webhook": {
      post: {
        summary: "LINE Webhook 受信（postback）",
        description:
          "署名検証後、Firestore に反映し LINE Reply API で応答。元メッセージのボタンは編集不可。",
        security: [{ lineSignature: [] }], // 署名ヘッダのみ
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", additionalProperties: true },
            },
          },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/purchases": {
      post: {
        summary: "購入リクエスト作成（＋LINE通知）",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PurchaseCreate" } } },
        },
        responses: {
          "200": {
            description: "作成成功",
            content: { "application/json": { schema: { type: "object", properties: { id: { type: "string" } } } } },
          },
        },
      },
    },
    "/api/deposits": {
      post: {
        summary: "入金リクエスト作成（＋LINE通知）",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/DepositCreate" } } },
        },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/accounts/balance": {
      get: {
        summary: "口座残高を返す（サマリ）",
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/BalanceResponse" } } },
          },
        },
      },
    },
    "/api/rules": {
      get: {
        summary: "ルール一覧",
        responses: { "200": { description: "OK", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Rule" } } } } } },
      },
      post: {
        summary: "ルール追加",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Rule" } } } },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/rules/{id}": {
      patch: {
        summary: "ルール更新",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Rule" } } } },
        responses: { "200": { description: "OK" } },
      },
      delete: {
        summary: "ルール削除",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "204": { description: "No Content" } },
      },
    },
    "/api/savings": {
      get: { summary: "貯金履歴", responses: { "200": { description: "OK" } } },
      post: {
        summary: "貯金の記録",
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/SavingsCreate" } } } },
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/cards": {
      get: {
        summary: "カード番号のマスク表示",
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/CardMasked" } } } } },
      },
    },
    "/api/cards/share": {
      post: {
        summary: "短命共有トークン発行（画面表示専用）",
        responses: { "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/ShareTokenResponse" } } } } },
      },
    },
  },
};
