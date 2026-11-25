"""CRM da clínica: pedidos de contato (leads) com consentimento e painel de mercado."""
import sqlite3

ANA = {"email": "ana.ribeiro@exemplo.com", "senha": "demo123"}            # tutora (cliente)
VIDAPET = {"email": "contato@vidapet.exemplo", "senha": "demo123"}       # clínica parceira
PEDIDO = {"clinica_id": 1, "motivo": "Consulta de rotina", "mensagem": "Prefiro à tarde.",
          "contato": "whatsapp", "consentimento": True}


def entrar(cliente, conta):
    assert cliente.post("/api/login", json=conta).status_code == 200


def test_parceiras_sao_as_clinicas_com_conta(cliente):
    parceiras = cliente.get("/api/parceiras").get_json()
    assert "Clínica VidaPet" in [p["nome"] for p in parceiras]           # outras clínicas criadas no banco também entram
    assert {"telefone", "endereco", "especialidades", "horario_texto"} <= set(parceiras[0])


def test_pedido_de_contato_exige_login_de_tutor_e_consentimento(cliente, banco_temp):
    assert cliente.post("/api/leads", json=PEDIDO).status_code == 401                 # sem login
    entrar(cliente, VIDAPET)
    assert cliente.post("/api/leads", json=PEDIDO).status_code == 403                 # clínica não pede contato
    cliente.post("/api/logout")
    entrar(cliente, ANA)
    assert cliente.post("/api/leads", json=PEDIDO | {"consentimento": False}).status_code == 400
    assert cliente.post("/api/leads", json=PEDIDO | {"contato": "pombo"}).status_code == 400
    assert cliente.post("/api/leads", json=PEDIDO | {"clinica_id": 5}).status_code == 404   # clínica sem conta não é parceira
    r = cliente.post("/api/leads", json=PEDIDO)
    assert r.status_code == 201
    assert cliente.post("/api/leads", json=PEDIDO).status_code == 409                 # já há um pedido aberto


def test_clinica_ve_e_move_so_os_proprios_pedidos(cliente, banco_temp):
    entrar(cliente, ANA)
    lead_id = cliente.post("/api/leads", json=PEDIDO).get_json()["id"]
    cliente.post("/api/logout")

    entrar(cliente, VIDAPET)
    leads = cliente.get("/api/clinica/leads").get_json()["leads"]
    meu = next(l for l in leads if l["id"] == lead_id)
    assert meu["status"] == "novo" and meu["tutor"]["nome"] == "Ana Ribeiro" and meu["tutor"]["email"] == ANA["email"]
    assert meu["pet"]["especie"] in ("cao", "gato")
    texto = str(leads)
    assert "cpf" not in texto and "observacoes_saude" not in texto                     # só o necessário (LGPD)
    r = cliente.patch(f"/api/clinica/leads/{lead_id}", json={"status": "agendado", "nota": "Sexta 15h"})
    assert r.status_code == 200 and r.get_json()["status"] == "agendado" and r.get_json()["nota"] == "Sexta 15h"
    assert cliente.patch(f"/api/clinica/leads/{lead_id}", json={"status": "sumido"}).status_code == 400
    cliente.post("/api/logout")

    # outra clínica não enxerga nem altera o pedido da VidaPet
    cliente.post("/api/cadastro", json={"tipo": "clinica", "email": "outra@exemplo.com", "senha": "segredo1",
                                        "nome": "Outra Clínica", "telefone": "(19) 3000-0000", "endereco": "Rua X, 1",
                                        "abre": "08:00", "fecha": "18:00", "especialidades": ["clinico_geral"]})
    assert lead_id not in [l["id"] for l in cliente.get("/api/clinica/leads").get_json()["leads"]]
    assert cliente.patch(f"/api/clinica/leads/{lead_id}", json={"status": "perdido"}).status_code == 404
    cliente.post("/api/logout")
    entrar(cliente, ANA)
    assert cliente.get("/api/clinica/leads").status_code == 403                       # tutor não vê o CRM


def test_recomendacao_fica_anonima_na_demanda_da_regiao(cliente, banco_temp):
    entrar(cliente, VIDAPET)
    antes = cliente.get("/api/clinica/painel?dias=30").get_json()["demanda_ia"]
    cliente.post("/api/logout")
    cliente.post("/api/recomendar", json={"tutor_id": 1, "especie": "cao", "idade_anos": 4, "porte": "medio",
                                          "situacao": "convulsao", "hora": "22:00"})
    entrar(cliente, VIDAPET)
    depois = cliente.get("/api/clinica/painel?dias=30").get_json()["demanda_ia"]
    conta = lambda d: next((e["atual"] for e in d["especialidades"] if e["especialidade"] == "emergencia"), 0)
    assert conta(depois) == conta(antes) + 1
    with sqlite3.connect(banco_temp) as con:
        colunas = [c[1] for c in con.execute("PRAGMA table_info(recomendacoes)")]
    assert "tutor_id" not in colunas                                                  # anônima por construção


def test_painel_compara_com_o_periodo_anterior(cliente, banco_temp):
    entrar(cliente, VIDAPET)
    p = cliente.get("/api/clinica/painel?dias=90").get_json()
    assert p["janela_dias"] == 90
    for k in ("compras", "faturamento", "ticket_medio", "clientes_ativos"):
        assert {"atual", "anterior"} <= set(p["comparativo"][k])
    assert set(p["contatos"]) == {"novo", "em_contato", "agendado", "atendido", "perdido"}
    assert cliente.get("/api/clinica/painel?dias=7").status_code == 400
