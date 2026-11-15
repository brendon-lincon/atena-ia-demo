"""Obras, EAP (itens), atividades de cronograma e alocações.

O avanço físico das obras é a média ponderada dos itens da EAP, e o previsto é calculado
a partir da linha de base do cronograma. Ambos são calibrados para bater com as metas
da narrativa da apresentação (ver `TARGETS`).
"""

from dataclasses import dataclass, field

from .common import add, brl, d, rng, rows, uid

# Metas da narrativa: (avanço real, avanço previsto) por obra.
TARGETS = {"candeias": (34.0, 37.0), "cuiaba": (71.0, 68.0), "vertice": (52.0, 50.0),
           "osasco": (0.0, 0.0), "paulinia": (100.0, 100.0)}  # fmt: skip


@dataclass
class Leaf:
    name: str
    weight: float  # peso relativo dentro da frente
    unit: str
    quantity: float
    progress: float
    base_start: int
    base_end: int
    start: int | None = None  # datas reais/replanejadas (None = igual à linha de base)
    end: int | None = None
    after: list = field(default_factory=list)  # (chave do predecessor, tipo, travado)
    key: str = ""


@dataclass
class Front:
    name: str
    weight: float
    leaves: list[Leaf]
    contractor: str | None = None


def L(name, w, unit, qty, prog, bs, be, start=None, end=None, after=(), key=""):  # noqa: N802
    return Leaf(name, w, unit, qty, prog, bs, be, start, end, list(after), key)


def _tanks() -> list[Leaf]:
    base = [(-44, -30), (-40, -26), (-36, -22), (-32, -18), (-28, -14), (-24, -10), (-20, -6),
            (-16, -3), (-10, 4), (-2, 12), (4, 18), (8, 22)]  # fmt: skip
    progress = [100] * 7 + [78, 40, 15, 0, 0]
    leaves = []
    for i, ((bs, be), prog) in enumerate(zip(base, progress, strict=True), start=1):
        end = 0 if i == 8 else None
        after = [("tq08", "FS", True)] if i == 12 else ([("tq08", "SS", False)] if i in (9, 10, 11) else [])
        leaves.append(L(f"Base do tanque TQ-{i:02d}", 1, "un", 1, prog, bs, be, end=end, after=after,
                        key=f"tq{i:02d}" if i != 8 else "tq08"))  # fmt: skip
    return leaves


