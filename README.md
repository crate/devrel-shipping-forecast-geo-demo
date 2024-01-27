# CrateDB / Express spatial data demo


## Walkthrough

Start services.
```shell
docker-compose up
```

Provision database.
```shell
crash --host 'http://localhost:4200' < init.sql
```

Navigate to CrateDB Admin.
```shell
open http://localhost:4200/
```

Start Express application.
```shell
npm install
npm run dev
```
