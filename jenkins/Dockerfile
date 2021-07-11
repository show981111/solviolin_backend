FROM jenkins/jenkins:lts

USER root

RUN apt-get update

# docker install
RUN curl -fsSL https://get.docker.com/ | sh

# docker-compose install
RUN curl -L "https://github.com/docker/compose/releases/download/1.25.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
    chmod +x /usr/local/bin/docker-compose