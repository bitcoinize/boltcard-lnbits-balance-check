import express from "express"
import compression from 'compression'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'
import axios from 'axios'
import serveStatic from 'serve-static'
import * as dotenv from 'dotenv'

dotenv.config({ path: './back_end/.env' })

const port = process.env.PORT
const baseUrl = process.env.BASE_URL

const corsOptions = {
  origin: baseUrl,
}

const app = express()
app.use(cookieParser())
app.use(bodyParser.json())
app.use(compression())
app.use(cors(corsOptions))
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "connect-src": ["'self'"],
        "script-src": ["'self'"],
      },
    },
  })
)

const setCustomCacheControl = (res, path) => {
  if (path.indexOf('/build/static/') !== -1) {
    res.setHeader('Cache-Control', 'public, max-age=2419200, immutable')
  } else if(serveStatic.mime.lookup(path) !== 'text/html') {
    res.setHeader('Cache-Control', 'public, max-age=86400')
  }
}

const getRates = async () => {
  const response = await axios('https://api.coingecko.com/api/v3/exchange_rates')

  return response.data.rates.brl
}

app.use(serveStatic('front_end/build', { index: ['index.html'], dotfiles: 'deny', setHeaders: setCustomCacheControl }))

app.post('/scan', async (req, res) => {
  const url = req.body.url
  const uid = req.body.uid

  if(!url) {
    return res.send({error: true, success: false, message: "Erro! O cartão não está configurado corretamente."})
  }

  try {
    const parsedUrl = new URL(url)

    const checkUrl = `https://${parsedUrl.host}${parsedUrl.pathname.replace('/scan/', '/balance/')}${parsedUrl.search}`

    const response = await axios(checkUrl)
    const fiatRate = await getRates()

    const btcRate = Number(fiatRate.value).toLocaleString('pt-BR', {style: "currency", currency: "BRL"})
    const satRate = Number(fiatRate.value / 100000000).toFixed(8).replace('.', ',')

    const satBalance = Math.round(response.data.balance)
    const btcBalance = Number(satBalance / 100000000).toFixed(8)
    const fiatBalance = `${fiatRate.unit} ${Number(btcBalance * fiatRate.value * 0.98).toFixed(2).toLocaleString('pt-BR')}`

    return res.send({
      error: false, 
      success: true, 
      data: {
        satBalance,
        btcBalance,
        fiatBalance,
        btcRate,
        satRate,
        uid,
        timestamp: new Date().toISOString(),
      }
    })
  } catch(e) {
    console.log(e)
    return res.send({error: true, success: false, message: "Erro! Algo inesperado aconteceu."})
  }
})
const server = app.listen(port, '0.0.0.0', () => console.log("Listening on port", port))
server.setTimeout(1000 * 60 * 9)