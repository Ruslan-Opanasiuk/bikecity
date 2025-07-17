// src/components/SignPreview.jsx
import { useEffect, useRef } from "react";
import B1 from "../utils/B1";
import B2 from "../utils/B2";
import B3 from "../utils/B3";
import B4 from "../utils/B4";

// Імпортуємо base64-шрифти як рядки
import mediumData from "../utils/export/RoadUA-Medium.ttf.base64?raw";
import boldData   from "../utils/export/RoadUA-Bold.ttf.base64?raw";

function SignPreview({ signType, params }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // 1) Medium (вага 500)
    const faceMedium = new FontFace(
      "RoadUA",
      `url(data:font/ttf;base64,${mediumData}) format('truetype')`,
      { weight: "500" }
    );
    document.fonts.add(faceMedium);

    // 2) Bold (вага 700)
    const faceBold = new FontFace(
      "RoadUA",
      `url(data:font/ttf;base64,${boldData}) format('truetype')`,
      { weight: "700" }
    );
    document.fonts.add(faceBold);

    // Завантажуємо обидва
    Promise.all([faceMedium.load(), faceBold.load()])
      .then(() => {
        console.log("✅ RoadUA fonts loaded (500 & 700)");
      })
      .catch((e) => {
        console.error("❌ Помилка завантаження шрифту RoadUA:", e);
      });
  }, []);

  return (
    <div
      id="sign-preview"
      ref={containerRef}
      className="p-6 text-left"
      style={{ fontFamily: "RoadUA" }}
    >
      {signType === "В1" && <B1 params={params} />}
      {signType === "В2" && <B2 params={params} />}
      {signType === "В3" && <B3 params={params} />}
      {signType === "В4" && <B4 params={params} />}

      {!["В1", "В2", "В3", "В4"].includes(signType) && (
        <div>Тут буде прев’ю {signType}</div>
      )}
    </div>
  );
}

export default SignPreview;
