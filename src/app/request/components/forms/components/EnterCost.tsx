import React from "react";
import { FiDelete } from "react-icons/fi";

type Props = {
  itemCost: string;
  setItemCost: React.Dispatch<React.SetStateAction<string>>;
};

const EnterCost = ({ itemCost, setItemCost }: Props) => {
  const digits = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "000",
    "6",
    "7",
    "8",
    "9",
    "0",
    "00",
  ];
  const handleCostButton = (digit: string) => {
    setItemCost((prev) => prev + digit);
  };

  return (
    <div>
      {/* 金額入力 */}
      <div>
        <label className="text-md font-medium text-gray-700">Cost</label>
        <div className="relative border-b border-gray-400 mb-2 block">
          <input
            value={itemCost}
            onChange={(e) => setItemCost(e.target.value)}
            className="w-full text-xl ml-4"
          />
          <FiDelete
            onClick={() => setItemCost((prev) => prev.slice(0, -1))}
            className="size-7 absolute right-3 bottom-2 text-gray-500"
          />
        </div>
        <div className="grid grid-cols-6 gap-2 mt-2">
          {digits.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleCostButton(d)}
              className="py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-center font-medium"
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnterCost;
