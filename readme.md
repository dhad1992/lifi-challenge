# Lifi Events Challenge

## Tech used in this challenge

- Fastify: for a lightning fast API framework
- MongoDB: for the underlying datastore
- Docker-compose: for running locally
- jest for unit tests

## Requirements

- Node.JS 18+
- Docker & Docker Compose
- Network connectivity

## Getting started
`npm install` to install dependencies

## Running locally
This project utilises docker-compose for local development there are two separate containers one for the api and another for scraping blockchain data and inserting the fee collected events into the database
to start run 

`npm run dev`  

## Running tests
`npm run test` to run the unit tests, you do not need to have any containers running for this.

## API Usage
- The API will be available locally on port 8080 currently there is only one endpoint to retrieve events this can be visited at `http://localhost:8080/events`
- There is a default limit of 100 records per page to prevent massive payloads pagination and the number of records can be altered by using the ?page and ?records queryParams example: `http://localhost:8080/events?page=5&records=1000`
- It's possible to filter events by integrator this can be achieved with the ?integrator queryParam example: `http://localhost:8080/events?integrator=xxxxx`

## Notable points
- Make changes to configuration locally by editing the .env_dev file
- Currently, the system scrapes the blockchain in batches of 1000, this can be adjusted by changing the **BLOCK_SCAN_SIZE** variable in `.env_dev`
- The default starting block number is 61500000 however this may take a whilst as its quite old so you may want to consider increasing it to something more recent for testing