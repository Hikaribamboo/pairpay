import React from "react";
import { useState } from "react";

const CheckPayedRequest = () => {
  const [isPaid, setIsPaid] = useState(false);
  const [paidBy, setPaidBy] = useState<"A" | "B" | null>(null);

  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isPaid}
          onChange={(e) => {
            setIsPaid(e.target.checked);
            if (!e.target.checked) setPaidBy(null);
          }}
        />
        <span>支払い済み</span>
      </label>

      {isPaid && (
        <div className="ml-4 space-y-1">
          <label>
            <input
              type="radio"
              name="paidBy"
              value="A"
              checked={paidBy === "A"}
              onChange={() => setPaidBy("A")}
            />{" "}
            Aさんが支払った
          </label>
          <label>
            <input
              type="radio"
              name="paidBy"
              value="B"
              checked={paidBy === "B"}
              onChange={() => setPaidBy("B")}
            />{" "}
            Bさんが支払った
          </label>
        </div>
      )}
    </div>
  );
};

export default CheckPayedRequest;
