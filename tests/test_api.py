"""Smoke tests da API. Rode: pytest tests/  (requer banco criado e modelo treinado)."""
import pytest

# as fixtures cliente e banco_temp (cópia do banco para cada teste) estão em tests/conftest.py


def test_ofertas(cliente):
    r = cliente.get("/api/ofertas")
    assert r.status_code == 200
    ofertas = r.get_json()
    assert len(ofertas) >= 27
    assert {"produto", "loja", "preco"} <= set(ofertas[0])


def test_sem_localizacao_nao_mostra_clinicas(cliente):
    """Só clínicas reais: sem GPS ou cidade, nada de clínicas fictícias, só o pedido de localização."""
    r = cliente.get("/api/clinicas?meta=1&especialidade=odontologia&hora=23:00").get_json()
    assert r["clinicas"] == [] and r["meta"]["fonte"] == "sem_posicao"
    assert "localização" in r["meta"]["aviso"]
    assert cliente.get("/api/clinicas").get_json() == []


def test_recomendar_emergencia(cliente):
    r = cliente.post("/api/recomendar", json={"tutor_id": 1, "especie": "cao", "idade_anos": 4,
                                              "porte": "medio", "situacao": "convulsao", "hora": "22:00"})
    assert r.status_code == 200
    corpo = r.get_json()
    assert corpo["ia"]["especialidade"] == "emergencia"
    assert corpo["ia"]["confianca"] > 0.5
    assert corpo["banco"]["clinicas"] == [] and corpo["banco"]["fonte"] == "sem_posicao"   # sem localização


def test_recomendar_valida_entrada(cliente):
    assert cliente.post("/api/recomendar", json={"especie": "peixe"}).status_code == 400


def test_compra_incrementa_historico(cliente):
    antes = cliente.get("/api/tutores/1/historico").get_json()["total_compras_janela"]
    r = cliente.post("/api/compras", json={"tutor_id": 1, "oferta_id": 25})
    assert r.status_code == 201
    assert r.get_json()["historico"]["total_compras_janela"] == antes + 1
    assert cliente.post("/api/compras", json={"oferta_id": 9999}).status_code == 400


def test_metricas(cliente):
    m = cliente.get("/api/modelo/metricas").get_json()
    assert m["acuracia"] > 0.85
    assert "situacao" in m["importancias"]




# ---------------- clínicas reais (OpenStreetMap) — sem rede: Overpass simulado
OVERPASS_FAKE = {"elements": [
    {"type": "node", "id": 1, "lat": -22.9100, "lon": -47.0600,
     "tags": {"amenity": "veterinary", "name": "Hospital Veterinário Central 24h", "opening_hours": "24/7",
              "phone": "+55 19 3333-0000", "addr:street": "Rua A", "addr:housenumber": "10", "addr:suburb": "Centro"}},
    {"type": "way", "id": 2, "center": {"lat": -22.9200, "lon": -47.0700},
     "tags": {"amenity": "veterinary", "name": "OdontoVet Sorriso", "opening_hours": "Mo-Fr 08:00-18:00"}},
    {"type": "node", "id": 3, "lat": -22.9000, "lon": -47.0500, "tags": {"amenity": "veterinary", "name": "Clínica do Bairro"}},
]}


@pytest.fixture
def overpass_falso(monkeypatch):
    import clinicas_osm
    monkeypatch.setattr(clinicas_osm, "_consultar_overpass", lambda lat, lon, r: OVERPASS_FAKE)
    monkeypatch.setattr(clinicas_osm, "_cache_get", lambda chave, vencido_ok=False: None)
    monkeypatch.setattr(clinicas_osm, "_cache_set", lambda chave, v: None)


def test_clinicas_reais_por_posicao(cliente, overpass_falso):
    r = cliente.get("/api/clinicas?meta=1&lat=-22.9056&lon=-47.0608&raio_km=5&hora=23:00").get_json()
    assert r["meta"]["fonte"] == "osm" and r["meta"]["total_no_raio"] == 3
    por_nome = {c["nome"]: c for c in r["clinicas"]}
    hosp = por_nome["Hospital Veterinário Central 24h"]
    assert hosp["fonte"] == "osm" and hosp["aberto_24h"] and hosp["aberta_agora"] is True
    assert "emergencia" in hosp["especialidades"] and hosp["especialidade_inferida"]
    assert "odontologia" in por_nome["OdontoVet Sorriso"]["especialidades"]
    assert por_nome["OdontoVet Sorriso"]["aberta_agora"] is False          # 23:00 fora de Mo-Fr 08-18
    assert por_nome["Clínica do Bairro"]["aberta_agora"] is None            # sem horário no OSM
    assert 0 < hosp["distancia_km"] < 1.0
    assert [c["distancia_km"] for c in r["clinicas"]] == sorted(c["distancia_km"] for c in r["clinicas"])


