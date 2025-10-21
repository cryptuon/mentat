.PHONY: help install test test-scout test-draft test-validator test-orchestrator lint format clean

help:
	@echo "Mentat AI Agents - Available commands:"
	@echo "  make install           - Install dependencies"
	@echo "  make test              - Run all tests"
	@echo "  make test-scout        - Test Scout agent"
	@echo "  make test-draft        - Test Draft agent"
	@echo "  make test-validator    - Test Validator agent"
	@echo "  make test-orchestrator - Test orchestrator"
	@echo "  make lint              - Run linter"
	@echo "  make format            - Format code"
	@echo "  make clean             - Clean cache files"

install:
	pip install -r requirements.txt

test:
	pytest tests/ -v

test-scout:
	python -m src.agents.scout

test-draft:
	python -m src.agents.draft

test-validator:
	python -m src.agents.validator

test-orchestrator:
	python -m src.orchestrator

lint:
	ruff check src/

format:
	ruff format src/

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov/
	rm -f .coverage
	rm -f *.log
