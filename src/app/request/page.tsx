"use client";

import { useState, useEffect } from "react";
import ApprovedRequestList from "./components/request/ApprovedRequestList";
import PaymentRequestForm from "./components/forms/PaymentRequestForm";
import { Plus } from "lucide-react";
import { IoCloseSharp } from "react-icons/io5";
import type { Payment } from "@/types/request/payment";
import { fetchAllPaymentRequest } from "@/lib/api/request/papyment";
import DepositRequestForm from "./components/forms/DepositRequestForm";
import SavingRequestForm from "./components/forms/SavingRequest";
import UnApprovedRequestList from "./components/request/UnApprovedRequestList";

const RequestPage = () => {
  const [payRequest, setPayRequest] = useState<Payment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formType, setFormType] = useState<
    "payment" | "deposit" | "saving" | null
  >(null);

  const openForm = (type: "payment" | "deposit" | "saving") => {
    setFormType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormType(null);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const payments = await fetchAllPaymentRequest();
        setPayRequest(payments);
      } catch (e) {
        console.error("リクエストリスト取得エラー", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="relative mt-12">
      <UnApprovedRequestList
        approvedPayRequest={payRequest.filter((item) => !item.isApproved)}
        setPayRequests={setPayRequest}
        loading={loading}
        setLoading={setLoading}
      />
      <ApprovedRequestList
        approvedPayRequest={payRequest.filter((item) => item.isApproved)}
        setPayRequests={setPayRequest}
        loading={loading}
        setLoading={setLoading}
      />

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
                    onClick={() => openForm("payment")}
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
                <IoCloseSharp
                  onClick={closeModal}
                  className="text-3xl text-gray-400 float-right"
                />

                {formType === "payment" && (
                  <PaymentRequestForm
                    onCreated={async () => {
                      closeModal();
                      const updated = await fetchAllPaymentRequest();
                      setPayRequest(updated);
                    }}
                  />
                )}
                {formType === "deposit" && <DepositRequestForm />}
                {formType === "saving" && <SavingRequestForm />}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPage;