def test_recomendar_com_posicao_usa_osm_e_relaxa_filtro(cliente, overpass_falso):
    corpo = {"especie": "gato", "idade_anos": 3, "porte": "pequeno", "situacao": "coceira", "hora": "10:00",
             "lat": -22.9056, "lon": -47.0608, "raio_km": 5}
    r = cliente.post("/api/recomendar", json=corpo).get_json()
    assert r["ia"]["especialidade"] == "dermatologia"
    assert r["banco"]["fonte"] == "osm"
    assert r["banco"]["aviso"] and "dermatologia" in r["banco"]["aviso"]   # ninguém tem "derma" no nome → mostra todas
    assert len(r["banco"]["clinicas"]) == 3


def test_openstreetmap_fora_do_ar_sem_cache(cliente, monkeypatch):
    """Overpass sem resposta (timeout) e sem cache: nem erro 500 nem clínica fictícia, só o aviso."""
    import clinicas_osm
    def fora_do_ar(*a, **k):
        raise TimeoutError("The read operation timed out")
    monkeypatch.setattr(clinicas_osm, "_consultar_overpass", fora_do_ar)
    monkeypatch.setattr(clinicas_osm, "_cache_get", lambda chave, vencido_ok=False: None)
    r = cliente.get("/api/clinicas?meta=1&lat=-25.4284&lon=-49.2733&raio_km=5&hora=11:00")   # Curitiba: sem clínicas pesquisadas
    assert r.status_code == 200
    corpo = r.get_json()
    assert corpo["clinicas"] == [] and corpo["meta"]["fonte"] == "indisponivel"
    assert "OpenStreetMap" in corpo["meta"]["aviso"]
    rec = cliente.post("/api/recomendar", json={"tutor_id": 1, "situacao": "convulsao", "hora": "03:00", "lat": -25.4284, "lon": -49.2733})
    assert rec.status_code == 200 and rec.get_json()["banco"]["clinicas"] == []
    assert rec.get_json()["ia"]["especialidade"] == "emergencia"          # a IA responde mesmo sem clínicas


PERTO = {"lat": -23.0908, "lon": -47.2180}
OVERPASS_REGIAO = {"elements": [
    {"type": "node", "id": 10, "lat": -23.0950, "lon": -47.2200, "tags": {"amenity": "veterinary", "name": "Pet Centro"}},
    {"type": "node", "id": 11, "lat": -23.1700, "lon": -47.2200,               # ~8,8 km
     "tags": {"amenity": "veterinary", "name": "Clínica de Animais Silvestres e Exóticos", "opening_hours": "Mo-Fr 08:00-18:00; Sa 08:00-12:00"}},
    {"type": "node", "id": 12, "lat": -22.9500, "lon": -47.2180, "tags": {"amenity": "veterinary", "name": "Hospital Vet 24h", "opening_hours": "24/7"}},
]}


@pytest.fixture
def overpass_regiao(monkeypatch):
    """Overpass simulado com cache em memória: conta quantas consultas de verdade saem."""
    import clinicas_osm
    cache, chamadas = {}, []
    def consultar(lat, lon, raio_m):
        chamadas.append(raio_m)
        return OVERPASS_REGIAO
    monkeypatch.setattr(clinicas_osm, "_consultar_overpass", consultar)
    monkeypatch.setattr(clinicas_osm, "_cache_get", lambda chave, vencido_ok=False: cache.get(chave))
    monkeypatch.setattr(clinicas_osm, "_cache_set", lambda chave, v: cache.__setitem__(chave, v))
    return chamadas


