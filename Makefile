# Local quality gates (see obt/.claude/quality-gates-plan.md).
# `make quality` = all fast gates (wraps the npm scripts so CI and devs share one definition).
.PHONY: quality deps

## quality: ESLint (complexity/size) + TypeScript typecheck + dependency-cruiser (architecture)
quality:
	npm run quality

## deps: architecture/dependency gate only (cycles + layers + forbidden imports)
deps:
	npm run deps
