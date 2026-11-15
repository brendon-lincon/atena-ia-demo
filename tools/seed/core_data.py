"""Empresa, usuários, contatos e colaboradores."""

from .common import add, brl, d, pick, rng, slug, uid

PASSWORD = "demo1234"

ROLE_LABEL = {
    "foreman_chief": "Mestre de obras",
    "foreman": "Encarregado",
    "mason": "Pedreiro",
    "carpenter": "Carpinteiro",
    "rebar": "Armador",
    "laborer": "Servente",
    "operator": "Operador de máquinas",
    "safety_tech": "Técnico de segurança do trabalho",
}
SALARY = {
    "foreman_chief": 7800,
    "foreman": 5200,
    "mason": 3300,
    "carpenter": 3300,
    "rebar": 3350,
    "laborer": 2200,
    "operator": 3900,
    "safety_tech": 4700,
}
# (obra, função, quantidade) — soma 34; 18 em Candeias, 9 em Cuiabá, 7 no subcontrato.
STAFFING = [
    ("candeias", "foreman_chief", 1), ("candeias", "foreman", 2), ("candeias", "mason", 3),
    ("candeias", "carpenter", 2), ("candeias", "rebar", 5), ("candeias", "laborer", 2),
    ("candeias", "operator", 2), ("candeias", "safety_tech", 1),
    ("cuiaba", "foreman_chief", 1), ("cuiaba", "foreman", 1), ("cuiaba", "mason", 3),
    ("cuiaba", "carpenter", 1), ("cuiaba", "laborer", 2), ("cuiaba", "safety_tech", 1),
    ("vertice", "foreman", 1), ("vertice", "mason", 2), ("vertice", "carpenter", 1),
    ("vertice", "laborer", 2), ("vertice", "operator", 1),
]  # fmt: skip
FIRST = ["Valdemir", "Cláudio", "Edson", "Josué", "Rafael", "Anderson", "Wellington", "Reinaldo",
         "Gilmar", "Ademir", "Josias", "Marcelo", "Fabrício", "Dionísio", "Leandro", "Sidnei",
         "Ronaldo", "Jocimar", "Nilton", "Ismael", "Cleiton", "Márcio", "Vinícius", "Everton",
         "Wagner", "Douglas", "Hélio", "Genival", "Osvaldo", "Tiago", "Eliseu", "Altair", "Elias",
         "Jair"]  # fmt: skip
LAST = ["Souza", "Oliveira", "Ferreira", "Barbosa", "Cardoso", "Mendes", "Rocha", "Pereira",
        "Teixeira", "Nogueira", "Araújo", "Batista", "Monteiro", "Ramos", "Freitas", "Lima",
        "Gomes", "Moura", "Siqueira", "Duarte"]  # fmt: skip


def _masked_cpf() -> str:
    return f"***.{rng.randint(100, 999)}.{rng.randint(100, 999)}-**"


def _phone(ddd: int) -> str:
    return f"({ddd}) 9{rng.randint(8000, 9999)}-{rng.randint(1000, 9999)}"