def test_raio_filtra_no_app_com_uma_consulta_so(overpass_regiao):
    """Trocar o raio não consulta o Overpass de novo: busca a região uma vez e filtra pela distância."""
    import clinicas_osm
    nomes = lambda r: {c["nome"] for c in clinicas_osm.buscar_clinicas(PERTO["lat"], PERTO["lon"], r)}
    assert nomes(2) == {"Pet Centro"}
    assert nomes(10) == {"Pet Centro", "Clínica de Animais Silvestres e Exóticos"}
    assert len(nomes(20)) == 3
    assert overpass_regiao == [clinicas_osm.RAIO_BUSCA_KM * 1000]          # uma única consulta, no raio máximo


def test_horario_em_portugues():
    import clinicas_osm
    assert clinicas_osm.horario_legivel("Mo-Fr 08:00-18:00; Sa 08:00-12:00") == "seg–sex 08:00–18:00; sáb 08:00–12:00"
    assert clinicas_osm.horario_legivel("24/7") == "24h"
    assert clinicas_osm.horario_legivel("Su,PH off") == "dom, feriados fechado"
    assert clinicas_osm.horario_legivel("") == ""


def test_publico_silvestres_e_domesticos(cliente, overpass_regiao):
    base = "/api/clinicas?lat=-23.0908&lon=-47.2180&raio_km=5&publico="
    so_osm = lambda r: [c for c in r.get_json() if c["fonte"] == "osm"]   # as pesquisadas pela equipe têm teste próprio
    silvestres = so_osm(cliente.get(base + "silvestres"))         # silvestres: sempre no raio máximo (são raras)
    assert [c["nome"] for c in silvestres] == ["Clínica de Animais Silvestres e Exóticos"]
    assert silvestres[0]["atende_silvestres"] and silvestres[0]["horario_texto"] == "seg–sex 08:00–18:00; sáb 08:00–12:00"
    domesticos = [c["nome"] for c in so_osm(cliente.get(base + "domesticos"))]
    assert domesticos == ["Pet Centro"]                             # dentro dos 5 km e sem os silvestres
    assert cliente.get(base + "dinossauros").status_code == 400


INDAIATUBA = "lat=-23.0908356&lon=-47.2180677"


def test_clinicas_pesquisadas_aparecem_mesmo_com_osm_fora(cliente, monkeypatch):
    """As clínicas pesquisadas pela equipe (banco/clinicas_pesquisadas.json) não dependem do OpenStreetMap."""
    import clinicas_osm
    def fora(*a, **k):
        raise TimeoutError("fora do ar")
    monkeypatch.setattr(clinicas_osm, "_consultar_overpass", fora)
    monkeypatch.setattr(clinicas_osm, "_cache_get", lambda chave, vencido_ok=False: None)
    r = cliente.get(f"/api/clinicas?meta=1&publico=silvestres&hora=10:00&{INDAIATUBA}").get_json()
    assert {c["nome"] for c in r["clinicas"]} == {"Clínica Veterinária Indavet", "Bicos & Focinhos Clínica Veterinária", "Villa Zoo Clínica Veterinária",
                                                "Hospital-Escola Veterinário UniMAX"}
    assert all(c["fonte"] == "equipe" and c["fonte_url"].startswith("https://") for c in r["clinicas"])
    assert r["meta"]["fonte"] == "equipe" and "OpenStreetMap" in r["meta"]["aviso"]
    perto = [c["nome"] for c in cliente.get(f"/api/clinicas?publico=domesticos&raio_km=2&{INDAIATUBA}").get_json()]
    assert perto == ["Clínica Veterinária Indavet", "Bicos & Focinhos Clínica Veterinária"]   # raio de 2 km, por distância
    longe = [c["nome"] for c in cliente.get(f"/api/clinicas?publico=domesticos&raio_km=10&{INDAIATUBA}").get_json()]
    assert "Hospital Veterinário Vet Prado" in longe                                            # 24h, só cães e gatos
    assert "Hospital Veterinário Vet Prado" not in {c["nome"] for c in r["clinicas"]}


def test_clinicas_pesquisadas_vem_primeiro(cliente, overpass_regiao):
    lista = cliente.get("/api/clinicas?publico=domesticos&raio_km=10&lat=-23.0908&lon=-47.2180").get_json()
    fontes = [c["fonte"] for c in lista]
    assert fontes == sorted(fontes, key=lambda f: f != "equipe") and "osm" in fontes
    vet_prado = next(c for c in lista if c["nome"] == "Hospital Veterinário Vet Prado")
    assert vet_prado["horario_texto"] == "24h" and "emergencia" in vet_prado["especialidades"]


