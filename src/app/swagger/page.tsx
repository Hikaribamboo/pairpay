"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import "swagger-ui-react/swagger-ui.css";

// 型定義をここに書く
interface SwaggerUIProps {
  spec?: any;
  url?: string;
  [key: string]: any;
}

const SwaggerUI = dynamic<SwaggerUIProps>(() => import("swagger-ui-react"), {
  ssr: false,
});

export default function SwaggerPage() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch("/openapi.json")
      .then((res) => res.json())
      .then(setSpec);
  }, []);

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      {spec ? (
        <div className="bg-white border border-gray-300 rounded-lg shadow overflow-auto">
          <SwaggerUI spec={spec} />
        </div>
      ) : (
        <p className="text-gray-600">読み込み中...</p>
      )}
    </div>
  );
}
