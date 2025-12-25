import { useEffect, useRef, useState } from "react"
import { Html5Qrcode,Html5QrcodeSupportedFormats } from "html5-qrcode"


//type Product = {
 // product: string
 // price: number
 // stock: number
//}

export default function App() {
  const qrRef = useRef<HTMLDivElement>(null!)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrScannerRef = useRef<Html5Qrcode | null>(null)

  const [result, setResult] = useState("")
  const [data, setData] = useState<{ barcode: string; tensanpham: string; quantity: number }[]>(
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

  const callWebhook = async (code: string) => {
  try {
    const url = `https://eclatduteint.vn/webhook/qrcode?code=${encodeURIComponent(code)}`

    const res = await fetch(url, {
      method: "GET",
    })

     const json = await res.json()
    console.log("Webhook raw json:", json)

    if (!Array.isArray(json) || json.length === 0) {
      console.error("Webhook trả về không đúng format")
      setData([])
      return
    }

     const mappedData = json.map(item => ({
      barcode:item.barcode,
      tensanpham: item.tensanpham,
      quantity: item.quantity,
      //stock: item.Stock,
    }))
    
    setData(mappedData)
    


  } catch (err) {
    console.error(err)
  }
}
const handleCapture = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append("image", file)
  formData.append("barcode", result)

  await fetch(
    "https://script.google.com/macros/s/AKfycbzOhTBK0dg9LrRq3IX2JNtLHoCz4xbN6zwyDa3p5GnkkNQZDsGhmkBJKRqpDpFFKQwZ/exec", // 🔴 URL Google Script
    {
      method: "POST",
      body: formData,
    }
  )

  alert("✅ Đã lưu hình sản phẩm")
}
 
  useEffect(() => {
    return () => {
      qrScannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
  <div style={{ padding: 20 }}>
    <h2>QR / Barcode Scanner</h2>

    <button onClick={startScan}>Quét QR</button>

    <div
      id="qr-reader"
      ref={qrRef}
      style={{ width: 300, height: 260, marginTop: 20 }}
    />

    {result && <p>Code: {result}</p>}

    {data.map((item, index) => (
      <div key={index}>
        <p>Mã sản phẩm: {item.barcode}</p>
        <p>Tên sản phẩm: {item.tensanpham}</p>
        <p>Số lượng: {item.quantity}</p>
      </div>
    ))}

    {/* 👉 NÚT CHỤP HÌNH – CHỈ HIỆN KHI CÓ DATA */}
    {data.length > 0 && (
      <div style={{ marginTop: 20 }}>
        <button onClick={() => fileInputRef.current?.click()}>
          📸 Chụp hình sản phẩm
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handleCapture}
        />
      </div>
    )}
  </div>
)

}
