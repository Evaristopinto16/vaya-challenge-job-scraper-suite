# Job Indexer — Node.js / JavaScript

Backend de indexação de vagas com 10 adaptadores:
- ATS: Greenhouse, Lever, Ashby, SmartRecruiters, Workable.
- Job boards: WP Job Manager, Niceboard, Jobiqo, SmartJobBoard, JobBoard.io.

**Tudo em JavaScript CommonJS (`.js`), sem TypeScript.**

## 1. Requisitos
- Node.js 20+
- PostgreSQL 14+
- npm

## 2. Instalação

```bash
npm install
cp .env.example .env
```

Configure `DATABASE_URL` no `.env`. Depois:

```bash
docker compose up -d db
npm run db:init
npm run dev
```

API: `http://localhost:3000`

## 3. Configurar fontes

Crie fontes através da API. O `identifier` é o identificador da empresa/board na plataforma:

```bash
curl -X POST http://localhost:3000/api/sources \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme careers","platform":"greenhouse","identifier":"acme","baseUrl":"https://boards.greenhouse.io/acme","enabled":true}'
```

Plataformas e identificadores:
- Greenhouse: `identifier` = board token (ex.: `acme`)
- Lever: `identifier` = site slug
- Ashby: `identifier` = job board name
- SmartRecruiters: `identifier` = company identifier
- Workable: `identifier` = account subdomain; configure `WORKABLE_TOKEN`
- WP Job Manager: `baseUrl` = site WordPress; opcionalmente `config.endpoint`
- Niceboard, Jobiqo, SmartJobBoard, JobBoard.io: configure um `config.endpoint` JSON ou `config.listingUrl` + seletores HTML.

Exemplo de fonte JSON genérica:

```json
{
  "name": "My Niceboard",
  "platform": "niceboard",
  "baseUrl": "https://jobs.example.com",
  "config": {
    "endpoint": "https://jobs.example.com/api/jobs",
    "itemsPath": "jobs",
    "fields": {
      "title": "title",
      "company": "company.name",
      "description": "description",
      "location": "location",
      "url": "url",
      "applicationUrl": "apply_url",
      "postedAt": "created_at",
      "salary": "salary"
    }
  }
}
```

Se a instalação não expuser JSON, configure HTML:

```json
{
  "name": "Custom board",
  "platform": "jobboardio",
  "baseUrl": "https://jobs.example.com",
  "config": {
    "listingUrl": "https://jobs.example.com/jobs",
    "selectors": {
      "item": ".job-card",
      "title": ".job-title",
      "company": ".company",
      "location": ".location",
      "description": ".description",
      "url": "a.job-link",
      "applicationUrl": "a.apply"
    }
  }
}
```

Os seletores HTML são específicos de cada site e precisam ser validados com o HTML real.

## 4. Sincronizar

Sincronizar uma fonte:

```bash
curl -X POST http://localhost:3000/api/sources/1/sync
```

Sincronizar todas:

```bash
curl -X POST http://localhost:3000/api/sync
```

O cron `SYNC_CRON` executa sincronizações automáticas. O padrão é a cada 6 horas.

## 5. API

- `GET /health`
- `GET /api/jobs?keyword=backend&company=Acme&location=Berlin&page=1&limit=20`
- `GET /api/jobs/:id`
- `GET /api/sources`
- `POST /api/sources`
- `PATCH /api/sources/:id`
- `DELETE /api/sources/:id`
- `POST /api/sources/:id/sync`
- `POST /api/sync`
- `GET /api/runs`

## 6. Modelo e deduplicação

Cada vaga contém título, empresa, descrição, localização, URL de origem, URL de candidatura, salário, tipo de emprego, modalidade remota, data original, primeira deteção e última verificação.

A deduplicação usa uma chave normalizada baseada em empresa, título e localização. Registos de fontes diferentes são associados à mesma vaga quando essa chave coincide. É uma estratégia conservadora: vagas com títulos ou localizações muito diferentes podem exigir uma camada adicional de comparação semântica.

Falhas HTTP ou de parsing ficam registadas como `failed`; nunca são interpretadas como prova de que as vagas fecharam. Uma vaga só é marcada como `closed` depois de uma recolha bem-sucedida da fonte em que ela foi vista e de não aparecer no resultado dessa recolha.

## 7. Limitações importantes

Este projeto fornece conectores reais para APIs públicas documentadas quando disponíveis e adaptadores configuráveis para plataformas cuja API varia por cliente/instalação. Não existe um endpoint público universal garantido para todas as instalações de Niceboard, Jobiqo, SmartJobBoard, JobBoard.io ou WP Job Manager. Para demonstrar cobertura válida nessas plataformas, configure e teste uma fonte real de cada produto e guarde os resultados de execução.

Respeite os termos de utilização, robots.txt, limites de requisições, direitos de base de dados e legislação aplicável. Não contorne autenticação, paywalls ou controlos de acesso.

## 8. Produção

Antes de produção:
- usar HTTPS e autenticação nas rotas administrativas;
- guardar segredos num secret manager;
- aplicar rate limiting;
- configurar backups PostgreSQL;
- monitorizar cron e falhas;
- adicionar testes de integração por instalação;
- rever retenção e política de encerramento de vagas.
