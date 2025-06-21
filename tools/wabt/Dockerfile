FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --recursive https://github.com/WebAssembly/wabt /wabt && \
    cd /wabt && \
    mkdir build && \
    cd build && \
    cmake .. && \
    cmake --build . && \
    make install

WORKDIR /work
