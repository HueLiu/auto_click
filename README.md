# 'clicks'

## Install 'clicks'

```shell
cd /path/to/clicks
npm install
cp .env.example .env
vim .env # Replace all the `TO_BE_FILLED` with proper values
node ./src/app.js
```

### Run under PM2

We use [PM2](https://pm2.keymetrics.io/docs/usage/quick-start/) to automatically restart `playwright`.

#### Install pm2

```shell
npm global install pm2
```

#### Acting on Configuration File

```shell
cd /path/to/playwright
pm2 start ecosystem.config.json # Start all applications
pm2 logs # view all apps logs
pm2 stop ecosystem.config.json # Stop all
pm2 restart ecosystem.config.json # Restart all
pm2 reload ecosystem.config.json # Reload all
pm2 delete ecosystem.config.json # Delete all
```

#### Act on a specific process

```shell
pm2 start ecosystem.config.json --only s1
pm2 start ecosystem.config.json --only "s2,s3"
pm2 logs s1
```

- The `--only` option works for start/restart/stop/delete as well
