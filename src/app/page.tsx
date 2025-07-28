import { Suspense } from "react";
import Home from "./Home"; // "./PageInner" でも可

export default function HomeWrapper() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <Home />
    </Suspense>
  );
}
