# --- Build Stage ---
    FROM node:18 AS build-stage

    # Set working directory
    WORKDIR /app
    
    # Copy project files
    COPY package*.json ./
    COPY . .
    
    # Install dependencies
    RUN npm install
    
    # Build the Vue app
    RUN npm run build
    
    # --- Production Stage ---
    FROM nginx:stable-alpine AS production-stage
    
    # Copy built files from previous stage
    COPY --from=build-stage /app/dist /usr/share/nginx/html
    
    # Copy custom Nginx config
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    # Expose port 80
    EXPOSE 80
    
    # Start Nginx
    CMD ["nginx", "-g", "daemon off;"]
    