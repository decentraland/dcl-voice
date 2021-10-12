
ifneq ($(CI), true)
LOCAL_ARG = --local --verbose --diagnostics
endif

test:
	node_modules/.bin/jest --detectOpenHandles --colors --runInBand $(TESTARGS)

test-watch:
	node_modules/.bin/jest --detectOpenHandles --colors --runInBand --watch $(TESTARGS)

build:
	./node_modules/.bin/tsc -p tsconfig.json

watch:
	./node_modules/.bin/tsc -p tsconfig.json --watch

lint:
	node_modules/.bin/tslint --project tsconfig.json

.PHONY: build test
