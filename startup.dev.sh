#!/usr/bin/env bash
set -e

./wait-for-it.sh db:3306
npm run migration:run
npm run seed:run
npm run start:prod
