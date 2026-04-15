FROM nginx:1.27-alpine

# Remove default nginx config and website
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy portfolio files
COPY index.html /usr/share/nginx/html/
COPY start/ /usr/share/nginx/html/start/
COPY ["Ashad CV White.pdf", "/usr/share/nginx/html/Ashad CV White.pdf"]

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
