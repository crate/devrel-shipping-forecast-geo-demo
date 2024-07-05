# CrateDB / Express Spatial Data Demo

## Introduction  

This is a quick demo showing geospatial functionality in [CrateDB](https://cratedb.com/).  Click on the map to drop a marker in the waters around the British Isles then hit search to find out which [Shipping Forecast](https://en.wikipedia.org/wiki/Shipping_Forecast) region your marker is in.  

Add more markers to plot a course or draw a polygon then hit search again to see which regions you're traversing.  

Hover over a region to see the shipping forecast for it (data isn't real time, so don't use this to plan a voyage)!

![Demo showing an example polygon search](shippingforecast.gif)

## Prerequisites

You'll need to install the following to try this project locally:

- [Git command line tools](https://git-scm.com/downloads) (optional - if you don't have these, just get a Zip file from GitHub instead).
- [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- [Node.js](https://nodejs.org/) (version 18 or higher - I've tested this with version 18.18.2).
- [Crash](https://cratedb.com/docs/crate/crash/en/latest/getting-started.html#installation) - the shell tool for CrateDB.
- A modern browser.  I've tested this with [Google Chrome](https://www.google.com/chrome/).

## Getting Started

Begin by cloning the source code repository from GitHub onto your local machine (if you chose to download the repository as a Zip file, unzip it instead).  

Be sure to change directory into the newly created `cratedb-demo` folder afterwards.

```shell 
git clone https://github.com/simonprickett/cratedb-demo.git
cd cratedb-demo
```

The application keeps a couple of configurable values in an environment file.  Create a file called `.env` by copying the example file provided:

```shell
cp env.example .env
```

You shouldn't need to change any of the default values in this file.

Next, start a local instance of CrateDB with Docker.

```shell
docker-compose up -d
```

Once the Docker container is up and running your next steps are to create the required database schema and load the sample data.

```shell
crash --host 'http://localhost:4200' < init.sql
```

Now install the Node/Express application's dependencies.

```shell
npm install
```

You can now start the application.

```shell
npm run dev
```

Point your browser at the following URL to interact with the application:

```
http://localhost:3000
```

**Optional:** Navigate to CrateDB Admin to explore the database schema and sample data.

```
http://localhost:4200/
```

## Using the Application

The application is map based... you'll see a map of the British Isles and surrounding seas.  You can move around the map and zoom in and out using the usual controls.

Click on the map to drop a marker. If you click "Search", the application will determine which (if any) Shipping Forecast region your marker is in and will outline that region on the map for you.  Hover over the region to see details of its forecast (details are rerpresentative example data).

Alternatively, drop some more markers on the map to build up a course around the British Isles.  Click "Search" to see which Shipping Forecast regions your planned course passes through.  

Click the "Polygon" button to switch to polygon mode.  Draw a polygon search area then click "Search" to see which Shipping Forecast regions interest with your search area.

Click "Reset" to clear markers from the map and start again, or adjust your existing markers and click "Search".

## Shutting Down

To stop the application, press `Ctrl-C`.

Stop the container running CrateDB like so:

```
docker-compose down
```

## Optional: Extra Configuration

The application has two configurable parameters.  Their values are stored in the `.env` file.  They are:

* `PORT` - the port number that the front end runs on.  This defaults to 3000, change it if you'd like to use another port.
* `CRATE_URL` - the URL that the application uses to connect to CrateDB.  This defaults to `http://localhost:4200`.  If you'd like to use the cloud version of CrateDB, sign up here then change the URL value to point to your cloud instance, supplying your username and password.  Example URL format: ```https://USER_NAME:PASSWORD@CLOUD_HOST_NAME:4200```.
