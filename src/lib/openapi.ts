export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "ペアPay API",
    version: "1.0.0",
    description: "現在実装済みのエンドポイントのみ記載",
  },
  paths: {
    "/api/callback": {
      get: {
        summary: "LINEログインのコールバック",
        parameters: [
          {
            name: "code",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "redirect_uri",
            in: "query",
            required: true,
            schema: { type: "string", format: "uri" },
          },
        ],
        responses: {
          200: {
            description: "カスタムトークンを含むユーザー情報",
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
    "/api/request/payment": {
      get: {
        summary: "すべての購入リクエストを取得",
        responses: {
          200: {
            description: "リクエスト一覧",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Payment" },
                },
              },
            },
          },
        },
      },
    },
    "/api/requests/payment": {
      post: {
        summary: "新しい購入リクエストを作成",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/RequestPayment",
              },
            },
          },
        },
        responses: {
          200: {
            description: "作成成功",
          },
        },
      },
    },
    "/api/request/payment/{requestId}": {
      get: {
        summary: "特定の購入リクエストを取得",
        parameters: [
          {
            name: "requestId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "リクエスト詳細",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Payment" },
              },
            },
          },
          404: { description: "リクエストが見つからない" },
        },
      },
      patch: {
        summary: "購入リクエストを承認する",
        parameters: [
          {
            name: "requestId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isApproved", "userId"],
                properties: {
                  isApproved: { type: "boolean" },
                  userId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "承認されたリクエスト",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Payment" },
              },
            },
          },
          403: { description: "自分のリクエストを承認しようとした" },
          409: { description: "すでに承認済み" },
        },
      },
    },
  },
  components: {
    schemas: {
      Payment: {
        type: "object",
        required: [
          "id",
          "userId",
          "userName",
          "paymentTitle",
          "paymentCost",
          "createdAt",
          "isApproved",
        ],
        properties: {
          id: { type: "string" },
          userId: { type: "string" },
          userName: { type: "string" },
          paymentTitle: { type: "string" },
          paymentCost: { type: "string" },
          itemLink: { type: "string" },
          paymentMemo: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          isApproved: { type: "boolean" },
        },
      },
      RequestPayment: {
        type: "object",
        required: ["userId", "userName", "paymentTitle", "paymentCost"],
        properties: {
          userId: { type: "string" },
          userName: { type: "string" },
          paymentTitle: { type: "string" },
          paymentCost: { type: "string" },
          itemLink: { type: "string" },
          paymentMemo: { type: "string" },
        },
      },
    },
  },
};
