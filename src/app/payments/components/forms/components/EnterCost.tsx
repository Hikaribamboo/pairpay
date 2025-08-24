import React from "react";
import { FiDelete } from "react-icons/fi";

type Props = {
  paymentCost: number;
  setPaymentCost: React.Dispatch<React.SetStateAction<number>>;
};

const EnterCost = ({ paymentCost, setPaymentCost }: Props) => {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const handleCostButton = (digit: number) => {
    setPaymentCost((prev) => prev * 10 + digit);
  };

  const handleDelete = () => {
    const costStr = paymentCost.toString();
    const newStr = costStr.slice(0, -1);
    const newCost = parseInt(newStr || "0", 10);
    setPaymentCost(newCost);
  };

  return (
    <div>
      {/* 金額入力 */}
      <div>
        <label className="text-md font-medium text-gray-700">Cost</label>
        <div className="relative border-b border-gray-400 mb-2 block">
          <input
            type="text"
            value={paymentCost}
            readOnly
            inputMode="numeric"
            className="w-full text-xl ml-4"
          />
          <FiDelete
            onClick={handleDelete}
            className="size-7 absolute right-3 bottom-2 text-gray-500"
          />
        </div>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {digits.map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleCostButton(digit)}
              className="py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-medium"
            >
              {digit}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnterCost;
