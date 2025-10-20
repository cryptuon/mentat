.PHONY: help install dev migrate upgrade downgrade db-init test lint format clean

help:
	@echo "Mentat Backend - Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Run development server"
	@echo "  make migrate    - Create new migration"
	@echo "  make upgrade    - Apply migrations"
	@echo "  make downgrade  - Rollback last migration"
	@echo "  make db-init    - Initialize database with Aerich"
	@echo "  make test       - Run tests"
	@echo "  make lint       - Run linter"
	@echo "  make format     - Format code"
	@echo "  make clean      - Clean cache files"

install:
	pip install -r requirements.txt

dev:
	uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

migrate:
	@read -p "Migration name: " name; \
	aerich migrate --name "$$name"

upgrade:
	aerich upgrade

downgrade:
	aerich downgrade

db-init:
	aerich init-db

test:
	pytest tests/ -v

test-cov:
	pytest tests/ --cov=src --cov-report=html

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
