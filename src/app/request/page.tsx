"use client";

import { useState } from "react";
import PurchaseList from "./components/PurchaseList";
import PurchaseForm from "./components/forms/PurchaseForm"; // 仮にこれだけ先
import { Plus } from "lucide-react";

const RequestPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<
    "purchase" | "deposit" | "saving" | null
  >(null);

  const openForm = (type: "purchase" | "deposit" | "saving") => {
    setFormType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormType(null);
  };

  return (
    <div className="relative">
      <PurchaseList />

      {/* ➕ボタン */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition"
      >
        <Plus className="w-5 h-5" />
      </button>

      {/* モーダル表示 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl space-y-4">
            {!formType ? (
              <>
                <h2 className="text-lg font-semibold text-center text-gray-700">
                  フォームを選択
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={() => openForm("purchase")}
                    className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg"
                  >
                    購入リクエスト
                  </button>
                  <button
                    onClick={() => openForm("deposit")}
                    className="w-full bg-emerald-500 text-white font-bold py-2 rounded-lg"
                  >
                    入金リクエスト
                  </button>
                  <button
                    onClick={() => openForm("saving")}
                    className="w-full bg-yellow-500 text-white font-bold py-2 rounded-lg"
                  >
                    貯金リクエスト
                  </button>
                  <button
                    onClick={closeModal}
                    className="w-full text-gray-700 mt-2 underline"
                  >
                    キャンセル
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={closeModal}
                  className="text-sm text-gray-400 float-right"
                >
                  ✕
                </button>
                {formType === "purchase" && <PurchaseForm />}
                {formType === "deposit" && (
                  <p>🟢 入金フォーム Coming Soon...</p>
                )}
                {formType === "saving" && <p>🟣 貯金フォーム Coming Soon...</p>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPage;
