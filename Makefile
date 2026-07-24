# davevoyles.com — common agent/human tasks
.PHONY: submodules preview build check list-future list-tags help

help:
	@echo "make submodules  - init PaperMod theme"
	@echo "make preview     - hugo server -D -F (drafts + future)"
	@echo "make build       - production hugo --minify"
	@echo "make check       - content gates (topics, covers, claims, links)"
	@echo "make list-future - posts waiting on publish date"
	@echo "make list-tags   - unique tags in content/posts"

submodules:
	git submodule update --init --recursive

preview: submodules
	hugo server -D -F --bind 127.0.0.1 --port 1313

build: submodules
	hugo --minify

check:
	./scripts/check-content.sh

list-future: submodules
	hugo list future

list-tags:
	./scripts/list-tags.sh
