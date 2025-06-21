FROM emscripten/emsdk:latest

RUN apt-get update && apt-get install -y \
    git \
    cmake \
    python3 \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/WebAssembly/binaryen.git /binaryen && \
    cd /binaryen && \
    cmake . && \
    make -j$(nproc) && \
    make install

WORKDIR /work
