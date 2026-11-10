.PHONY: test check fmt

test:
	uv run pytest

check:
	uv run ruff check .
	uv run black --check .
	uv run isort --check .
	uv run ty check

fmt:
	uv run isort .
	uv run black .
	uv run ruff check --fix .
