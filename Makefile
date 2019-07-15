SRC     = src/faint.js
PLUGINS = $(wildcard src/plugins/*.js)

build: faint.min.js faint.sourcemap

faint.min.js: $(SRC) $(PLUGINS) Makefile
	webpack --output $@ \
	    --mode production \
	    -d \
	    --output-source-map-filename faint.sourcemap \
	    $(SRC) \
	    $(PLUGINS)


clean:
	rm -fr \
	    faint.min.js \
	    faint.sourcemap
