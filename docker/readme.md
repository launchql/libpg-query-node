# 0 build on mac first

build the binary on mac 

```sh
yarn
```

# 1 build and run the docker image

```sh
docker run --mount type=bind,source="$(pwd)"/libpg_query,target=/pg_query --rm -it $(docker build -q --file docker/Dockerfile .)
```

# publishing from inside 

```sh
mkdir git && cd git && git clone https://github.com/pyramation/libpg-query-node
cd libpg-query-node/
yarn

# get the OSX version you build before...
cp /pg_query/osx/libpg_query.a ./libpg_query/osx/

# add your creds real quick... (look in your ~/.npmrc)
vi .npmrc
vi package.json
npm publish
```

# building libpg_query

not necessary, but for fun:

```sh
mkdir git
cd git/
git clone git clone git@github.com:pganalyze/libpg_query.git
git clone git@github.com:pganalyze/libpg_query.git
git clone https://github.com/pganalyze/libpg_query.git
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
