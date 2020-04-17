FROM node:10.20.1
LABEL maintainer "parking_system"
WORKDIR /parkingapp
COPY parking_system /parkingapp
RUN npm install

EXPOSE 3000
CMD ["npm", "start"]