def company_and_users() -> None:
    add(
        "company", "company",
        name="CGA Acabamentos",
        legalName="CGA Acabamentos e Construções Ltda.",
        cnpj="12.345.678/0001-00",
        address={"street": "Rua Dom Aquino, 1850, sala 402", "district": "Centro",
                 "city": "Campo Grande", "state": "MS", "zip": "79002-181"},
        phone="(67) 3321-4400", email="contato@cgaacabamentos.example",
        website="www.cgaacabamentos.example",
        technicalResponsible={"name": "Robson Carvalho", "title": "Engenheiro Civil",
                              "council": "CREA-MS", "registration": "12345/D"},
        identity={"primaryColor": "#154470", "accentColor": "#2F6AA3", "logoText": "CGA",
                  "headerNote": "Obras industriais · Reformas · Serviços civis",
                  "footerNote": "CGA Acabamentos e Construções Ltda. · CNPJ 12.345.678/0001-00 · Campo Grande/MS"},
        latitude=-20.4628, longitude=-54.6153, foundedYear=2009, taxRegime="Lucro presumido",
    )  # fmt: skip
    people = [
        ("owner", "Robson Carvalho", "Dono"),
        ("engineer", "Beatriz Nogueira", "Engenheira responsável"),
        ("foreman", "Jacinto Ribeiro", "Encarregado"),
        ("admin", "Camila Ferraz", "Administrativo"),
    ]
    for role, name, label in people:
        first = slug(name.split()[0])
        add("users", f"user:{role}", name=name, email=f"{first}@cgaacabamentos.example",
            password=PASSWORD, role=role, roleLabel=label, active=True,
            initials="".join(p[0] for p in name.split()[:2]))  # fmt: skip


def _contact(key: str, name: str, roles: list[str], **extra) -> str:
    base = {"kind": "company", "name": name, "roles": roles, "city": "", "state": "", "tags": []}
    return add("contacts", f"contact:{key}", **{**base, **extra})


