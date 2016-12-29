# VaxBot

A simple bot to play [Vax](http://vax.herokuapp.com/game) ([GitHub](https://github.com/salathegroup/VaxGame))


## Build Instructions

The only dependency is [NetworkX](https://networkx.github.io/), which can be installed via pip:

```
pip3 install networkx
```
Then, `jupyter notebook` opens a Jupyter Notebook in your browser.

Alternatively, using the provided Dockerfile:

```
cd VaxBot
docker build -t vax-python .
docker run -v path-to-directory/VaxBot:/VaxBot -p 8888:8888 vax-python
```

Follow the link from the docker output and a jupyter notebook will open in your browser!
