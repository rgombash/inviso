FROM ubuntu:latest
COPY . /usr/src/inviso
WORKDIR /usr/src/inviso
RUN apt-get update
RUN apt-get install -y maven
RUN mvn clean compile assembly:single
CMD ["java", "-cp", "target/inviso-1.0-SNAPSHOT-jar-with-dependencies.jar","ProxyService"]
EXPOSE 4567
