.PHONY:
dev:
	docker-compose up -d

.PHONY:
down:
	docker-compose down 

.PHONY:
psql:
	docker-compose exec postgres psql -U admin node_typeorm

.PHONY:
build:
	echo "Should be building something"

.PHONY:
exec:
	docker-compose exec ${ARGS}
	
db-push:
	yarn build && yarn typeorm migrate:run