CANDEIAS = [
    Front("Terraplenagem e drenagem", 12, [
        L("Terraplenagem geral e compactação", 8, "m³", 142000, 100, -95, -42, key="terra"),
        L("Drenagem pluvial e separador água-óleo", 4, "m", 3200, 100, -60, -28)], "terraplan"),
    Front("Bases dos tanques — 12 un.", 18, _tanks()),
    Front("Bacia e muros de contenção", 14, [
        L("Escavação e regularização da bacia", 3, "m³", 18500, 100, -38, -12),
        L("Fundação dos muros de contenção", 4, "m", 860, 45, -20, 10, start=-14, end=18),
        L("Muros de contenção em concreto armado", 6, "m", 860, 10, -10, 50, start=-6, end=60),
        L("Impermeabilização e proteção da bacia", 2, "m²", 9200, 0, 50, 80)]),
    Front("Bases de apoio de tubulação", 6, [
        L("Sapatas e blocos de apoio", 3, "un", 148, 25, -14, 20, start=-8, end=28),
        L("Pedestais e lajes de piso dos racks", 3, "un", 96, 0, 20, 52)]),
    Front("Casa de gerador", 5, [
        L("Locação, escavação e lastro", 1, "vb", 1, 100, -20, -12),
        L("Fundação e baldrame", 2, "m³", 38, 60, -14, 6, start=-12, end=8),
        L("Estrutura e alvenaria", 2.5, "m²", 210, 0, 8, 30),
        L("Laje e cobertura", 1.5, "m²", 96, 0, 30, 45),
        L("Instalações elétricas e hidráulicas", 2, "vb", 1, 0, 40, 70),
        L("Acabamentos e pintura", 1, "m²", 260, 0, 65, 85)]),
    Front("QGBT e CCM", 8, [
        L("Projeto executivo, aquisição e fabricação", 3, "vb", 1, 30, -20, 35, start=-10, end=40),
        L("Montagem, interligações e testes", 5, "vb", 1, 0, 60, 110)], "eletromaq"),
    Front("Rede de hidrantes e abrigos", 9, [
        L("Tubulação enterrada e anéis de hidrantes", 6, "m", 5400, 5, -10, 55, start=-3, end=60, key="hidr"),
        L("Abrigos, hidrantes e acessórios", 3, "un", 64, 0, 60, 90)], "hidrotec"),
    Front("Edificações (escritório, guarita, sala de motoristas)", 12, [
        L("Escritório administrativo", 6, "m²", 320, 18, -10, 70, key="escritorio"),
        L("Guarita", 2, "m²", 36, 0, 30, 60),
        L("Sala de motoristas", 4, "m²", 180, 0, 50, 100)]),
    Front("Plataformas de carregamento e descarga", 10, [
        L("Fundações e radier das plataformas", 4, "m²", 2400, 0, 30, 95, after=[("tq12", "FS", True)], key="plat"),
        L("Estrutura metálica, cobertura e piso", 6, "m²", 2400, 0, 95, 165, after=[("plat", "FS", True)], key="plat2")]),
    Front("Pavimentação e urbanização", 6, [
        L("Sub-base, base e drenagem superficial", 3, "m²", 18000, 0, 160, 195, after=[("plat2", "SS", True)], key="pav"),
        L("Revestimento asfáltico e sinalização", 3, "m²", 18000, 0, 195, 215, after=[("pav", "FS", True)], key="pav2")]),
]  # fmt: skip

CUIABA = [
    Front("Demolições e remoções", 8, [L("Demolição de piso e remoção de entulho", 1, "m²", 2200, 100, -70, -58)]),
    Front("Recuperação estrutural", 22, [
        L("Reforço de pilares e vigas", 3, "m", 940, 90, -60, -8),
        L("Tratamento de fissuras e juntas", 1, "m", 1800, 95, -40, -6)]),
    Front("Piso industrial", 20, [
        L("Preparo de base e sub-base", 1, "m²", 6400, 100, -58, -35),
        L("Piso de concreto polido", 3, "m²", 6400, 80, -35, 10, key="piso")]),
    Front("Cobertura e calhas", 15, [L("Substituição de telhas, calhas e rufos", 1, "m²", 5200, 70, -48, 14)]),
    Front("Instalações elétricas", 12, [L("Instalações elétricas e SPDA", 1, "vb", 1, 55, -40, 20, key="eletrica")]),
    Front("Instalações hidráulicas e combate a incêndio", 10, [L("Hidráulica, hidrantes e sprinklers", 1, "vb", 1, 45, -30, 22)]),
    Front("Pintura e acabamento", 8, [L("Pintura epóxi e demarcações", 1, "m²", 7800, 20, -10, 30)]),
    Front("Urbanização e sinalização", 5, [L("Calçadas, paisagismo e sinalização viária", 1, "m²", 2100, 0, 15, 34)]),
]  # fmt: skip

VERTICE = [
    Front("Bases de bombas e skids", 18, [L("Bases de bombas e skids", 1, "un", 14, 100, -60, -30)]),
    Front("Canaletas e drenagem oleosa", 25, [
        L("Escavação e canaletas", 2, "m", 780, 80, -45, 5),
        L("Caixas separadoras e interligações", 1, "un", 6, 70, -20, 10)]),
    Front("Pisos industriais", 22, [L("Piso industrial do parque de tanques", 1, "m²", 3600, 45, -20, 40, key="pisov")]),
    Front("Muretas e calçadas", 15, [L("Muretas de contenção e calçadas", 1, "m", 420, 10, -5, 50)]),
    Front("Fundações de suportes de tubulação", 20, [L("Fundações dos suportes de tubulação", 1, "un", 88, 30, -25, 60, key="supt")]),
]  # fmt: skip

