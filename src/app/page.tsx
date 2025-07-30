import { Suspense } from "react";
import Home from "./home/Home";

export default function HomeWrapper() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <Home />
    </Suspense>
  );
}
