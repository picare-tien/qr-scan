import {  useRef, useState } from "react"
import { Html5Qrcode,Html5QrcodeSupportedFormats } from "html5-qrcode"


export default function App() {
  const qrRef = useRef<HTMLDivElement>(null!)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrScannerRef = useRef<Html5Qrcode | null>(null)

  const [result, setResult] = useState("")
  const [data, setData] = useState<{ Ngay: string; tenkhachhang: string; SoluongSP: number }[]>(
    []
  )

  const startScan = async () => {
    if (!qrScannerRef.current) {
      qrScannerRef.current = new Html5Qrcode("qr-reader")
    }

    const onScanSuccess = async (decodedText: string) => {
      console.log("Scaned code: ", decodedText)

   if (!qrScannerRef.current) return
    const scanner = qrScannerRef.current
    qrScannerRef.current = null
    await scanner.stop()
    await scanner.clear()
   
  
      setResult(decodedText)
  await callWebhook(decodedText)

  
}
    await qrScannerRef.current.start(
      { facingMode: "environment" },
      { fps: 5, qrbox: { width: 320, height: 120 },
      formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128],
      disableFlip: true,
      } as any,
      onScanSuccess ,() => {}
    )
  }

  // 🔹 GỌI WEBHOOK
  const callWebhook = async (code: string) => {
    try {
      const url = `https://eclatduteint.vn/webhook/qrcode?code=${encodeURIComponent(
        code
      )}`

      const res = await fetch(url)
      const json = await res.json()

      if (!Array.isArray(json) || json.length === 0) {
        setData([])
        alert("❌ Không tìm thấy đơn hàng")
        return
      }

      setData(
        json.map((item) => ({
          Ngay: item.NgayPhieu,
          tenkhachhang: item.tenkhachhang,
          SoluongSP: item.total,
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 CHỤP HÌNH SẢN PHẨM
 const handleCaptureProduct = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]
  if (!file) return

  const reader = new FileReader()

  reader.onloadend = async () => {
    const base64 = (reader.result as string).split(",")[1]

    const formData = new FormData()
    formData.append("image", base64)
    formData.append("barcode", result)

    const res = await fetch(
      "https://script.google.com/macros/s/AKfycbzOhTBK0dg9LrRq3IX2JNtLHoCz4xbN6zwyDa3p5GnkkNQZDsGhmkBJKRqpDpFFKQwZ/exec",
      {
        method: "POST",
        body: formData,
      }
    )

    const text = await res.text()
    alert(text === "OK" ? "✅ Đã lưu hình" : "❌ Lỗi: " + text)
  }

  reader.readAsDataURL(file)
}

  return (
    <div style={{ padding: 20 }}>
      <h2>📷 Chụp Barcode → Tìm đơn</h2>

      {/* NÚT CHỤP BARCODE */}
    <button onClick={startScan}>Quét QR</button>
        📸 Quét barcode
   

          <div
      id="qr-reader"
      ref={qrRef}
      style={{ width: 300, height: 260, marginTop: 20 }}
    />


      {result && <p>Barcode: {result}</p>}

      {data.map((item, index) => (
        <div key={index}>
          <p>Ngày bán: {item.Ngay}</p>
          <p>Tên Khách hàng: {item.tenkhachhang}</p>
          <p>Số lượng sản phẩm: {item.SoluongSP}</p>
        </div>
      ))}

      {/* CHỈ HIỆN KHI CÓ DATA */}
      {data.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={() => fileInputRef.current?.click()}>
            📦 Chụp hình sản phẩm
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={handleCaptureProduct}
          />
        </div>
      )}

      {/* hidden element cho html5-qrcode */}
      <div id="hidden-reader" style={{ display: "none" }} />
    </div>
  )
}
