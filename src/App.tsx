import { useEffect, useRef, useState } from "react"
import { Html5Qrcode,Html5QrcodeSupportedFormats } from "html5-qrcode"


type Product = {
  product: string
  price: number
  stock: number
}

export default function App() {
  const qrRef = useRef<HTMLDivElement>(null!)
  const qrScannerRef = useRef<Html5Qrcode | null>(null)

  const [result, setResult] = useState("")
  const [data, setData] = useState<Product | null>(null)

  const startScan = async () => {
    if (!qrScannerRef.current) {
      qrScannerRef.current = new Html5Qrcode("qr-reader")
    }

    const onScanSuccess = async (decodedText: string) => {
  setResult(decodedText)

  if (qrScannerRef.current) {
    await qrScannerRef.current.stop()
    await qrScannerRef.current.clear()
    qrScannerRef.current = null
  }

  await callWebhook(decodedText)
}
    await qrScannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, 
        Html5QrcodeSupportedFormats.CODE_128]  
      },
      onScanSuccess ,() => {}
    )
  }

  const callWebhook = async (code: string) => {
    const res = await fetch("https://eclatduteint.vn/webhook-test/qrcode", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })

    const json: Product = await res.json()
    setData(json)
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

      <div id="qr-reader" ref={qrRef} style={{ width: 300, marginTop: 20 }} />

      {result && <p>Code: {result}</p>}

      {data && (
        <div>
          <p>Product: {data.product}</p>
          <p>Price: {data.price}</p>
          <p>Stock: {data.stock}</p>
        </div>
      )}
    </div>
  )
}