OSASCO = [
    Front("Mobilização e canteiro", 4, [L("Mobilização e instalação do canteiro", 1, "vb", 1, 0, 58, 75)]),
    Front("Terraplenagem", 14, [L("Terraplenagem e contenção de taludes", 1, "m³", 96000, 0, 75, 130)]),
    Front("Fundações e bases dos tanques", 22, [L("Estacas e bases dos tanques", 1, "un", 10, 0, 110, 220)]),
    Front("Bacia de contenção e drenagem", 14, [L("Bacia de contenção e drenagem oleosa", 1, "m²", 8800, 0, 130, 210)]),
    Front("Edificações e plataformas", 20, [L("Edificações e plataformas de carregamento", 1, "m²", 3600, 0, 180, 300)]),
    Front("Instalações eletromecânicas", 16, [L("Instalações elétricas, hidráulicas e de combate", 1, "vb", 1, 0, 230, 340)]),
    Front("Pavimentação e comissionamento", 10, [L("Pavimentação, testes e comissionamento", 1, "m²", 15000, 0, 300, 358)]),
]  # fmt: skip

PAULINIA = [
    Front("Terraplenagem", 15, [L("Terraplenagem e drenagem", 1, "m³", 118000, 100, -520, -430)]),
    Front("Bases e bacia de contenção", 30, [L("Bases dos tanques e bacia", 1, "un", 9, 100, -470, -330)]),
    Front("Edificações e plataformas", 25, [L("Edificações e plataformas", 1, "m²", 4100, 100, -400, -260)]),
    Front("Instalações", 20, [L("Instalações elétricas e de combate a incêndio", 1, "vb", 1, 100, -330, -200)]),
    Front("Pavimentação e comissionamento", 10, [L("Pavimentação, testes e comissionamento", 1, "m²", 16000, 100, -260, -180)]),
]  # fmt: skip

OBRAS = {
    "candeias": dict(
        code="OB-2026-014", name="Base de Distribuição Candeias", client="atlas", type="industrial_new",
        status="in_progress", city="Candeias", state="BA", tz="America/Bahia", lat=-12.6713, lng=-38.5506,
        value=18_400_000, start=-103, end=228, cost_var=2.1, headcount=46, fronts=CANDEIAS,
        tune_actual="escritorio", tune_planned="hidr",
        description="Obra nova de base de distribuição de combustíveis: 12 tanques, bacia de contenção, "
                    "casa de gerador, rede de hidrantes, plataformas e pavimentação."),
    "cuiaba": dict(
        code="OB-2026-011", name="Reforma da Base Cuiabá", client="atlas", type="renovation",
        status="in_progress", city="Cuiabá", state="MT", tz="America/Cuiaba", lat=-15.6014, lng=-56.0979,
        value=3_200_000, start=-74, end=34, cost_var=0.0, headcount=18, fronts=CUIABA,
        tune_actual="eletrica", tune_planned="piso",
        description="Reforma da base existente: recuperação estrutural, piso industrial, cobertura e instalações."),
    "vertice": dict(
        code="SC-2026-003", name="Serviços civis — Parque de tanques (Vértice)", client="vertice", type="subcontract",
        status="in_progress", city="Candeias", state="BA", tz="America/Bahia", lat=-12.6769, lng=-38.5441,
        value=2_100_000, start=-60, end=75, cost_var=-0.8, headcount=14, fronts=VERTICE,
        tune_actual="pisov", tune_planned="supt",
        description="Subcontrato de serviços civis do parque de tanques da Vértice Montagens Industriais."),
    "osasco": dict(
        code="OB-2026-019", name="Base de Distribuição Osasco", client="atlas", type="industrial_new",
        status="mobilizing", city="Osasco", state="SP", tz="America/Sao_Paulo", lat=-23.5325, lng=-46.7917,
        value=9_700_000, start=58, end=358, cost_var=None, headcount=0, fronts=OSASCO,
        tune_actual=None, tune_planned=None,
        description="Obra nova em mobilização: regularização, licenças e contratação de equipe em andamento."),
    "paulinia": dict(
        code="OB-2025-008", name="Base de Distribuição Paulínia", client="atlas", type="industrial_new",
        status="closing", city="Paulínia", state="SP", tz="America/Sao_Paulo", lat=-22.7611, lng=-47.1542,
        value=12_900_000, start=-520, end=-180, cost_var=1.4, headcount=0, fronts=PAULINIA,
        tune_actual=None, tune_planned=None,
        description="Obra concluída e entregue; em encerramento (as built, termo definitivo e lições aprendidas)."),
}  # fmt: skip


