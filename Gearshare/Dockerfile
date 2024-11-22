
FROM swift:6.0.2-noble

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libxml2-dev \
    libsqlite3-dev \
    libz-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN swift test

