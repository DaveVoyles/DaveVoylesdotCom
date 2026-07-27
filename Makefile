# davevoyles.com — common agent/human tasks
.PHONY: submodules preview build check list-future list-tags help video-draft video-render video-upload

help:
	@echo "make submodules      - init PaperMod theme"
	@echo "make preview         - hugo server -D -F (drafts + future)"
	@echo "make build           - production hugo --minify"
	@echo "make check           - content gates (topics, covers, claims, links)"
	@echo "make list-future     - posts waiting on publish date"
	@echo "make list-tags       - unique tags in content/posts"
	@echo "make video-draft     - draft video narrative from source post"
	@echo "make video-render    - render video from scenes.json (SCENES=<path>)"
	@echo "make video-upload    - upload rendered video to destination"

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

video-draft:
	@echo "video-draft: not yet implemented (plan 0006/D5)" >&2
	@exit 1

video-render:
	@if [ -z "$(SCENES)" ]; then echo "error: SCENES=<path> required" >&2; exit 1; fi
	@if [ "$$(realpath $(SCENES))" != "$$(realpath tools/video/scenes.json)" ]; then cp "$(SCENES)" tools/video/scenes.json; fi
	@cd tools/video && bash build_video.sh all
	@echo "Video rendered to tools/video/out/"

video-upload:
	@echo "video-upload: not yet implemented (plan 0006/D7)" >&2
	@exit 1