def _weights(fronts: list[Front]) -> dict[int, float]:
    """Peso absoluto (% da obra) de cada folha, indexado pela identidade do objeto."""
    out = {}
    for front in fronts:
        total = sum(leaf.weight for leaf in front.leaves)
        for leaf in front.leaves:
            out[id(leaf)] = front.weight * leaf.weight / total
    return out


def _actual(fronts: list[Front]) -> float:
    w = _weights(fronts)
    return sum(w[id(leaf)] * leaf.progress / 100 for f in fronts for leaf in f.leaves)


def _planned(fronts: list[Front]) -> float:
    w = _weights(fronts)
    total = 0.0
    for f in fronts:
        for leaf in f.leaves:
            span = max(leaf.base_end - leaf.base_start, 1)
            total += w[id(leaf)] * min(max(-leaf.base_start / span, 0), 1)
    return total


def _find(fronts: list[Front], key: str) -> Leaf:
    return next(leaf for f in fronts for leaf in f.leaves if leaf.key == key)


def _calibrate(spec: dict, actual_target: float, planned_target: float) -> None:
    fronts = spec["fronts"]
    if spec["tune_actual"]:
        leaf = _find(fronts, spec["tune_actual"])
        weight = _weights(fronts)[id(leaf)]
        leaf.progress = round(min(max(leaf.progress + (actual_target - _actual(fronts)) / weight * 100, 0), 100), 1)
    if spec["tune_planned"] and spec["tune_planned"] != spec["tune_actual"]:
        leaf = _find(fronts, spec["tune_planned"])
        original, best = leaf.base_start, (1e9, leaf.base_start)
        for start in range(original - 30, original + 30):
            leaf.base_start = start
            best = min(best, (abs(_planned(fronts) - planned_target), start))
        leaf.base_start = best[1]


def _history(final: float, months: int = 12) -> list[float]:
    """Série de avanço acumulado (curva em S suave) terminando no valor atual."""
    return [round(final * (i / months) ** 1.6, 1) for i in range(1, months + 1)]


def build() -> None:
    employees = {r["id"]: r for r in rows("employees")}
    for okey, spec in OBRAS.items():
        fronts: list[Front] = spec["fronts"]
        _calibrate(spec, *TARGETS[okey])
        actual, planned = round(_actual(fronts), 1), round(_planned(fronts), 1)
        value = brl(spec["value"])
        oid = uid(f"obra:{okey}")
        budgeted = round(value * 0.84 * actual / 100)
        var = spec["cost_var"]
        add("obras", f"obra:{okey}", code=spec["code"], name=spec["name"], clientId=uid(f"contact:{spec['client']}"),
            type=spec["type"], status=spec["status"], description=spec["description"], city=spec["city"],
            state=spec["state"], timezone=spec["tz"], latitude=spec["lat"], longitude=spec["lng"],
            contractValueCents=value, startDate=d(spec["start"]), endDate=d(spec["end"]),
            actualPhysicalPct=actual, plannedPhysicalPct=planned, costVariancePct=var,
            budgetedCostToDateCents=budgeted,
            actualCostToDateCents=round(budgeted * (1 + var / 100)) if var is not None else 0,
            headcount=spec["headcount"], managerId=uid("user:engineer"),
            foremanId=uid("user:foreman") if okey == "candeias" else None,
            progressHistory=_history(actual) if actual > 0 else [], estimatedEndDate=d(spec["end"])
            )  # fmt: skip
        _eap_and_schedule(okey, oid, spec, value)
    _allocations(employees)


