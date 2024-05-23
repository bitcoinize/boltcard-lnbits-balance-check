import { useEffect, useState, useCallback } from "react"
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import axios from "axios"

import Spinner from './spinner'

const abortController = new AbortController()

const errorAudio = new Audio('error.mp3');
const successAudio = new Audio('success.mp3')

const getNdef = () => {
  if("NDEFReader" in window) {
    return new window.NDEFReader({ signal: abortController.signal })
  }

  return false
}


export default function Page() {
  const [ndef, setNdef] = useState(getNdef())
  const [error, setError] = useState(false)
  const [data, setData] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const scan = async () => {
    if(!ndef) {
      setError("Erro! NFC não suportado neste dispositivo.")
      errorAudio.currentTime = 0
      errorAudio.play()
      return
    }

    try {
      await ndef.scan();

      setData(false)
      setError(false)
      setData("Digitalize seu cartão agora")
      successAudio.currentTime = 0
      successAudio.play()
      setIsScanning(true)

      ndef.onreadingerror = (event) => {
        setData(false)
        setError("Erro! Não é possível ler dados da tag NFC. Tente outro?");
        errorAudio.currentTime = 0
        errorAudio.play()
      };

      ndef.onreading = (event) => {
        setData(false)
        setError(false)
        onReading(event)
      };
    } catch (error) {
      setData(false)
      setError(`Erro! A varredura não conseguiu começar: ${error}.`);
      errorAudio.currentTime = 0
      errorAudio.play()
    }
  }

  const onReading = async (event) => {
    const firstMessage = event.message.records[0]

    if(!firstMessage) {
      setData(false)
      setError("Erro! O cartão não está configurado corretamente.")
      return false
    }
    
    console.log(firstMessage)

    const textDecoder = new TextDecoder()
  
    const url = textDecoder.decode(firstMessage.data)

    console.log(url)

    setData("Verificando seu saldo agora, por favor, espere")

    const response = await axios("/scan", {
      method: "POST",
      data: {
        url,
        uid: event.serialNumber,
      }
    })

    if(response.data.error) {
      errorAudio.currentTime = 0
      errorAudio.play()
      setData(false)
      setError(response.data.message)
    }

    if(response.data.success) {
      successAudio.currentTime = 0
      successAudio.play()

      setData(response.data.data)
      setError(false)
    }
  }

  useEffect(() => {
    // scan()
  }, [])

  return (
    <div className="bg-white">
      <div className="px-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="no-print text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Verifique o saldo do cartão
          </h2>
          <p className="no-print mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600">
            Você pode usar esta página para verificar o saldo do seu cartão.
          </p>
          {!isScanning &&
            <div className="mt-4 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-orange-600 px-5 py-4 text-lg font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                onClick={scan}
                disabled={isScanning || error}
              >
                <span>Verifique agora</span>
              </a>
            </div>
          }
          {error &&
            <div className="mt-4 border-l-4 border-red-400 bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-lg text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          }
          {data && typeof data === 'string' &&
            <div className="mt-4 border-l-4 border-blue-400 bg-blue-50 p-4">
              <p className="text-lg text-blue-700">
                {data}
              </p>
            </div>
          }
          {data && typeof data === 'object' &&
            <div>
              <div className="mt-6 border-l-4 border-green-400 bg-green-50 p-4">
                <p className="text-lg text-green-700">
                  <b>SALDO DO CARTÃO</b>
                  <br />
                  <b>Saldo em sats:</b> {data.satBalance}
                  <br />
                  <b>Saldo em BTC:</b> {data.btcBalance}
                  <br />
                  <b>Saldo em BRL:</b> {data.fiatBalance}
                </p>
              </div>

              <div className="print-only h-4"><span> </span></div>

              <div className="mt-4 border-l-4 border-blue-400 bg-blue-50 p-4">
                <p className="text-lg text-blue-700">
                  <b>PREÇO DE BITCOIN</b>
                  <br />
                  1 BTC = {data.btcRate}
                  <br />
                  1 sat = {data.satRate}
                </p>
              </div>

              <div className="print-only h-4"><span> </span></div>

              <div className="mt-4">
                <b>DATA E HORA DO CONSULTA</b>
                <br />
                {new Date(data.timestamp).toLocaleString('pt-BR', {timezone: "America/Brazil"})}
              </div>

              <div className="print-only h-4"><span> </span></div>

              <div className="mt-4">
                <b>NÚMERO DO CARTÃO</b>
                <br />
                {data.uid?.replaceAll(':', '').toUpperCase()}
              </div>

              <div className="print-only h-4"><span> </span></div>

              <div className="no-print mt-4 flex items-center justify-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-orange-600 px-5 py-4 text-lg font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
                  onClick={() => window.print()}
                >
                  <span>Imprimir</span>
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}