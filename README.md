# Water Tracking API

Simple API used to track water intake.

Fun weekend afternoon project with ChatGPT learning how to better utilize the Serverless framework to release a simple API with DynamoDB storage.

## Getting Started

```bash
npm install
```

### Prerequesites

- AWS CLI
  - [Installed and configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)
  - Proper AWS permissions setup
    - `serverless deploy` will tell you what's wrong; better security later

## Test Locally

```bash
serverless offline start
```

## Deploy (dev)

```bash
serverless deploy
```

## Endpoints

- `POST http://localhost:3000/dev/add [NUMBER]`
- `GET http://localhost:3000/dev/all`
- `GET http://localhost:3000/dev/today`
- `GET http://localhost:3000/dev/range?start=[YYYY-MM-DD]&end=[YYYY-MM-DD]`