def test_overpass_usa_o_servidor_que_responder(monkeypatch):
    """Os servidores são consultados ao mesmo tempo: vale a primeira resposta boa, mesmo que outros falhem."""
    import time
    import clinicas_osm
    lento, fora, rapido = clinicas_osm.OVERPASS_URLS
    def http_falso(url, data=None, timeout=30):
        if url == lento:
            time.sleep(2)                      # o 1º da lista está lento: não pode atrasar a resposta
        if url == fora:
            raise TimeoutError("fora do ar")
        return {"elements": [{"servidor": url}]}
    monkeypatch.setattr(clinicas_osm, "_http_json", http_falso)
    inicio = time.monotonic()
    assert clinicas_osm._consultar_overpass(-23.09, -47.21, 5000) == {"elements": [{"servidor": rapido}]}
    assert time.monotonic() - inicio < 1.5     # um de cada vez levaria 2 s


def test_overpass_todos_fora_do_ar(monkeypatch):
    import clinicas_osm
    chamadas = []
    def http_falso(url, data=None, timeout=30):
        chamadas.append(url)
        raise TimeoutError("fora do ar")
    monkeypatch.setattr(clinicas_osm, "_http_json", http_falso)
    monkeypatch.setattr(clinicas_osm.time, "sleep", lambda s: None)
    with pytest.raises(TimeoutError):
        clinicas_osm._consultar_overpass(-23.09, -47.21, 5000)
    assert len(chamadas) == 2 * len(clinicas_osm.OVERPASS_URLS)      # falhou rápido: uma 2ª rodada


def test_overpass_segunda_rodada_salva(monkeypatch):
    """Erros 500/502/504 rápidos costumam passar em segundos: a 2ª rodada aproveita."""
    import clinicas_osm
    chamadas = []
    def http_falso(url, data=None, timeout=30):
        chamadas.append(url)
        if len(chamadas) <= len(clinicas_osm.OVERPASS_URLS):
            raise OSError("HTTP 502")
        return {"elements": []}
    monkeypatch.setattr(clinicas_osm, "_http_json", http_falso)
    monkeypatch.setattr(clinicas_osm.time, "sleep", lambda s: None)
    assert clinicas_osm._consultar_overpass(-23.09, -47.21, 5000) == {"elements": []}


def test_servidores_fora_usa_resposta_antiga_do_cache(monkeypatch):
    """Sem servidor, a última resposta boa (mesmo vencida) vale mais que as clínicas fictícias."""
    import clinicas_osm
    def fora(*a, **k):
        raise TimeoutError("fora do ar")
    monkeypatch.setattr(clinicas_osm, "_consultar_overpass", fora)
    monkeypatch.setattr(clinicas_osm, "_cache_get", lambda chave, vencido_ok=False: OVERPASS_FAKE if vencido_ok else None)
    lista = clinicas_osm.buscar_clinicas(-22.9056, -47.0608, 5)
    assert [c["nome"] for c in lista][:1] == ["Hospital Veterinário Central 24h"]


def test_geocodificar_valida_entrada(cliente):
    assert cliente.get("/api/geocodificar?q=ab").status_code == 400


def test_opening_hours_parser():
    from datetime import datetime
    import clinicas_osm as o
    qua10 = datetime(2026, 9, 9, 10, 0)
    assert o.aberta_em("24/7", qua10) is True
    assert o.aberta_em("Mo-Fr 08:00-17:00; Sa 08:00-12:00", qua10) is True
    assert o.aberta_em("Mo-Fr 08:00-17:00; Sa 08:00-12:00", datetime(2026, 9, 13, 10, 0)) is False   # domingo
    assert o.aberta_em("Mo-Fr 19:00-07:00", datetime(2026, 9, 9, 23, 30)) is True                     # cruza meia-noite
    assert o.aberta_em(None, qua10) is None and o.aberta_em("by appointment", qua10) is None


