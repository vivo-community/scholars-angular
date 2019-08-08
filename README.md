[![Build Status](https://travis-ci.org/vivo-community/scholars-angular.svg?branch=master)](https://travis-ci.org/vivo-community/scholars-angular)
[![Coverage Status](https://coveralls.io/repos/github/vivo-community/scholars-angular/badge.svg?branch=master)](https://coveralls.io/github/vivo-community/scholars-angular?branch=master)

# VIVO Scholars Angular UI

## Docker Deployment

1. Configure [environment.prod.ts](https://github.com/vivo-community/scholars-angular/blob/master/src/environments/environment.prod.ts)
2. Build the image
```bash
  docker build -t scholars-angular .
```
3. Deploy the container
```bash
  docker run -p 4200:4200 scholars-angular
```
