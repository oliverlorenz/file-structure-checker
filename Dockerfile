FROM node:lts-alpine3.9
RUN npm config set unsafe-perm=true && \
    npm install -g file-structure-checker && \
	mkdir /volume
WORKDIR /volume

ENTRYPOINT file-structure-checker
