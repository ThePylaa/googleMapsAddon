FROM node:latest

COPY . /opt/website/

WORKDIR /opt/website/

RUN npm install -f

RUN npm run build

EXPOSE 3000

CMD ["npm","start"]