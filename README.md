# CrateDB / Express Spatial Data Demo

If you just want to try this in the cloud without installing it locally, head over to [shippingforecast.simonprickett.dev](https://shippingforecast.simonprickett.dev/).

## Getting Started

Start a local instance of CrateDB with Docker.

```shell
docker-compose up
```

Create the required database schema and load the sample data.

```shell
crash --host 'http://localhost:4200' < init.sql
```

Install the Node/Express application dependencies.

```shell
npm install
```

Start the application.

```shell
npm run dev
```

Navigate to CrateDB Admin to explore the database schema and sample data.

```shell
open http://localhost:4200/
```
