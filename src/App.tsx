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
  const [data, setData] = useState<{ product: string; price: number; stock: number }[]>(
    []
  )

  const startScan = async () => {
    if (!qrScannerRef.current) {
      qrScannerRef.current = new Html5Qrcode("qr-reader")
    }

    const onScanSuccess = async (decodedText: string) => {
      console.log("Scaned code: ", decodedText)
  setResult(decodedText)
  await callWebhook(decodedText)

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
      product: item.Product,
      price: item.Price,
      stock: item.Stock,
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
    <div style={{ padding: 20 }}>
      <h2>QR / Barcode Scanner</h2>

      <button onClick={startScan}>Quét QR</button>

      <div id="qr-reader" ref={qrRef} style={{ width: 300, marginTop: 20 }} />

      {result && <p>Code: {result}</p>}
      {data.map((item,index) => (
        <div key={index}>
          <p>Sản phẩm: {item.product}</p>
          <p>Price: {item.price}</p>
          <p>Stock: {item.stock}</p>
        </div>
      ))}
    </div>
  )
}