def contacts_and_employees() -> None:
    companies = [
        ("atlas", "Atlas Distribuidora de Combustíveis S.A.", ["contratante"], "Candeias", "BA",
         "00.111.222/0001-00", "(71) 3333-1200", "contratos@atlas-comb.example"),
        ("vertice", "Vértice Montagens Industriais Ltda.", ["contratante"], "Candeias", "BA",
         "00.333.444/0001-00", "(71) 3555-2100", "obras@verticemontagens.example"),
        ("aco", "Aço Brasil Distribuidora de Ferros", ["fornecedor"], "Salvador", "BA",
         "00.555.666/0001-00", "(71) 3011-4500", "vendas@acobrasil-dist.example"),
        ("concreto", "Concreteira Planalto Ltda.", ["fornecedor"], "Cuiabá", "MT",
         "00.777.888/0001-00", "(65) 3622-7000", "comercial@concreteiraplanalto.example"),
        ("locamax", "LocaMax Equipamentos", ["fornecedor"], "Lauro de Freitas", "BA",
         "00.999.000/0001-00", "(71) 3288-9900", "locacao@locamax.example"),
        ("hotel-cuiaba", "Hotel Pantanal Palace", ["fornecedor"], "Cuiabá", "MT",
         "01.111.222/0001-00", "(65) 3644-1000", "reservas@pantanalpalace.example"),
        ("pousada-candeias", "Pousada Recôncavo", ["fornecedor"], "Candeias", "BA",
         "01.333.444/0001-00", "(71) 3601-2020", "reservas@pousadareconcavo.example"),
        ("terraplan", "Terraplan Terraplenagem Ltda.", ["fornecedor", "terceiro"], "Simões Filho", "BA",
         "01.555.666/0001-00", "(71) 3396-4040", "contato@terraplan.example"),
        ("eletromaq", "Eletromaq Instalações Elétricas", ["fornecedor", "terceiro"], "Salvador", "BA",
         "01.777.888/0001-00", "(71) 3452-8800", "projetos@eletromaq.example"),
        ("hidrotec", "Hidrotec Combate a Incêndio", ["fornecedor", "terceiro"], "Camaçari", "BA",
         "01.999.000/0001-00", "(71) 3621-3300", "orcamentos@hidrotec.example"),
        ("brita", "Mineração Sertão — Brita e Areia", ["fornecedor"], "Santo Amaro", "BA",
         "02.111.222/0001-00", "(75) 3241-5050", "vendas@mineracaosertao.example"),
        ("ferragens", "Ferragens Central Campo Grande", ["fornecedor"], "Campo Grande", "MS",
         "02.333.444/0001-00", "(67) 3312-7070", "pedidos@ferragenscentral.example"),
        ("bastos", "Bastos Contabilidade", ["profissional", "contador"], "Campo Grande", "MS",
         "02.555.666/0001-00", "(67) 3325-1100", "atendimento@bastoscontabil.example"),
    ]
    for key, name, roles, city, uf, doc, phone, mail in companies:
        _contact(key, name, roles, city=city, state=uf, document=doc, phone=phone, email=mail)
    agencies = [
        ("pref-osasco", "Prefeitura de Osasco — Secretaria de Obras", "Osasco", "SP"),
        ("cetesb", "CETESB — Agência Ambiental de São Paulo", "São Paulo", "SP"),
        ("inema", "INEMA — Instituto do Meio Ambiente e Recursos Hídricos", "Salvador", "BA"),
        ("sema-mt", "SEMA-MT — Secretaria de Estado de Meio Ambiente", "Cuiabá", "MT"),
        ("bombeiros-sp", "Corpo de Bombeiros — Polícia Militar de SP", "São Paulo", "SP"),
        ("bombeiros-ba", "Corpo de Bombeiros Militar da Bahia", "Salvador", "BA"),
        ("bombeiros-mt", "Corpo de Bombeiros Militar de Mato Grosso", "Cuiabá", "MT"),
        ("receita", "Receita Federal do Brasil", "Brasília", "DF"),
        ("crea-ms", "CREA-MS", "Campo Grande", "MS"),
        ("pref-candeias", "Prefeitura de Candeias — Secretaria de Infraestrutura", "Candeias", "BA"),
        ("anp", "ANP — Agência Nacional do Petróleo, Gás Natural e Biocombustíveis", "Rio de Janeiro", "RJ"),
    ]  # fmt: skip
    for key, name, city, uf in agencies:
        _contact(key, name, ["orgao"], city=city, state=uf)
    reps = [
        ("atlas-fiscal", "Ricardo Menezes", "Fiscal de contrato — Atlas", "atlas", "Candeias", "BA"),
        ("vertice-gerente", "Paula Siqueira", "Gerente de contrato — Vértice", "vertice", "Candeias", "BA"),
        ("aco-vendas", "Jorge Taveira", "Vendas — Aço Brasil", "aco", "Salvador", "BA"),
        ("advogada", "Marina Tavares", "Advogada empresarial", "", "Campo Grande", "MS"),
        ("contador", "Hélio Bastos", "Contador responsável", "bastos", "Campo Grande", "MS"),
    ]
    for key, name, title, parent, city, uf in reps:
        roles = ["profissional"] if key in ("advogada", "contador") else ["representante"]
        _contact(key, name, roles, kind="person", title=title, parentId=uid(f"contact:{parent}") if parent else None,
                 city=city, state=uf, email=f"{slug(name.split()[0])}@contato.example", phone=_phone(71))  # fmt: skip

    names: list[str] = []
    while len(names) < 34:
        name = f"{pick(FIRST)} {pick(LAST)}"
        if name not in names:
            names.append(name)
    index = 0
    for obra, role, qty in STAFFING:
        for _ in range(qty):
            name = names[index]
            key = f"emp-{index + 1:02d}"
            contact_id = _contact(key, name, ["colaborador"], kind="person", title=ROLE_LABEL[role],
                                  document=_masked_cpf(), phone=_phone(67 if obra == "cuiaba" else 71),
                                  city="Campo Grande" if index % 3 == 0 else "Salvador",
                                  state="MS" if index % 3 == 0 else "BA")  # fmt: skip
            add("employees", key, contactId=contact_id, name=name, role=role, roleLabel=ROLE_LABEL[role],
                registration=f"CGA-{1000 + index}", obraId=uid(f"obra:{obra}"),
                admissionDate=d(-rng.randint(60, 1500)), salaryCents=brl(SALARY[role]),
                teamName="Equipe de armação" if role == "rebar" else None, status="active")  # fmt: skip
            index += 1


def build() -> None:
    company_and_users()
    contacts_and_employees()
