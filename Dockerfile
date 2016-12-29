FROM ubuntu:latest

ENV LANGUAGE en_US.UTF-8
ENV LANG en_US.UTF-8
ENV PYTHONIOENCODING UTF-8

RUN apt-get update && apt-get install -y \
    python3 \
    ca-certificates \
    python3-setuptools
RUN easy_install3 pip
RUN pip3 install jupyter
RUN pip3 install networkx
RUN echo "jupyter notebook --ip=0.0.0.0" > jupyter.sh
RUN chmod +x jupyter.sh

EXPOSE 8888

CMD ["sh", "jupyter.sh"]