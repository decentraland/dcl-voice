
ifneq ($(CI), true)
LOCAL_ARG = --local --verbose --diagnostics
endif

CONCURRENTLY = node_modules/.bin/concurrently

install:
	npm ci
	$(MAKE) build-lib
	cd test-app; npm i "../." && npm ci

test:
	node_modules/.bin/jest --detectOpenHandles --colors --runInBand $(TESTARGS)

test-watch:
	node_modules/.bin/jest --detectOpenHandles --colors --runInBand --watch $(TESTARGS)

build: | build-lib build-test-app

build-test-app:
	cd test-app; npm run build

build-lib:
	./node_modules/.bin/tsc -p tsconfig.json

watch: build-lib
	@$(CONCURRENTLY) \
		-n "lib,test-app" \
			"make watch-lib" \
			"make watch-test-app"

watch-lib:
	./node_modules/.bin/tsc -p tsconfig.json --watch

watch-test-app:
	@cd test-app; npm start

lint:
	node_modules/.bin/eslint '**/*.{tsx,ts}'

lint-fix:
	node_modules/.bin/eslint '**/*.{tsx,ts}' --fix

.PHONY: build test install
