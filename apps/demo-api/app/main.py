"""Back-end provisório da demonstração. Contrato público: /api/v1."""

import asyncio
import base64
import hashlib
import hmac
import json
import os
import time
import uuid
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, StreamingResponse

from . import db, query

MODULES = [
    "dashboard",
    "review",
    "athena-watch",
    "agenda",
    "tasks",
    "works",
    "planning",
    "measurements",
    "compliance",
    "map",
    "budgets",
    "engineering",
    "documents",
    "commercial",
    "procurement",
    "finance",
    "accounting",
    "people",
    "safety",
    "legal",
    "admin",
    "conversations",
    "email",
    "contacts",
    "library",
    "files",
    "standards",
    "reports",
    "athena",
    "manual",
    "settings",
]
ACTIONS = ["read", "create", "update", "delete", "approve", "export"]
JOBS: dict[str, dict] = {}

# Na Vercel cada requisição pode cair em uma instância diferente da função, então a sessão não pode
# ficar em memória. O token é assinado (HMAC) e carrega o id do usuário: qualquer instância o valida.
TOKEN_SECRET = os.environ.get("DEMO_TOKEN_SECRET", "atena-demo-nao-use-em-producao").encode()


def make_token(user_id: str) -> str:
    payload = base64.urlsafe_b64encode(user_id.encode()).decode().rstrip("=")
    signature = hmac.new(TOKEN_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}.{signature}"


def user_id_from_token(token: str) -> str | None:
    payload, _, signature = token.partition(".")
    expected = hmac.new(TOKEN_SECRET, payload.encode(), hashlib.sha256).hexdigest()
    if not payload or not hmac.compare_digest(signature, expected):
        return None
    try:
        return base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)).decode()
    except ValueError:
        return None


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str):
        self.status, self.code, self.message = status, code, message


@asynccontextmanager
async def lifespan(_: FastAPI):
    db.ensure()
    yield


app = FastAPI(
    title="Atena IA — API de demonstração", docs_url="/api/docs", openapi_url="/api/openapi.json", lifespan=lifespan
)


@app.exception_handler(ApiError)
async def api_error(_: Request, exc: ApiError):
    return JSONResponse({"error": {"code": exc.code, "message": exc.message}}, status_code=exc.status)


@app.exception_handler(RequestValidationError)
async def validation_error(_: Request, exc: RequestValidationError):
    return JSONResponse({"error": {"code": "invalid_request", "message": "Requisição inválida."}}, status_code=422)


def current_user(request: Request) -> dict:
    header = request.headers.get("authorization", "")
    token = header.removeprefix("Bearer ").strip() or request.query_params.get("token", "")
    user_id = user_id_from_token(token)
    user = db.get("users", user_id) if user_id else None
    if not user:
        raise ApiError(401, "unauthenticated", "Sessão ausente ou expirada.")
    return user


def public(user: dict) -> dict:
    return {k: v for k, v in user.items() if k != "password"}


open_api = APIRouter(prefix="/api/v1")
api = APIRouter(prefix="/api/v1", dependencies=[Depends(current_user)])


@open_api.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@open_api.get("/demo/credentials")
def demo_credentials():
    """Só na demonstração: o botão "Entrar na demonstração" preenche o login com o perfil Dono do seed."""
    owner = next(u for u in db.all_of("users") if u["role"] == "owner")
    return {"data": {"email": owner["email"], "password": owner["password"]}}


@open_api.post("/auth/login")
async def login(request: Request):
    body = await request.json()
    user = next(
        (u for u in db.all_of("users") if u["email"] == body.get("email") and u["password"] == body.get("password")),
        None,
    )
    if not user:
        raise ApiError(401, "invalid_credentials", "E-mail ou senha inválidos.")
    return {"data": {"token": make_token(user["id"]), "user": public(user)}}


@api.get("/auth/me")
def me(user: Annotated[dict, Depends(current_user)]):
    return {"data": public(user)}


@api.post("/auth/logout")
def logout():
    # Token sem estado: o cliente descarta o token ao sair.
    return {"data": None}


@api.get("/modules")
def modules():
    return {"data": [{"id": m, "enabled": True, "actions": ACTIONS} for m in MODULES]}


@api.get("/search")
def search(q: str = ""):
    spec = {
        "obras": "name",
        "contacts": "name",
        "documents": "title",
        "tasks": "title",
        "library-items": "title",
        "files": "name",
        "budgets": "name",
        "employees": "name",
    }
    groups = []
    for collection, field in spec.items():
        hits, *_ = query.run(db.all_of(collection), {"q": q, "pageSize": "5"}) if q.strip() else ([], 0, 1, 5)
        if hits:
            groups.append(
                {
                    "type": collection,
                    "items": [
                        {
                            "id": r["id"],
                            "title": r[field],
                            "subtitle": r.get("code") or r.get("roleLabel") or r.get("number") or "",
                        }
                        for r in hits
                    ],
                }
            )
    return {"data": groups}


