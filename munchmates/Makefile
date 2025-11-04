ROOT_DIR := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
COMPOSE_FILE := login/keycloak/docker-compose.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)

.PHONY: up down nuke logs kc-logs mailpit-logs reimport ps

help:
	@echo "Targets:"
	@echo "  up         - start services in foreground (Ctrl-C stops)"
	@echo "  up-bg      - start services in background and wait for healthy"
	@echo "  down       - stop services"
	@echo "  nuke       - stop + remove volumes"
	@echo "  reimport   - nuke then up (forces realm re-import)"
	@echo "  logs       - follow all logs"
	@echo "  kc-logs    - follow keycloak logs"
	@echo "  mailpit-logs - follow mailpit logs"
	@echo "  ps         - show compose status"
	@echo "  env        - ensure .env.local exists (copy from example if missing)"

up-bg:
	$(COMPOSE) up -d --wait

up:
	$(COMPOSE) up

down:
	$(COMPOSE) down

nuke:
	$(COMPOSE) down -v

reimport: nuke up  # wipe volumes, re-create, triggers --import-realm on fresh DB

logs:
	$(COMPOSE) logs -f

kc-logs:
	$(COMPOSE) logs -f keycloak

mailpit-logs:
	$(COMPOSE) logs -f mailpit

ps:
	$(COMPOSE) ps

env:
	@if [ ! -f "$(ROOT_DIR)/.env.local" ] && [ -f "$(ROOT_DIR)/.env.local.example" ]; then \
	  cp "$(ROOT_DIR)/.env.local.example" "$(ROOT_DIR)/.env.local"; \
	  echo "Created .env.local from example."; \
	else \
	  echo ".env.local already exists or no example found."; \
	fi