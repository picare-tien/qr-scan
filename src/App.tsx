import { useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function App() {
  const [result, setResult] = useState("");
  const [data, setData] = useState(null);
  const [scanner, setScanner] = useState(null);

  const startScan = async () => {
    const qr = new Html5Qrcode("reader");
    setScanner(qr);

    await qr.start(
      { facingMode: { exact: "environment" } },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        disableFlip: true,
      },
      (decodedText) => {
        qr.stop();
        setResult(decodedText);
        callWebhook(decodedText);
      },
      () => {}
    );
  };

  const callWebhook = async (code) => {
    try {
      const res = await fetch("https://YOUR_WEBHOOK_URL", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          source: "react-qr-scan",
          time: new Date().toISOString(),
        }),
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      alert("Lỗi gọi webhook");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <h2>📷 Quét QR / Barcode</h2>

      <button onClick={startScan}>Bắt đầu quét</button>

      <div
        id="reader"
        style={{
          width: 320,
          margin: "16px auto",
          border: "3px solid #4caf50",
          borderRadius: 12,
        }}
      />

      {result && <p>✅ Mã quét: {result}</p>}

      {data && (
        <div>
          <h3>📦 Kết quả</h3>
          <p>Sản phẩm: {data.product}</p>
          <p>Giá: {data.price}</p>
          <p>Tồn kho: {data.stock}</p>
        </div>
      )}
    </div>
  );
}
