![Node CI with NPM](https://github.com/TAMULib/scholars-angular/workflows/Node%20CI%20with%20NPM/badge.svg)
[![Coverage Status](https://coveralls.io/repos/github/TAMULib/scholars-angular/badge.svg?branch=tamu-master)](https://coveralls.io/github/TAMULib/scholars-angular?branch=tamu-master)

# scholars-angular

Scholars Angular is a frontend application for exposing VIVO content that is being served via [Scholars Discovery](https://github.com/vivo-community/scholars-discovery).

## Installation

### Prerequisites

In addition to having [Docker](https://docs.docker.com/) installed, a running [Scholars Discovery](https://github.com/vivo-community/scholars-discovery) is also required.


### Docker Deployment

1. [Install](https://docs.docker.com/install/) Docker
1. Start [Scholars Discovery](https://github.com/vivo-community/scholars-discovery#installation-instructions)
1. Build the image
   ```bash
    docker build -t scholars/angular .
   ```
1. Deploy the container
```bash
  docker run -d -p 4200:4200 \
  -e HOST=localhost \
  -e PORT=4200 \
  -e BASE_HREF=/ \
  -e SERVICE_URL="http://localhost:9000" \
  -e EMBED_URL="http://localhost:4201" \
  -e VIVO_URL="http://localhost:8080/vivo" \
  -e VIVO_EDITOR_URL="http://localhost:8080/vivo_editor" \
  -e COLLECT_SEARCH_STATS=true \
  scholars/angular
```

> Above environment variables passed into the container are defaults. URLs must be enclosed in double quotes. BASE_HREF must start and end with a forward slash.

### Verify Installation 

A successful installation should result in the Scholars Angular site at:
[http://localhost:4200/](http://localhost:4200)
