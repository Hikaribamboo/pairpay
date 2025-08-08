import React from "react";

const LeadLineFriend = () => {
  return (
    <div className="p-4 text-center space-y-4">
      <h1 className="text-xl font-bold">ようこそ PairPay へ！</h1>
      <p>
        まずは LINE でペア用のグループを作成し、
        <br />
        このボットを招待してください。
      </p>
      <img src="/line-friend.png" alt="LINE Bot Invite" />
      <p>
        ボットを招待すると自動で認証用のリンクが届きますので、
        そちらからアプリへのログインを続けてください。
      </p>
    </div>
  );
};

export default LeadLineFriend;
