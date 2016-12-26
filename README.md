# VaxBot

A simple bot to play [Vax](http://vax.herokuapp.com/game) ([GitHub](https://github.com/salathegroup/VaxGame))


## Build Instructions

```
cd VaxBot
docker build -t vax-python .
docker run -v path-to-directory/VaxBot:/VaxBot -p 8888:8888 vax-python
```

Follow the link from the docker output and a jupyter notebook will open in your browser!

