FROM node:14-buster as base
# Create project directory
WORKDIR /opt/cric/frontend
# Install app dependencies
COPY package*.json ./
RUN npm install --production && npm cache clean --force
# Set PATH
ENV PATH /opt/cric/frontend/node_modules/.bin:$PATH
# Expose port. Otherwise, we will have "This site can’t be reached"
# https://stackoverflow.com/a/46779529
EXPOSE 4200
LABEL   version="2.10.2-base" \
        description="Frontend in Angular for CRIC Searchable Image Database" \
        maintainer="raniere@rgaiacs.com"

FROM base as development
RUN npm install && npm cache clean --force
LABEL   version="2.10.2-development"

FROM development as builder
ARG CRIC_DOMAIN="https://database.cric.com.br"
ARG CRIC_API_DOMAIN="https://api.database.cric.com.br"
ARG CRIC_EMAIL="cric@ufop.edu.br"
ARG CRIC_PLAYGROUND=false
COPY . ./
RUN ng build --prod --build-optimizer
LABEL   version="2.10.2-builder"

# Build a small nginx image with static website
FROM nginx:alpine as production
COPY nginx.conf /etc/nginx/nginx.conf
# --from sets the source location to a previous build stage
COPY --from=builder /opt/cric/frontend/dist/cric /usr/share/nginx/html
EXPOSE 80
LABEL   version="2.10.1-production"
