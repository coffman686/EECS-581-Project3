COMPOSE_FILE := login/keycloak/docker-compose.yml
COMPOSE := docker compose -f $(COMPOSE_FILE)

.PHONY: up down nuke logs kc-logs mailpit-logs reimport ps

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