# ---------------- contas (login de demonstração) e painel da clínica
CLIENTE_NOVO = {"tipo": "cliente", "email": "Teste.Cliente@Exemplo.com", "senha": "segredo1",
                "nome": "Teste Cliente", "cpf": "123.456.789-09", "telefone": "(19) 90000-0000", "endereco": "Rua Teste, 1",
                "pet": {"nome": "Bolt", "especie": "cao", "raca": "Beagle", "idade_anos": 3, "porte": "medio",
                        "observacoes_saude": "Alergia a frango (fictício)"}}
CLINICA_NOVA = {"tipo": "clinica", "email": "clinica.teste@exemplo.com", "senha": "segredo1", "nome": "Clínica Teste",
                "telefone": "(19) 3000-0000", "endereco": "Av. Teste, 2", "abre": "08:00", "fecha": "18:00",
                "especialidades": ["nutricao"]}


def test_cadastro_cliente_cria_tutor_pet_e_guarda_hash(cliente, banco_temp):
    import sqlite3
    r = cliente.post("/api/cadastro", json=CLIENTE_NOVO)
    assert r.status_code == 201
    conta = r.get_json()["conta"]
    assert conta["tipo"] == "cliente" and conta["email"] == "teste.cliente@exemplo.com"
    assert conta["pet"]["raca"] == "Beagle" and conta["tutor"]["cpf"] == "123.456.789-09"
    assert "senha_hash" not in conta
    with sqlite3.connect(banco_temp) as con:
        senha_hash, tutor_id = con.execute("SELECT senha_hash, tutor_id FROM contas WHERE email=?", (conta["email"],)).fetchone()
    assert senha_hash != "segredo1" and senha_hash.startswith(("scrypt:", "pbkdf2:"))
    assert tutor_id == conta["tutor"]["id"]
    # sessão aberta: o histórico e as compras usam o tutor da conta
    assert cliente.get("/api/sessao").get_json()["conta"]["id"] == conta["id"]
    assert cliente.post("/api/compras", json={"oferta_id": 1}).status_code == 201
    assert cliente.get(f"/api/tutores/{tutor_id}/historico").get_json()["total_compras_janela"] == 1
    assert cliente.get("/api/tutores/2").status_code == 403          # dados de outro tutor
    # e-mail repetido (sem diferenciar maiúsculas)
    assert cliente.post("/api/cadastro", json=CLIENTE_NOVO | {"email": "TESTE.cliente@exemplo.com"}).status_code == 409


def test_cadastro_valida_entrada(cliente, banco_temp):
    assert cliente.post("/api/cadastro", json=CLIENTE_NOVO | {"cpf": "123"}).status_code == 400
    assert cliente.post("/api/cadastro", json=CLIENTE_NOVO | {"senha": "123"}).status_code == 400
    assert cliente.post("/api/cadastro", json=CLIENTE_NOVO | {"tipo": "admin"}).status_code == 400
    assert cliente.post("/api/cadastro", json=CLINICA_NOVA | {"especialidades": ["astrologia"]}).status_code == 400
    assert cliente.post("/api/cadastro", json=CLINICA_NOVA | {"abre": "25:00"}).status_code == 400


def test_login_logout(cliente, banco_temp):
    assert cliente.post("/api/login", json={"email": "ana.ribeiro@exemplo.com", "senha": "errada"}).status_code == 401
    r = cliente.post("/api/login", json={"email": "ana.ribeiro@exemplo.com", "senha": "demo123"})
    assert r.status_code == 200 and r.get_json()["conta"]["tutor"]["id"] == 1
    assert cliente.post("/api/logout").status_code == 200
    assert cliente.get("/api/sessao").get_json()["conta"] is None


def test_painel_restrito_a_clinica(cliente, banco_temp):
    assert cliente.get("/api/clinica/painel").status_code == 401                       # sem login
    cliente.post("/api/login", json={"email": "ana.ribeiro@exemplo.com", "senha": "demo123"})
    assert cliente.get("/api/clinica/painel").status_code == 403                       # conta cliente
    cliente.post("/api/logout")
    r = cliente.post("/api/cadastro", json=CLINICA_NOVA)
    assert r.status_code == 201 and r.get_json()["conta"]["clinica"]["especialidades"] == ["nutricao"]
    assert cliente.post("/api/compras", json={"oferta_id": 1}).status_code == 403      # clínica não compra
    p = cliente.get("/api/clinica/painel?periodo=semana").get_json()
    assert p["clinica"]["nome"] == "Clínica Teste" and "GROUP BY" in p["origem"]
    assert p["totais"]["compras"] > 0 and p["mais_comprados"]
    assert {e["especie"] for e in p["especies"]} == {"cao", "gato"}
    assert len(p["volume"]) == 12 and sum(v["compras"] for v in p["volume"]) > 0
    assert all(0 < m["participacao"] <= 1 for lista in p["match_categoria_especie"].values() for m in lista)
    texto = str(p)
    assert "cpf" not in texto and "observacoes_saude" not in texto                     # só agregados
    assert all(r["n"] >= 2 or r["raca"] == "Outras" for r in p["racas"])               # sem grupos de 1 pet