def job_view(job: dict) -> dict:
    script = job["script"]
    total = sum(s["durationMs"] for s in script["stages"]) / 1000
    elapsed = time.monotonic() - job["startedAt"]
    done = elapsed >= total
    index, cursor = len(script["stages"]), 0.0
    for i, stage in enumerate(script["stages"]):
        cursor += stage["durationMs"] / 1000
        if elapsed < cursor:
            index = i
            break
    stages = [
        {"label": s["label"], "status": "done" if i < index or done else "running" if i == index else "pending"}
        for i, s in enumerate(script["stages"])
    ]
    return {
        "id": job["id"],
        "type": job["type"],
        "status": "done" if done else "running",
        "progress": 100 if done else int(elapsed / total * 100),
        "stageIndex": index if not done else len(stages) - 1,
        "stages": stages,
        "result": script["result"] if done else None,
    }


@api.post("/jobs")
async def create_job(request: Request):
    body = await request.json()
    scripts = db.seed_file("_job-scripts")
    if body.get("type") not in scripts:
        raise ApiError(422, "unknown_job_type", "Tipo de tarefa desconhecido.")
    job = {
        "id": str(uuid.uuid4()),
        "type": body["type"],
        "script": scripts[body["type"]],
        "startedAt": time.monotonic(),
    }
    JOBS[job["id"]] = job
    return {"data": job_view(job)}


@api.get("/jobs/{job_id}")
def read_job(job_id: str):
    if job_id not in JOBS:
        raise ApiError(404, "not_found", "Tarefa não encontrada.")
    return {"data": job_view(JOBS[job_id])}


@api.get("/events")
async def events(request: Request):
    script = db.seed_file("_event-script")
    started, sent, last = time.monotonic(), set(), {}

    def frame(name: str, data: dict) -> str:
        return f"event: {name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"

    async def stream():
        beat = 0.0
        while not await request.is_disconnected():
            now = time.monotonic() - started
            if now - beat >= 15 or beat == 0.0:
                beat = now
                yield frame("heartbeat", {"at": datetime.now(UTC).isoformat()})
            for i, item in enumerate(script):
                if i not in sent and now >= item["afterSeconds"]:
                    sent.add(i)
                    yield frame(
                        "notification",
                        {"id": str(uuid.uuid4()), "createdAt": datetime.now(UTC).isoformat(), **item["notification"]},
                    )
            for job in JOBS.values():
                view = job_view(job)
                if last.get(job["id"]) != view["progress"]:
                    last[job["id"]] = view["progress"]
                    yield frame("job", view)
            await asyncio.sleep(1)

    return StreamingResponse(stream(), media_type="text/event-stream", headers={"Cache-Control": "no-cache"})


@api.post("/atena/command")
async def atena_command(request: Request):
    body = await request.json()
    text = query.fold(str(body.get("text", "")))
    intents = db.seed_file("_atena-intents")
    scored = [(sum(query.fold(k) in text for k in i["keywords"]), i) for i in intents["intents"]]
    score, best = max(scored, key=lambda s: s[0])
    chosen = best if score and score == len(best["keywords"]) else intents["fallback"]
    return {"data": {k: chosen[k] for k in ("reply", "actions", "sources")}}


@api.post("/demo/reset")
def reset():
    db.load()
    JOBS.clear()
    return {"data": {"status": "reset"}}


@api.get("/{resource}")
def list_records(resource: str, request: Request):
    known(resource)
    page, total, number, size = query.run(db.all_of(resource), dict(request.query_params))
    if resource == "users":
        page = [public(u) for u in page]
    return {"data": page, "meta": {"total": total, "page": number, "pageSize": size}}


def known(resource: str) -> None:
    if resource not in db.collections():
        raise ApiError(404, "unknown_resource", f"Recurso desconhecido: {resource}.")


@api.get("/{resource}/{record_id}")
def read_record(resource: str, record_id: str):
    known(resource)
    record = db.get(resource, record_id)
    if not record:
        raise ApiError(404, "not_found", "Registro não encontrado.")
    return {"data": record}


@api.post("/{resource}", status_code=201)
async def create_record(resource: str, request: Request):
    known(resource)
    now = datetime.now(UTC).astimezone(db.BRAZIL).replace(microsecond=0).isoformat()
    record = {**await request.json(), "id": str(uuid.uuid4()), "createdAt": now, "updatedAt": now}
    db.put(resource, record)
    return {"data": record}


@api.patch("/{resource}/{record_id}")
async def update_record(resource: str, record_id: str, request: Request):
    known(resource)
    record = db.get(resource, record_id)
    if not record:
        raise ApiError(404, "not_found", "Registro não encontrado.")
    record = {
        **record,
        **await request.json(),
        "id": record_id,
        "updatedAt": datetime.now(UTC).astimezone(db.BRAZIL).replace(microsecond=0).isoformat(),
    }
    db.put(resource, record)
    return {"data": record}


@api.delete("/{resource}/{record_id}")
def delete_record(resource: str, record_id: str):
    known(resource)
    if not db.remove(resource, record_id):
        raise ApiError(404, "not_found", "Registro não encontrado.")
    return {"data": {"id": record_id}}


app.include_router(open_api)
app.include_router(api)
