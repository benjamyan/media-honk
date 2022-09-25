# Start the dev env for node app
# cd ./client && npm run dev && cd ../api && npm run dev

# https://hub.docker.com/_/mysql

# start docker 
# docker run --name media-lan-docker -v /home/benjamyan/Working/media-server/docker-dump/mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=password -d mysql:8
docker run --name media-lan-docker -v /home/benjamyan/Working/media-server/docker-dump/mysql-data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=password -d mysql:8


# run compose stack
# docker-compose up

# enable bash cmd for mysql
# docker exec -it media-lan bash

# access bash log
# docker logs some-mysql
