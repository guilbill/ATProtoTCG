# AT-Proto Trading Card Game - Development Makefile
# Quick commands for development workflow

.PHONY: help install dev build start lint clean test deps-check setup all

# Default target
.DEFAULT_GOAL := help

## Show this help message
help:
	@echo "AT-Proto TCG Development Commands"
	@echo "================================="
	@echo ""
	@echo "Setup & Dependencies:"
	@echo "  setup      - Complete project setup (install + deps check)"
	@echo "  install    - Install all dependencies"
	@echo "  deps-check - Check for outdated dependencies"
	@echo ""
	@echo "Development:"
	@echo "  dev        - Start development server with Turbopack"
	@echo "  build      - Build production version"
	@echo "  start      - Start production server"
	@echo "  lint       - Run ESLint"
	@echo ""
	@echo "Maintenance:"
	@echo "  clean      - Clean build artifacts and node_modules"
	@echo "  test       - Run tests (placeholder for future)"
	@echo "  all        - Full rebuild (clean + install + build)"
	@echo ""
	@echo "Quick Start: make setup && make dev"

## Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed successfully!"

## Start development server
dev:
	@echo "🚀 Starting development server with Turbopack..."
	@echo "📱 Open http://localhost:3000 in your browser"
	npm run dev

## Build for production
build:
	@echo "🏗️  Building for production..."
	npm run build
	@echo "✅ Build completed successfully!"

## Start production server
start:
	@echo "🌟 Starting production server..."
	@echo "📱 Open http://localhost:3000 in your browser"
	npm run start

## Run linting
lint:
	@echo "🔍 Running ESLint..."
	npm run lint
	@echo "✅ Linting completed!"

## Clean build artifacts and dependencies
clean:
	@echo "🧹 Cleaning build artifacts and dependencies..."
	rm -rf .next
	rm -rf out
	rm -rf node_modules
	rm -rf .turbo
	rm -f *.tsbuildinfo
	@echo "✅ Cleanup completed!"

## Check for outdated dependencies
deps-check:
	@echo "📊 Checking for outdated dependencies..."
	npm outdated || true
	@echo ""
	@echo "💡 To update dependencies, run: npm update"

## Complete project setup
setup: install deps-check
	@echo ""
	@echo "🎉 Project setup completed!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Run 'make dev' to start development server"
	@echo "  2. Open http://localhost:3000 in your browser"
	@echo "  3. Start coding your AT-Proto card game!"

## Run tests (placeholder for future implementation)
test:
	@echo "🧪 Running tests..."
	@echo "⚠️  No tests configured yet. This is a placeholder for future test implementation."
	@echo "💡 Consider adding Jest, Vitest, or other testing framework"

## Full rebuild process
all: clean install build
	@echo "🎯 Full rebuild completed successfully!"

## Development shortcuts
.PHONY: d b s l c

## Quick aliases for common commands
d: dev     ## Alias for dev
b: build   ## Alias for build  
s: start   ## Alias for start
l: lint    ## Alias for lint
c: clean   ## Alias for clean

## Check if npm is available
.PHONY: check-npm
check-npm:
	@which npm > /dev/null || (echo "❌ npm is not installed. Please install Node.js and npm first." && exit 1)

# Add npm check as dependency for npm-related targets
install deps-check dev build start lint: check-npm