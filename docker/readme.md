# 1

run `docker-compose build`

# 2

start the server

```sh
docker run -d \
  -it \
  --name build_pg_query \
  --mount type=bind,source="$(pwd)"/libpg_query,target=/pg_query \
  pyramation/libpg_query
```

# 3

`ssh` into the box

```sh
docker exec -it build_pg_query /bin/bash
```

build it!

```sh
mkdir git
cd git/
git clone git clone git@github.com:lfittl/libpg_query.git
git clone git@github.com:lfittl/libpg_query.git
git clone https://github.com/lfittl/libpg_query.git
cd libpg_query/
make
cp libpg_query.a /pg_query/linux/
```
 
you should see `.a` files now :)

```
libpg_query/
libpg_query//osx
libpg_query//osx/libpg_query.a
libpg_query//osx/.gitkeep
libpg_query//include
libpg_query//include/.gitkeep
libpg_query//include/pg_query.h
libpg_query//linux
libpg_query//linux/libpg_query.a
libpg_query//linux/.gitkeep
libpg_query//windows
libpg_query//windows/.gitkeep
```

make sure you grab the `pg_query.h` if you don't have it ;)
