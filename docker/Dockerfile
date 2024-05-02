FROM node:20-alpine
RUN apk --no-cache add git
RUN apk add --no-cache bash
RUN apk add --no-cache make
RUN apk add --update alpine-sdk
RUN apk --no-cache add python3

ENTRYPOINT ["/bin/bash"]