def _eap_and_schedule(okey: str, oid: str, spec: dict, value: int) -> None:
    fronts: list[Front] = spec["fronts"]
    weights = _weights(fronts)
    leaf_cents: dict[int, int] = {id(lf): round(value * weights[id(lf)] / 100) for f in fronts for lf in f.leaves}
    largest = max((lf for f in fronts for lf in f.leaves), key=lambda lf: leaf_cents[id(lf)])
    leaf_cents[id(largest)] += value - sum(leaf_cents.values())
    keys: dict[str, str] = {}
    unlinked = [("mob", "Mobilização e instalação do canteiro", spec["start"], spec["start"] + 12)]
    if okey == "candeias":
        unlinked += [("topo", "Locação topográfica e sondagens complementares", -100, -92),
                     ("comiss", "Testes, comissionamento e desmobilização", 212, 228)]  # fmt: skip
    elif okey in ("cuiaba", "vertice"):
        unlinked += [("desmob", "Desmobilização e entrega ao contratante", spec["end"] - 5, spec["end"])]
    for fi, front in enumerate(fronts, start=1):
        previous: tuple[str, Leaf] | None = None
        front_cents = sum(leaf_cents[id(lf)] for lf in front.leaves)
        front_prog = sum(lf.progress * leaf_cents[id(lf)] for lf in front.leaves) / front_cents
        fid = add("eap-items", f"eap:{okey}:{fi}", obraId=oid, parentId=None, code=str(fi), name=front.name,
                  level="front", weightPct=round(weights_sum(front, weights), 2), contractedCents=front_cents,
                  progressPct=round(front_prog, 1), unit=None, quantity=None, unitPriceCents=None,
                  contractorId=uid(f"contact:{front.contractor}") if front.contractor else None,
                  status=_status(front_prog))  # fmt: skip
        for li, leaf in enumerate(front.leaves, start=1):
            cents = leaf_cents[id(leaf)]
            lid = add("eap-items", f"eap:{okey}:{fi}.{li}", obraId=oid, parentId=fid, code=f"{fi}.{li}",
                      name=leaf.name, level="leaf", weightPct=round(weights[id(leaf)], 2), contractedCents=cents,
                      progressPct=leaf.progress, unit=leaf.unit, quantity=leaf.quantity,
                      unitPriceCents=round(cents / leaf.quantity),
                      contractorId=uid(f"contact:{front.contractor}") if front.contractor else None,
                      status=_status(leaf.progress))  # fmt: skip
            keys[leaf.key or f"{fi}.{li}"] = f"act:{okey}:{fi}.{li}"
            leaf_info = (lid, f"act:{okey}:{fi}.{li}", leaf)
            if not leaf.after and previous and (previous[1].end or previous[1].base_end) <= (leaf.start or leaf.base_start):
                leaf.after = [(previous[1].key or f"{fi}.{li - 1}", "FS", False)]
            _activity(okey, oid, leaf_info, keys, spec)
            previous = (akey_of(okey, fi, li), leaf)
    for key, name, start, end in unlinked:
        prog = 100 if end < 0 else (round(-start / (end - start) * 100) if start < 0 else 0)
        preds = [{"activityId": uid("act:candeias:10.2"), "type": "FS", "lagDays": -3}] if okey == "candeias" and key == "comiss" else []
        add("schedule-activities", f"act:{okey}:{key}", obraId=oid, eapItemId=None, name=name, startDate=d(start),
            endDate=d(end), baselineStart=d(start), baselineEnd=d(end), progressPct=min(prog, 100),
            predecessors=preds, isMilestone=False, responsible=None)  # fmt: skip
    if okey == "candeias":
        add("schedule-activities", "act:candeias:marco1", obraId=oid, eapItemId=None,
            name="Marco: liberação da frente de tanques", startDate=d(-45), endDate=d(-45), baselineStart=d(-45),
            baselineEnd=d(-45), progressPct=100, predecessors=[], isMilestone=True, responsible=None)  # fmt: skip
        add("schedule-activities", "act:candeias:marco-final", obraId=oid, eapItemId=None,
            name="Marco: entrega final ao contratante", startDate=d(228), endDate=d(228), baselineStart=d(228),
            baselineEnd=d(228), progressPct=0, predecessors=[{"activityId": uid("act:candeias:comiss"), "type": "FS", "lagDays": 0}],
            isMilestone=True, responsible=None)  # fmt: skip


