docker buildx build --platform linux/amd64 --push --tag bitcoinize/boltcard-lnbits-balance-check .

docker stop boltcard-lnbits-balance-check && docker rm boltcard-lnbits-balance-check && docker pull bitcoinize/boltcard-lnbits-balance-check && docker run -it -d -p 0.0.0.0:4020:3200 --restart unless-stopped --name boltcard-lnbits-balance-check bitcoinize/boltcard-lnbits-balance-check