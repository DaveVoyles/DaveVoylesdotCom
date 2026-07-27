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
	@if [ -z "$(POST)" ]; then echo "error: POST=<slug> required" >&2; exit 1; fi
	@python3 tools/video/draft_scenes.py --post "$(POST)"

video-render:
	@if [ -z "$(SCENES)" ]; then echo "error: SCENES=<path> required" >&2; exit 1; fi
	@if [ "$$(realpath $(SCENES))" != "$$(realpath tools/video/scenes.json)" ]; then cp "$(SCENES)" tools/video/scenes.json; fi
	@cd tools/video && bash build_video.sh all
	@cd tools/video && .venv/bin/python probe.py final
	@echo "Video rendered to tools/video/out/ (mechanical acceptance probe passed)"

video-upload:
	@if [ -z "$(MP4)" ]; then echo "error: MP4=<path> required" >&2; exit 1; fi
	@cd tools/video && .venv/bin/python upload_video.py "$(MP4)"
