FROM ubuntu:latest

ENV LANGUAGE en_US.UTF-8
ENV LANG en_US.UTF-8
ENV PYTHONIOENCODING UTF-8

RUN echo "deb http://downloads.skewed.de/apt/xenial xenial universe" >> /etc/apt/sources.list
RUN echo "deb-src http://downloads.skewed.de/apt/xenial xenial universe" >> /etc/apt/sources.list
RUN apt-get update && apt-get install -y --allow-unauthenticated \
    gcc \
    python3 \
    python3-graph-tool \
    ca-certificates \
    python3-setuptools
RUN easy_install3 pip
RUN pip3 install jupyter
RUN echo "jupyter notebook --ip=0.0.0.0" > jupyter.sh
RUN chmod +x jupyter.sh

EXPOSE 8888

CMD ["sh", "jupyter.sh"]