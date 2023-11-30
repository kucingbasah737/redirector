# REDIRECTOR - Simple but usable web redirect (url shortener) service

- [REDIRECTOR - Simple but usable web redirect (url shortener) service](#redirector---simple-but-usable-web-redirect-url-shortener-service)
  - [Requirements](#requirements)
  - [Installation](#installation)
  - [Configuration](#configuration)
    - [Hostname](#hostname)
  - [Running](#running)
    - [Dev](#dev)
    - [Production](#production)
  - [Update](#update)
  - [GEOIP-LITE Database](#geoip-lite-database)
  - [Use reverse proxy](#use-reverse-proxy)
  - [Need Help?](#need-help)
  - [License](#license)
  - [Changelog](#changelog)
  - [Donate](#donate)
  - [Domain Donation](#domain-donation)

## Requirements
- nodejs (tested on v18 and v20, older nodejs might not work)
- npm
- mariadb (do not use mysql because it use some mariadb specific syntax which are not compatible with mysql)
- redis (to save session data)
- modern linux distribution (2023)

## Installation
```
git clone https://github.com/kucingbasah737/redirector.git
cd redirector
npm ci
```

Do not run "npx db-migrate up" at this step before you create correct **.env** file.

## Configuration
Please copy "[sample.env](./sample.env)" file to ".env" file and change with your configurations.

Create user and database to use on your mariadb server, and don't forget to change database these parameters on **.env" file:
```
MYSQL_SOCKET_PATH=
MYSQL_HOST=
MYSQL_PORT=
MYSQL_DATABASE=
MYSQL_USER=
MYSQL_PASSWORD=
```

MYSQL_SOCKET_PATH is optional but recommended.

After you make adjustment on **.env**, run this to init database schema:
```
npx db-migrate up
```

### Hostname
You must register hostnames to serve by this redirector service by running:
```
./index.js insert-hostname
```

You can list registered hostnames by running:
```
./index.js hostname-list
```

## Running
Make sure you have modified **.env** file to match your environtment.

### Dev
```
npm run dev
```

### Production
```
npm start
```

Open your browser and open the url using specified port at WEB_PORT environment variable.
Default user is admin and default password is admin.

You can change user password by running:
```
./index.js update-password
```

And to add a new user:
```
./index.js add-user
```

## Update
```
npm run update
```

## GEOIP-LITE Database
**NOTE:** You MUST update the data files after installation. The MaxMind license does not allow us to distribute the latest version of the data files with this package.

To update GeoLite database, please set MAXMIND_LICENSE_KEY on .env file, and then run:
```
./update-geoip-database.sh
```

## Use reverse proxy
Set "WEB_TRUST_PROXY=" on your **.env** file. Example:

```
WEB_TRUST_PROXY=loopback
```

Please see https://expressjs.com/en/api.html#trust.proxy.options.table and https://expressjs.com/guide/behind-proxies.html.

Your trusted proxy must specified as comma-separated on WEB_TRUST_PROXY.

Cloudflare IPs are trusted automatically by this app. No need to specify those on WEB_TRUST_PROXY.

But if you use other reverse proxy (we recommend [caddy](https://caddyserver.com) for easy config),
don't forget to specify these IP on your reverse proxy.

This is an example to trust Cloudflare IPs on caddy:
```
{
    servers {
        trusted_proxies static 173.245.48.0/20 103.21.244.0/22 103.22.200.0/22 103.31.4.0/22 141.101.64.0/18 108.162.192.0/18 190.93.240.0/20 188.114.96.0/20 197.234.240.0/22 198.41.128.0/17 162.158.0.0/15 104.16.0.0/13 104.24.0.0/14 172.64.0.0/13 131.0.72.0/22 2400:cb00::/32 2606:4700::/32 2803:f800::/32 2405:b500::/32 2405:8100::/32 2a06:98c0::/29 2c0f:f248::/32
    }
}
```

Or you can use 'WEB_USE_CF_CONNECTING_IP=yes" to force use cf-connecting-ip from header as request ip,
but we don't recommend it and there is plan to remove WEB_USE_CF_CONNECTING_IP method from our code in the future.

## Need Help?
Please post
[issue](https://github.com/kucingbasah737/redirector/issues)
or [discussion](https://github.com/kucingbasah737/redirector/discussions)
on github.

## License
This software licensed under MIT License. Feel free to use it.

## Changelog
See [CHANGELOG.md](./CHANGELOG.md) file.

## Donate
You can use this software freely. You can also modified it. But of course we love donation.
You can donate this project by sending to these cryptocurrency addresses:
- XMR (monero): 84Qosqtc46cC6gfgjhdNxpdT86VnsLVYoF9KTs53QdYMEPxsPbh2zJ4D8owj1M1aj2fiRsNpC8aZE4Xro5AtVkm3Jky4xGr
  ([QR](./public/img/redirector-xmr-donate.png))
- XNO (nano): nano_3kucingsf315nsym3whdtea86hy7ighetdyseuczue9p8j15pm8bx99beafa
  ([QR](./public/img/redirector-xno-donate.png))

But remember, donation is not a must. It will just makes us more happy to keep develop and maintain this application.

## Domain Donation
You can also donate your domain name to us, so we can serve your domain in our redirector service.
Please post on github's [issue](https://github.com/kucingbasah737/redirector/issues)
or [discussion](https://github.com/kucingbasah737/redirector/discussions).