def akey_of(okey: str, fi: int, li: int) -> str:
    return f"act:{okey}:{fi}.{li}"


def weights_sum(front: Front, weights: dict[int, float]) -> float:
    return sum(weights[id(lf)] for lf in front.leaves)


def _status(progress: float) -> str:
    return "done" if progress >= 100 else ("in_progress" if progress > 0 else "not_started")


def _activity(okey: str, oid: str, info: tuple, keys: dict[str, str], spec: dict) -> None:
    lid, akey, leaf = info
    start = leaf.base_start if leaf.start is None else leaf.start
    end = leaf.base_end if leaf.end is None else leaf.end
    preds = []
    for pkey, kind, tight in leaf.after:
        pred_key = keys.get(pkey)
        if pred_key is None:
            continue
        preds.append({"activityId": uid(pred_key), "type": kind, "lagDays": _lag(spec, pkey, kind, tight, leaf)})
    add("schedule-activities", akey, obraId=oid, eapItemId=lid, name=leaf.name, startDate=d(start), endDate=d(end),
        baselineStart=d(leaf.base_start), baselineEnd=d(leaf.base_end), progressPct=leaf.progress,
        predecessors=preds, isMilestone=False, responsible=None)  # fmt: skip


def _lag(spec: dict, pkey: str, kind: str, tight: bool, leaf: Leaf) -> int:
    """Folga travada = intervalo real entre as datas (caminho crítico); senão, zero."""
    if not tight:
        return 0
    pred = _find(spec["fronts"], pkey)
    p_start = pred.base_start if pred.start is None else pred.start
    p_end = pred.base_end if pred.end is None else pred.end
    start = leaf.base_start if leaf.start is None else leaf.start
    return start - (p_start if kind == "SS" else p_end)


def _allocations(employees: dict[str, dict]) -> None:
    spans = {"candeias": (-95, 228), "cuiaba": (-74, 34), "vertice": (-60, 75)}
    for emp in employees.values():
        okey = next(k for k in spans if uid(f"obra:{k}") == emp["obraId"])
        start, end = spans[okey]
        if emp["role"] == "rebar":
            start, end = -90, 40
        add("allocations", f"alloc:{emp['id']}", employeeId=emp["id"], obraId=emp["obraId"], role=emp["role"],
            teamName=emp["teamName"], startDate=d(start + rng.randint(0, 6)), endDate=d(end), loadPct=100)  # fmt: skip
        if emp["role"] == "rebar":  # conflito proposital: Candeias e Cuiabá na mesma semana
            add("allocations", f"alloc2:{emp['id']}", employeeId=emp["id"], obraId=uid("obra:cuiaba"),
                role=emp["role"], teamName=emp["teamName"], startDate=d(4), endDate=d(16), loadPct=100)  # fmt: skip
