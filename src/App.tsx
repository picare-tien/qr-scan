import { useEffect, useRef, useState } from "react"
import { Html5Qrcode,Html5QrcodeSupportedFormats } from "html5-qrcode"


//type Product = {
 // product: string
 // price: number
 // stock: number
//}

export default function App() {
  const qrRef = useRef<HTMLDivElement>(null!)
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
      { fps: 5, qrbox: { width: 250, height: 120 },
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
 
  useEffect(() => {
    return () => {
      qrScannerRef.current?.stop().catch(() => {})
    }
  }, [])

  return (
  <div style={styles.container}>
    <h2 style={styles.title}>📷 QR / Barcode Scanner</h2>

    <div style={styles.card}>
      <button style={styles.scanButton} onClick={startScan}>
        🔍 Bắt đầu quét
      </button>
    </div>

    <div style={styles.card}>
      <div id="qr-reader" ref={qrRef} style={styles.camera} />
    </div>

    {result && (
      <div style={styles.card}>
        <p style={styles.label}>Mã quét được</p>
        <p style={styles.code}>{result}</p>
      </div>
    )}

    {data.map((item, index) => (
      <div key={index} style={styles.card}>
        <p><b>Mã sản phẩm:</b> {item.barcode}</p>
        <p><b>Tên sản phẩm:</b> {item.tensanpham}</p>
        <p><b>Số lượng:</b> {item.quantity}</p>
      </div>
    ))}
  </div>
)
}
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: 16,
    maxWidth: 420,
    margin: "0 auto",
  },
  title: { textAlign: "center", marginBottom: 16 },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  },
  scanButton: {
    width: "100%",
    padding: 14,
    fontSize: 16,
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 10,
  },
  camera: { width: "100%", height: 260,maxWidth:320, margin: "0 auto" },
  label: { fontSize: 13, color: "#666" },
  code: { fontSize: 18, fontWeight: 600 },
}

