# SAPPORO-web

[![Apache License](https://img.shields.io/badge/license-Apache%202.0-orange.svg?style=flat&color=important)](http://www.apache.org/licenses/LICENSE-2.0)

<img src="https://raw.githubusercontent.com/ddbj/SAPPORO/master/logo/SAPPORO-Web.svg" width="400" style="display: block; margin-left: auto; margin-right: auto;" alt="SAPPORO-web logo">

Web base management system for GA4GH WES

## Production

```bash
# install dependencies
$ yarn install

# build for production and launch server
$ yarn build
$ yarn start

# Access localhost:3000 in your browser
```

### Using Docker

```bash
$ docker-compose up -d

# Access localhost:3000 in your browser
```

## Development

```bash
# serve with hot reload at localhost:3000
$ yarn dev
```

### Using Docker

```bash
$ docker-compose -f docker-compose.dev.yml up -d

$ docker-compose -f docker-compose.dev.yml exec app yarn dev

# Access localhost:3000 in your browser
```

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0). See the [LICENSE](https://github.com/ddbj/SAPPORO-web/blob/master/LICENSE).