def test_pedido_do_carrinho(cliente, banco_temp):
    precos = {o["id"]: o["preco"] for o in cliente.get("/api/ofertas").get_json()}
    antes = cliente.get("/api/tutores/1/historico").get_json()["total_compras_janela"]
    pedido = {"tutor_id": 1, "itens": [{"oferta_id": 1, "quantidade": 2}, {"oferta_id": 25}],
              "entrega": "entrega", "pagamento": "pix"}
    r = cliente.post("/api/pedidos", json=pedido)
    assert r.status_code == 201
    p = r.get_json()
    assert p["numero"].startswith("PP-") and p["pagamento"] == "pix"
    assert p["subtotal"] == round(precos[1] * 2 + precos[25], 2)
    assert p["total"] == round(p["subtotal"] + p["frete"], 2)
    assert (p["frete"] == 0) == (p["subtotal"] >= 100)                 # frete grátis acima de R$ 100
    assert p["historico"]["total_compras_janela"] == antes + 2         # uma linha em compras por item
    assert cliente.post("/api/pedidos", json=pedido | {"entrega": "retirada"}).get_json()["frete"] == 0


def test_meus_pedidos(cliente):
    novo = cliente.post("/api/pedidos", json={"tutor_id": 1, "itens": [{"oferta_id": 1, "quantidade": 2}],
                                              "entrega": "retirada", "pagamento": "dinheiro"}).get_json()
    lista = cliente.get("/api/pedidos?tutor_id=1").get_json()
    p = lista[0]                                                          # o mais recente primeiro
    assert p["numero"] == novo["numero"] and p["total"] == novo["total"]
    assert p["entrega"] == "retirada" and p["pagamento"] == "dinheiro" and p["data"]
    assert p["itens"][0]["quantidade"] == 2 and p["itens"][0]["nome"] and p["itens"][0]["loja"]
    assert cliente.get("/api/pedidos?tutor_id=2").status_code == 401      # pedidos de outro tutor, sem login


def test_pedido_valida_entrada(cliente, banco_temp):
    antes = cliente.get("/api/tutores/1/historico").get_json()["total_compras_janela"]
    base = {"tutor_id": 1, "itens": [{"oferta_id": 1}], "entrega": "retirada", "pagamento": "dinheiro"}
    assert cliente.post("/api/pedidos", json=base | {"itens": []}).status_code == 400
    assert cliente.post("/api/pedidos", json=base | {"itens": [{"oferta_id": 1, "quantidade": 0}]}).status_code == 400
    assert cliente.post("/api/pedidos", json=base | {"itens": ["x"]}).status_code == 400
    assert cliente.post("/api/pedidos", json=base | {"pagamento": "bitcoin"}).status_code == 400
    assert cliente.post("/api/pedidos", json=base | {"entrega": "drone"}).status_code == 400
    # oferta inexistente no meio do carrinho: nada é gravado (transação única)
    assert cliente.post("/api/pedidos", json=base | {"itens": [{"oferta_id": 1}, {"oferta_id": 9999}]}).status_code == 400
    assert cliente.get("/api/tutores/1/historico").get_json()["total_compras_janela"] == antes


def test_clinica_cadastrada_nao_entra_na_lista_dos_tutores(cliente, banco_temp, overpass_falso):
    """Só clínicas do OpenStreetMap aparecem: a conta de clínica serve ao painel, não à lista."""
    cliente.post("/api/cadastro", json=CLINICA_NOVA)
    nomes = [c["nome"] for c in cliente.get("/api/clinicas?lat=-22.9056&lon=-47.0608").get_json()]
    assert "Clínica Teste" not in nomes and all(n for n in nomes)
