# Build stage
FROM node:20-alpine as build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Pass the API Key as a build argument
ARG VITE_GEMINI_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy the custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build files from build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 8080 (Standard for Cloud Run)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
