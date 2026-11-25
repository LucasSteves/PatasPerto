/* ============================================================
   PatasPerto — front-end (app.js)
   Os dados NÃO estão mais chumbados aqui: lojas, produtos,
   ofertas e clínicas vêm da API Flask (app.py) que lê o SQLite.
   Seções: Loja · Recomendação (IA) · Emergência · Perfil
   ============================================================ */

const API = "";            // mesma origem (a página é servida pelo Flask)
let TUTOR_ID = 1;          // tutor demo do banco; com conta cliente logada, vira o tutor da conta
let conta = null;          // conta logada (GET /api/sessao) — null no modo demonstração

const ILUSTRACOES = {
  racaoCao: '<svg viewBox="0 0 100 100"><rect x="28" y="26" width="44" height="58" rx="6" fill="#D98A3D"/><path d="M28 26 L40 19 L60 19 L72 26 Z" fill="#B5702B"/><circle cx="50" cy="56" r="6" fill="#5A3A1A"/><circle cx="42" cy="48" r="3" fill="#5A3A1A"/><circle cx="50" cy="46" r="3" fill="#5A3A1A"/><circle cx="58" cy="48" r="3" fill="#5A3A1A"/></svg>',
  racaoGato: '<svg viewBox="0 0 100 100"><rect x="28" y="26" width="44" height="58" rx="6" fill="#3E8FC0"/><path d="M28 26 L40 19 L60 19 L72 26 Z" fill="#2E6E96"/><ellipse cx="47" cy="56" rx="12" ry="7" fill="#fff"/><path d="M58 56 L67 49 L67 63 Z" fill="#fff"/><circle cx="42" cy="54" r="1.6" fill="#2E6E96"/></svg>',
  bola: '<svg viewBox="0 0 100 100"><circle cx="50" cy="52" r="26" fill="#E24B4A"/><line x1="24" y1="52" x2="76" y2="52" stroke="#B23636" stroke-width="3"/><ellipse cx="50" cy="52" rx="10" ry="26" fill="none" stroke="#B23636" stroke-width="3"/><circle cx="42" cy="44" r="6" fill="#fff" opacity="0.55"/></svg>',
  caminha: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="74" rx="32" ry="11" fill="#B98E57"/><ellipse cx="50" cy="70" rx="26" ry="8" fill="#E7D3A8"/><path d="M30 68 q20 -17 40 0 q-20 7 -40 0 Z" fill="#8A7A63"/><circle cx="35" cy="63" r="6" fill="#8A7A63"/><path d="M31 59 l1 -5 4 3 Z" fill="#8A7A63"/><path d="M39 59 l-1 -5 -4 3 Z" fill="#8A7A63"/></svg>',
  areia: '<svg viewBox="0 0 100 100"><rect x="30" y="26" width="40" height="56" rx="6" fill="#8FB3C7"/><path d="M30 26 L41 20 L59 20 L70 26 Z" fill="#6E93A8"/><g fill="#4F6B7D"><circle cx="42" cy="52" r="2"/><circle cx="50" cy="48" r="2"/><circle cx="58" cy="54" r="2"/><circle cx="46" cy="60" r="2"/><circle cx="55" cy="62" r="2"/><circle cx="50" cy="56" r="2"/></g></svg>',
  petisco: '<svg viewBox="0 0 100 100"><g transform="rotate(-28 50 50)" fill="#E8C98A" stroke="#C9A461" stroke-width="2"><circle cx="32" cy="45" r="7"/><circle cx="32" cy="57" r="7"/><circle cx="68" cy="45" r="7"/><circle cx="68" cy="57" r="7"/><rect x="32" y="44" width="36" height="14" rx="4"/></g></svg>'
,
  antipulgas: '<svg viewBox="0 0 100 100"><path d="M40 20 h20 v14 l8 10 v34 a8 8 0 0 1 -8 8 h-20 a8 8 0 0 1 -8 -8 v-34 l8 -10 Z" fill="#7BC47F"/><rect x="40" y="14" width="20" height="8" rx="2" fill="#4E8F52"/><path d="M36 56 h28" stroke="#fff" stroke-width="3"/><circle cx="50" cy="70" r="6" fill="#fff"/></svg>',
  shampoo: '<svg viewBox="0 0 100 100"><rect x="34" y="34" width="32" height="50" rx="8" fill="#6FB1E8"/><rect x="42" y="18" width="16" height="18" rx="3" fill="#3C7FB8"/><rect x="45" y="12" width="10" height="8" rx="2" fill="#2E6693"/><ellipse cx="50" cy="60" rx="10" ry="12" fill="#fff" opacity=".7"/></svg>',
  dental: '<svg viewBox="0 0 100 100"><path d="M30 30 q20 -14 40 0 q6 22 -4 46 q-6 8 -10 -6 q-4 -12 -12 0 q-4 14 -10 6 q-10 -24 -4 -46 Z" fill="#fff" stroke="#8FC9A0" stroke-width="4"/><path d="M40 40 q10 -6 20 0" stroke="#8FC9A0" stroke-width="3" fill="none"/></svg>',
  escova: '<svg viewBox="0 0 100 100"><rect x="46" y="30" width="10" height="56" rx="5" fill="#F0A24A"/><rect x="40" y="14" width="22" height="20" rx="4" fill="#fff" stroke="#C9A461" stroke-width="2"/><g fill="#E24B4A"><rect x="43" y="17" width="3" height="14"/><rect x="49" y="17" width="3" height="14"/><rect x="55" y="17" width="3" height="14"/></g></svg>',
  suplemento: '<svg viewBox="0 0 100 100"><rect x="30" y="30" width="40" height="54" rx="8" fill="#F2C14E"/><rect x="34" y="22" width="32" height="12" rx="3" fill="#C9962B"/><rect x="36" y="46" width="28" height="22" rx="3" fill="#fff"/><path d="M42 57 h16 M50 49 v16" stroke="#E24B4A" stroke-width="4"/></svg>',
  racaoSenior: '<svg viewBox="0 0 100 100"><rect x="28" y="26" width="44" height="58" rx="6" fill="#8E6BBF"/><path d="M28 26 L40 19 L60 19 L72 26 Z" fill="#6A4D94"/><text x="50" y="62" text-anchor="middle" font-size="22" font-weight="bold" fill="#fff" font-family="Arial">7+</text></svg>',
  racaoLight: '<svg viewBox="0 0 100 100"><rect x="28" y="26" width="44" height="58" rx="6" fill="#5DC1A0"/><path d="M28 26 L40 19 L60 19 L72 26 Z" fill="#3E9A7C"/><path d="M38 62 q12 -22 24 0" stroke="#fff" stroke-width="4" fill="none"/><circle cx="50" cy="48" r="4" fill="#fff"/></svg>',
  tapete: '<svg viewBox="0 0 100 100"><rect x="18" y="30" width="64" height="44" rx="6" fill="#DDE9F7" stroke="#9DB9DA" stroke-width="3"/><path d="M26 38 h48 M26 46 h48 M26 54 h48 M26 62 h48" stroke="#B8CFE9" stroke-width="2"/><ellipse cx="62" cy="58" rx="9" ry="6" fill="#F2D77A"/></svg>'
};

/* ---- Classes de domínio (as mesmas do protótipo; agora hidratadas via API) ---- */
class Loja {
  constructor(d) { Object.assign(this, { id: d.id, nome: d.nome, distanciaKm: d.distancia_km, nota: d.nota, qtdAvaliacoes: d.qtd_avaliacoes, endereco: d.endereco }); }
}
class Produto {
  constructor(d) { Object.assign(this, { id: d.id, nome: d.nome, categoria: d.categoria, grupoIa: d.grupo_ia, img: d.img, descricao: d.descricao, caracteristicas: d.caracteristicas, comentarios: d.comentarios }); }
  mediaAvaliacoes() { return this.comentarios.length ? this.comentarios.reduce((s, c) => s + c.nota, 0) / this.comentarios.length : 0; }
}
class Oferta {
  constructor(id, produto, loja, preco, entrega) { Object.assign(this, { id, produto, loja, preco, entrega }); }
  frete() { return this.preco >= 100 ? 0 : Math.round((8.90 + this.loja.distanciaKm * 4) * 100) / 100; }
  prazoEntrega() { const d = this.loja.distanciaKm; return d < 1 ? "1 dia útil" : d < 2 ? "2 dias úteis" : "3 dias úteis"; }
  tempoRetirada() { return Math.max(2, Math.round(this.loja.distanciaKm * 4)) + " min de carro"; }
}
class Catalogo {
  constructor() { this.ofertas = []; }
  adicionar(o) { this.ofertas.push(o); }
  buscar(termo) { const t = this._n(termo); return t === "" ? this.ofertas.slice() : this.ofertas.filter(o => this._n(o.produto.nome).includes(t) || this._n(o.produto.categoria).includes(t)); }
  ofertasDoProduto(p) { return this.ofertas.filter(o => o.produto.id === p.id); }
  _n(t) { return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim(); }
}

const catalogo = new Catalogo();
let metricasModelo = null;

/* ---- Utilidades ---- */
const $ = id => document.getElementById(id);
const grade = $("grade"), info = $("info"), campo = $("campoBusca");
const telas = { lista: $("telaLista"), produto: $("telaProduto"), carrinho: $("telaCarrinho"), emergencia: $("telaEmergencia"), recomendacao: $("telaRecomendacao"), perfil: $("telaPerfil"), mapa: $("telaMapa"),
  login: $("telaLogin"), painel: $("telaPainel") };
let termoAtual = "", ordemAtual = "preco";

const fmt = v => "R$ " + v.toFixed(2).replace(".", ",");
const num1 = v => v.toFixed(1).replace(".", ",");
const pct = p => Math.round(p * 100) + "%";
const iconeEntrega = e => e.startsWith("Retira") ? ic("loja") : ic("caminhao");
const estrelas = n => "★".repeat(n) + "☆".repeat(5 - n);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const horaAgora = () => new Date().toTimeString().slice(0, 5);

/* ---- Ícones (SVG de traço, 24×24, herdam a cor do texto) — substituem os emojis da interface ---- */
const ICONES = {
  busca: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  grupo: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20a7 7 0 0 1 14 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13.5a7 7 0 0 1 4 6.5"/>',
  carrinho: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.7 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21.5 8H6"/>',
  loja: '<path d="M3 9l1.6-5h14.8L21 9M4 9v11h16V9M3 9h18M9 20v-6h6v6"/>',
  caminhao: '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  ia: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  mapa: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  pulso: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  cruz: '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/>',
  pata: '<circle cx="6.5" cy="10" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="14" cy="5.5" r="2"/><circle cx="17.5" cy="10" r="2"/><path d="M7.5 17.5c0-3 2.2-5.5 4.5-5.5s4.5 2.5 4.5 5.5c0 2-1.8 3-4.5 3s-4.5-1-4.5-3z"/>',
  voltar: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  seta: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  menos: '<path d="M5 12h14"/>',
  lixo: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  pix: '<path d="M12 2.5l9.5 9.5-9.5 9.5L2.5 12z"/><path d="M8.5 12l3.5-3.5 3.5 3.5-3.5 3.5z"/>',
  cartao: '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h4"/>',
  dinheiro: '<rect x="2" y="6" width="20" height="12" rx="2.5"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9.5v5M18 9.5v5"/>',
  telefone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
  relogio: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  estetoscopio: '<path d="M6 3v6a5 5 0 0 0 10 0V3M11 14v2a5 5 0 0 0 10 0v-1"/><circle cx="21" cy="13" r="2"/>',
  cadeado: '<rect x="4" y="10" width="16" height="11" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  alerta: '<path d="M12 3l10 18H2zM12 10v5M12 18h.01"/>',
  gps: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  carro: '<path d="M5 16V12l2-5h10l2 5v4zM3 12h18"/><circle cx="8" cy="17" r="1.6"/><circle cx="16" cy="17" r="1.6"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  frasco: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3M7 15h10"/>',
  recibo: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
  alvo: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  grafico: '<path d="M3 3v18h18M7 15l4-4 3 3 5-6"/>',
  gota: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
  vento: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h7"/>',
  raio: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  passaro: '<path d="M16 7h.01M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20M20 7l2 .5-2 .5M10 18v3M14 17.75V21M7 18a6 6 0 0 0 3.84-10.61"/>',
  termometro: '<path d="M14 14.8V4a2 2 0 0 0-4 0v10.8a4 4 0 1 0 4 0z"/>',
};
const ic = nome => '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (ICONES[nome] || "") + '</svg>';
// ícones do index.html. ic() só devolve SVGs fixos de ICONES (o nome pedido nunca vai para o HTML), então não há XSS
document.querySelectorAll("[data-ic]").forEach(el => el.insertAdjacentHTML("afterbegin", ic(el.dataset.ic)));  // nosemgrep: react-unsanitized-method

/* A salsicha da marca, de perfil: o corpo estica conforme `progresso` (0 a 1) — usada no frete grátis do carrinho. */
function salsicha(progresso, rotulo) {
  const L = Math.round(24 + 196 * Math.min(1, Math.max(0, progresso)));   // comprimento do corpo
  return '<svg class="salsicha" viewBox="0 0 ' + (L + 92) + ' 66" role="img" aria-label="' + esc(rotulo) + '">' +
    '<rect x="17" y="40" width="8" height="18" rx="4" class="s-pata"/><rect x="31" y="40" width="8" height="18" rx="4" class="s-pata"/>' +
    '<rect x="' + (L + 18) + '" y="40" width="8" height="18" rx="4" class="s-pata"/><rect x="' + (L + 32) + '" y="40" width="8" height="18" rx="4" class="s-pata"/>' +
    '<path d="M16 32 Q3 24 7 9" class="s-rabo"/>' +
    '<rect x="11" y="24" width="' + (L + 34) + '" height="24" rx="12" class="s-corpo"/>' +
    '<g transform="translate(' + (L + 28) + ' 3)">' +
      '<path d="M2 27 Q-1 8 17 6 Q29 4 34 13 L51 19 Q58 22 54 28 Q48 33 31 31 Q15 37 2 27 Z" class="s-corpo"/>' +
      '<circle cx="53.5" cy="22.5" r="3.4" class="s-olho"/><circle cx="23" cy="14" r="2.5" class="s-olho"/>' +
      '<path d="M11 9 Q1 13 4 31 Q13 35 17 16 Z" class="s-orelha"/>' +
    '</g></svg>';
}

function toast(msg, ms = 2600) {
  const t = $("toast"); t.textContent = msg; t.classList.remove("oculto");
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.add("oculto"), ms);
}

async function api(caminho, opcoes) {
  const r = await fetch(API + caminho, opcoes ? { headers: { "Content-Type": "application/json" }, ...opcoes } : undefined);
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo.erro || ("HTTP " + r.status));
  return corpo;
}

const MSG_SEM_API = 'Não foi possível falar com o back-end. Inicie a API com <code>python app.py</code> e abra <b>http://127.0.0.1:5000</b>.';

/* ---- Carregamento dos dados (a base agora vem do SQLite via API) ---- */
async function carregarDados() {
  try {
    const ofertas = await api("/api/ofertas");
    const lojas = {}, produtos = {};
    ofertas.forEach(o => {
      lojas[o.loja.id] = lojas[o.loja.id] || new Loja(o.loja);
      produtos[o.produto.id] = produtos[o.produto.id] || new Produto(o.produto);
      catalogo.adicionar(new Oferta(o.id, produtos[o.produto.id], lojas[o.loja.id], o.preco, o.entrega));
    });
    render();
    if (telas.carrinho.style.display === "block") renderCarrinho();   // o carrinho depende do catálogo carregado
  } catch (e) {
    info.textContent = "";
    grade.innerHTML = '<div class="aviso-erro" style="grid-column:1/-1">' + MSG_SEM_API + '</div>';
  }
  api("/api/modelo/metricas").then(m => { metricasModelo = m; }).catch(() => {});
  posicaoTutor().catch(() => {});
}

/* ---- Lista / grade ---- */
function render() {
  let res = catalogo.buscar(termoAtual);
  if (ordemAtual === "preco") res.sort((a, b) => a.preco - b.preco);
  else res.sort((a, b) => a.loja.distanciaKm - b.loja.distanciaKm);

  let menor = null, perto = null;
  res.forEach(o => {
    if (!menor || o.preco < menor.preco) menor = o;
    if (!perto || o.loja.distanciaKm < perto.loja.distanciaKm) perto = o;
  });

  grade.innerHTML = "";
  if (res.length === 0) {
    info.textContent = "";
    grade.innerHTML = '<p class="vazio">Nenhum produto encontrado para “' + esc(termoAtual) + '”. Tente “ração”, “antipulgas” ou “dental”.</p>';
    return;
  }
  info.textContent = res.length + " ofertas perto de você" + (termoAtual.trim() ? " para “" + termoAtual + "”" : "") + " · dados do banco SQLite";

  res.forEach(o => {
    let badges = "";
    if (o === menor) badges += '<span class="badge b-preco">Menor preço</span>';
    if (o === perto) badges += '<span class="badge b-perto">Mais perto</span>';
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML =
      (badges ? '<div class="badges">' + badges + '</div>' : '') +
      '<div class="imgbox">' + (ILUSTRACOES[o.produto.img] || "") + '</div>' +
      '<div class="corpo">' +
        '<p class="preco">' + fmt(o.preco) + '</p>' +
        '<p class="titulo">' + esc(o.produto.nome) + '</p>' +
        '<p class="aval">★ ' + num1(o.loja.nota) + ' <span class="qtd">(' + o.loja.qtdAvaliacoes + ')</span></p>' +
        '<p class="entrega">' + iconeEntrega(o.entrega) + ' ' + o.entrega + ' · ' + num1(o.loja.distanciaKm) + ' km</p>' +
        '<p class="loja">' + esc(o.loja.nome) + '</p>' +
        '<span class="btn-ver">Ver oferta</span>' +
      '</div>';
    card.addEventListener("click", () => abrirProduto(o));
    grade.appendChild(card);
  });
}

/* ---- Página do produto ---- */
function abrirProduto(o) {
  const prod = o.produto, frete = o.frete(), media = prod.mediaAvaliacoes();
  const freteTxt = frete === 0 ? "Grátis" : fmt(frete);

  const tabelaCarac = '<table class="tabela">' + prod.caracteristicas.map(c => '<tr><td class="rot">' + esc(c[0]) + '</td><td>' + esc(c[1]) + '</td></tr>').join('') + '</table>';
  const listaComent = prod.comentarios.map(c =>
    '<div class="coment"><div class="topo"><span class="autor">' + esc(c.autor) + '</span><span class="estrelas">' + estrelas(c.nota) + '</span></div><p class="txt">' + esc(c.texto) + '</p></div>').join('');
  const painelAval = '<div class="resumo-aval"><span class="big">' + num1(media) + '</span><span><span class="estr">' + estrelas(Math.round(media)) + '</span><br><small>' + prod.comentarios.length + ' avaliações</small></span></div>' + listaComent;

  const outras = catalogo.ofertasDoProduto(prod).filter(x => x !== o).sort((a, b) => a.preco - b.preco);
  const outrasHtml = outras.length ? '<div class="outras"><h3>Outras lojas com este produto</h3>' +
    outras.map((x, i) => '<div class="oferta-lin" data-idx="' + i + '"><div class="mini">' + ILUSTRACOES[x.produto.img] + '</div>' +
      '<div class="ol-nome">' + esc(x.loja.nome) + '<small>' + ic("mapa") + ' ' + num1(x.loja.distanciaKm) + ' km · ' + esc(x.loja.endereco) + '</small></div>' +
      '<div class="ol-preco">' + fmt(x.preco) + '</div></div>').join("") + '</div>' : "";

  telas.produto.innerHTML =
    '<button class="voltar" id="btVoltar">' + ic("voltar") + ' Voltar aos resultados</button>' +
    '<div class="det-img">' + ILUSTRACOES[prod.img] + '</div>' +
    '<p class="det-cat">' + esc(prod.categoria) + '</p>' +
    '<h2 class="det-titulo">' + esc(prod.nome) + '</h2>' +
    '<p class="det-aval">★ ' + num1(media) + ' <span class="qtd">(' + prod.comentarios.length + ' avaliações)</span></p>' +
    '<p class="det-preco">' + fmt(o.preco) + '</p>' +
    '<div class="secao"><h3>Vendido por</h3><p><b>' + esc(o.loja.nome) + '</b> · ★ ' + num1(o.loja.nota) + '</p>' +
      '<p class="local">' + ic("mapa") + ' ' + esc(o.loja.endereco) + ' — a ' + num1(o.loja.distanciaKm) + ' km de você</p></div>' +
    '<div class="opcoes">' +
      '<div class="opcao"><h4>' + ic("loja") + ' Retirar na loja</h4><p class="destaque">Retire hoje</p><p>' + esc(o.loja.endereco) + '</p><p>A ' + num1(o.loja.distanciaKm) + ' km (~' + o.tempoRetirada() + ')</p><p>Sem custo de entrega</p></div>' +
      '<div class="opcao"><h4>' + ic("caminhao") + ' Receber em casa</h4><p class="destaque">Chega em ' + o.prazoEntrega() + '</p><p>Frete: ' + freteTxt + '</p>' +
        (frete === 0 ? '<p>Frete grátis acima de R$ 100</p>' : '<p>Calculado pela distância da loja</p>') + '</div>' +
    '</div>' +
    '<div class="acoes"><button class="comprar" id="btComprar">Comprar agora</button><button class="carrinho" id="btCarrinho">' + ic("carrinho") + ' Adicionar ao carrinho</button></div>' +
    '<p class="explica">' + ic("carrinho") + ' Cada compra é gravada no banco e passa a fazer parte do seu histórico — é esse dado que alimenta a recomendação da IA.</p>' +
    '<div class="abas"><button class="aba ativa" data-aba="desc">Descrição</button><button class="aba" data-aba="carac">Características</button><button class="aba" data-aba="aval">Avaliações (' + prod.comentarios.length + ')</button></div>' +
    '<div class="painel" id="painel-desc"><p class="secao" style="margin:0">' + esc(prod.descricao) + '</p></div>' +
    '<div class="painel oculto" id="painel-carac">' + tabelaCarac + '</div>' +
    '<div class="painel oculto" id="painel-aval">' + painelAval + '</div>' + outrasHtml;

  $("btVoltar").addEventListener("click", () => mostrar("lista"));
  $("btComprar").addEventListener("click", () => { adicionarAoCarrinho(o); abrirCarrinho(); });
  $("btCarrinho").addEventListener("click", () => { adicionarAoCarrinho(o); toast(prod.nome + " foi para o carrinho."); });
  telas.produto.querySelectorAll(".oferta-lin").forEach((el, i) => el.addEventListener("click", () => abrirProduto(outras[i])));
  telas.produto.querySelectorAll(".aba").forEach(b => b.addEventListener("click", () => {
    telas.produto.querySelectorAll(".aba").forEach(x => x.classList.remove("ativa"));
    telas.produto.querySelectorAll(".painel").forEach(x => x.classList.add("oculto"));
    b.classList.add("ativa"); telas.produto.querySelector("#painel-" + b.dataset.aba).classList.remove("oculto");
  }));
  mostrar("produto");
}

/* ================= PERFIL (tutor + pet) ================= */
const PERFIL_PADRAO = { nome: "Ana Ribeiro", email: "ana.ribeiro@exemplo.com", telefone: "(19) 98888-0000", endereco: "Rua das Acácias, 300 · Centro",
  petNome: "Thor", especie: "cao", idade: 6, porte: "medio", raca: "", obs: "", cpf: "", foto: "🐶" };
const ehCliente = () => !!conta && conta.tipo === "cliente";
// Conta cliente: os dados vêm do banco (tutor + pet). No navegador fica só a foto escolhida.
// Modo demonstração (sem conta): tudo continua salvo no navegador, como antes.
const chavePerfil = () => conta ? "perfil:" + conta.id : "perfil";
function perfilDaConta(c) {
  const t = c.tutor, pt = c.pet || {};
  return { nome: t.nome, email: c.email, telefone: t.telefone || "", endereco: t.endereco || "", cpf: t.cpf || "",
    petNome: pt.nome || "", especie: pt.especie || "cao", idade: pt.idade_anos ?? 0, porte: pt.porte || "medio",
    raca: pt.raca || "", obs: pt.observacoes_saude || "", foto: pt.especie === "gato" ? "🐱" : "🐶" };
}
function lerPerfil() {
  const base = ehCliente() ? perfilDaConta(conta) : {};
  try { return { ...PERFIL_PADRAO, ...base, ...JSON.parse(localStorage.getItem(chavePerfil()) || "{}") }; } catch { return { ...PERFIL_PADRAO, ...base }; }
}
async function salvarPerfil(p) {
  if (ehCliente()) {
    const r = await api("/api/perfil", { method: "PUT", body: JSON.stringify({ nome: p.nome, telefone: p.telefone, endereco: p.endereco,
      pet: { nome: p.petNome, especie: p.especie, idade_anos: p.idade, porte: p.porte, raca: p.raca, observacoes_saude: p.obs } }) });
    conta = r.conta;
    try { localStorage.setItem(chavePerfil(), JSON.stringify({ foto: p.foto })); } catch {}
  } else {
    try { localStorage.setItem(chavePerfil(), JSON.stringify(p)); } catch {}
  }
  atualizarConta();
}
function atualizarConta() {
  const modo = document.body.dataset.modo;
  let salvo = false; try { salvo = !!localStorage.getItem(chavePerfil()); } catch {}
  $("contaNome").textContent = conta && conta.tipo === "clinica" ? conta.clinica.nome
    : (conta || salvo) ? (lerPerfil().nome.split(" ")[0] || "Perfil") : "Perfil";   // sem conta: não fingir ser a tutora demo
  $("btSair").textContent = conta ? "Sair" : "Entrar";
  $("subtitulo").textContent = modo === "clinica" ? "Painel da clínica · contatos e mercado"
    : "Produtos para o seu pet nas lojas mais perto de você";
}

function renderPerfil() {
  const p = lerPerfil();
  const opt = (v, atual, rotulo) => '<option value="' + v + '"' + (v === atual ? ' selected' : '') + '>' + rotulo + '</option>';
  const cli = ehCliente();
  telas.perfil.innerHTML =
    '<div class="perfil-topo"><div class="foto-perfil" id="fotoPet">' + p.foto + '</div><p>Toque na foto para trocar</p></div>' +
    (cli ? '<div class="aviso lgpd">' + ic("cadeado") + ' <b>Dados fictícios.</b> CPF e informações de saúde deste projeto acadêmico são fictícios — não informe dados reais (LGPD).</div>'
         : '<div class="aviso lgpd">Você está no <b>modo demonstração</b>: o perfil fica salvo só neste navegador. <a href="#" id="lnkCriarConta">Crie uma conta</a> para salvar no banco.</div>') +
    '<div class="bloco"><h3>' + ic("usuario") + ' Tutor</h3><div class="form-grid">' +
      '<div><label class="rotulo">Nome</label><input class="campo" id="pNome" value="' + esc(p.nome) + '"></div>' +
      '<div><label class="rotulo">E-mail' + (cli ? ' (login)' : '') + '</label><input class="campo" id="pEmail" value="' + esc(p.email) + '"' + (cli ? ' readonly' : '') + '></div>' +
      '<div><label class="rotulo">Telefone</label><input class="campo" id="pTel" value="' + esc(p.telefone) + '"></div>' +
      '<div><label class="rotulo">Endereço</label><input class="campo" id="pEnd" value="' + esc(p.endereco) + '"></div>' +
      (cli ? '<div><label class="rotulo">CPF (fictício)</label><input class="campo" value="' + esc(p.cpf) + '" readonly></div>' : '') + '</div></div>' +
    '<div class="bloco"><h3>' + ic("pata") + ' Pet</h3><div class="form-grid">' +
      '<div><label class="rotulo">Nome do pet</label><input class="campo" id="pPet" value="' + esc(p.petNome) + '"></div>' +
      '<div><label class="rotulo">Espécie</label><select class="campo" id="pEsp">' + opt("cao", p.especie, "Cão") + opt("gato", p.especie, "Gato") + '</select></div>' +
      '<div><label class="rotulo">Idade (anos)</label><input class="campo" id="pIdade" type="number" min="0" max="25" step="0.5" value="' + p.idade + '"></div>' +
      '<div><label class="rotulo">Porte</label><select class="campo" id="pPorte">' + opt("pequeno", p.porte, "Pequeno") + opt("medio", p.porte, "Médio") + opt("grande", p.porte, "Grande") + '</select></div>' +
      '<div><label class="rotulo">Raça</label><input class="campo" id="pRaca" value="' + esc(p.raca) + '" placeholder="ex.: SRD, Labrador"></div></div>' +
      '<label class="rotulo">Problemas / observações de saúde (fictícios)</label><textarea class="campo" id="pObs" rows="2" placeholder="ex.: alergia alimentar, artrose">' + esc(p.obs) + '</textarea>' +
      '<p class="explica">Espécie, idade e porte entram como variáveis do modelo de recomendação.</p></div>' +
    htmlLocalizacao(renderPerfil) +
    '<div class="bloco" id="blocoPedidos"><h3>' + ic("recibo") + ' Meus pedidos</h3><p class="vazio-clin">Carregando…</p></div>' +
    '<div class="bloco" id="blocoHist"><h3>' + ic("carrinho") + ' Histórico de compras <span class="rot-db">consulta ao banco</span></h3><p class="origem">últimos 90 dias · tabela compras do SQLite</p><p class="vazio-clin">Carregando…</p></div>' +
    '<button class="btn-prim" id="btSalvarPerfil">Salvar perfil</button>';

  $("fotoPet").addEventListener("click", () => { const f = ["🐶", "🐱", "🐕", "🐈", "🐾"]; p.foto = f[(f.indexOf(p.foto) + 1) % f.length]; $("fotoPet").textContent = p.foto; });
  $("pEsp").addEventListener("change", e => { if (e.target.value === "gato") $("pPorte").value = "pequeno"; });
  if ($("lnkCriarConta")) $("lnkCriarConta").addEventListener("click", ev => { ev.preventDefault(); abrirLogin("cadastro"); });
  $("btSalvarPerfil").addEventListener("click", async () => {
    try {
      await salvarPerfil({ nome: $("pNome").value, email: $("pEmail").value, telefone: $("pTel").value, endereco: $("pEnd").value,
        petNome: $("pPet").value, especie: $("pEsp").value, idade: parseFloat($("pIdade").value) || 0, porte: $("pPorte").value,
        raca: $("pRaca").value, obs: $("pObs").value, foto: p.foto });
      toast(ehCliente() ? "Perfil salvo no banco." : "Perfil salvo (persistido no navegador).");
    } catch (e) { toast("Não foi possível salvar: " + e.message, 4000); }
  });
  api("/api/pedidos?tutor_id=" + TUTOR_ID).then(lista => {
    const dataBR = iso => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
    const pag = v => { const n = PAGAMENTO_NOME[v] || v; return n[0].toUpperCase() + n.slice(1); };
    $("blocoPedidos").querySelector(".vazio-clin").outerHTML = lista.length ? lista.map(pd =>
      '<details class="pedido"><summary><span><b>' + esc(pd.numero) + '</b><small>' + dataBR(pd.data) + ' · ' + (pd.entrega === "entrega" ? "Entrega" : "Retirada") + ' · ' + pag(pd.pagamento) + '</small></span>' +
      '<span class="ped-total">' + fmt(pd.total) + '</span></summary><ul class="mini-lista">' +
      pd.itens.map(i => '<li><span>' + i.quantidade + '× ' + esc(i.nome) + ' <small>· ' + esc(i.loja) + '</small></span><span>' + fmt(i.valor) + '</span></li>').join("") +
      '</ul><div class="linha"><span>Frete</span><span>' + (pd.frete ? fmt(pd.frete) : pd.entrega === "entrega" ? "Grátis" : "Sem custo") + '</span></div></details>').join("")
      : '<p class="vazio-clin">Você ainda não fez pedidos. O que você finalizar no carrinho aparece aqui.</p>';
  }).catch(() => { $("blocoPedidos").querySelector(".vazio-clin").innerHTML = MSG_SEM_API; });
  api("/api/tutores/" + TUTOR_ID + "/historico").then(h => {
    const f = h.features;
    const linhas = Object.keys(f).filter(k => k.startsWith("gasto_") && f[k] > 0).map(k => '<tr><td class="rot">' + k.replace("gasto_", "R$/mês em ") + '</td><td>' + fmt(f[k]) + '</td></tr>').join("");
    $("blocoHist").querySelector(".vazio-clin").outerHTML =
      '<table class="tabela"><tr><td class="rot">Compras na janela</td><td>' + h.total_compras_janela + ' (' + f.compras_mes + ' por mês)</td></tr>' + linhas + '</table>' +
      (h.recentes.length ? '<p class="explica">Últimas: ' + h.recentes.slice(0, 4).map(r => esc(r.nome) + ' (' + r.data + ')').join(' · ') + '</p>' : '');
  }).catch(() => { $("blocoHist").querySelector(".vazio-clin").innerHTML = MSG_SEM_API; });
}

/* ================= RECOMENDAÇÃO (IA + banco) ================= */
const SITUACOES = [
  ["checkup", "Consulta de rotina / check-up"], ["coceira", "Coceira, pele irritada"], ["mau_halito", "Mau hálito, tártaro"],
  ["mancando", "Mancando, dificuldade para andar"], ["ganho_peso", "Ganho de peso"], ["vomito", "Vômito ocasional"],
  ["engasgo", "Engasgo"], ["sangramento", "Sangramento / corte"], ["toxico", "Ingestão de algo tóxico"], ["convulsao", "Convulsão"], ["insolacao", "Superaquecimento (insolação)"],
];
const NOME_SIT = Object.fromEntries(SITUACOES);

function renderRecomendacao(situacaoInicial) {
  const p = lerPerfil();
  telas.recomendacao.innerHTML =
    '<h2 class="det-titulo">' + ic("ia") + ' Que atendimento o ' + esc(p.petNome) + ' precisa?</h2>' +
    '<p class="secao" style="margin:6px 0 0">O modelo de IA combina o perfil do pet, a situação relatada e o <b>seu histórico de compras na loja</b> para indicar a especialidade veterinária. Depois, o banco lista as clínicas abertas.</p>' +
    '<div class="bloco"><div class="form-grid">' +
      '<div><label class="rotulo">Espécie</label><select class="campo" id="rEsp"><option value="cao"' + (p.especie === "cao" ? " selected" : "") + '>Cão</option><option value="gato"' + (p.especie === "gato" ? " selected" : "") + '>Gato</option></select></div>' +
      '<div><label class="rotulo">Idade (anos)</label><input class="campo" id="rIdade" type="number" min="0" max="25" step="0.5" value="' + p.idade + '"></div>' +
      '<div><label class="rotulo">Porte</label><select class="campo" id="rPorte">' + ["pequeno", "medio", "grande"].map(v => '<option value="' + v + '"' + (v === p.porte ? " selected" : "") + '>' + v[0].toUpperCase() + v.slice(1) + '</option>').join("") + '</select></div>' +
      '<div><label class="rotulo">Horário da consulta</label><input class="campo" id="rHora" type="time" value="' + horaAgora() + '"></div>' +
    '</div>' +
    '<label class="rotulo">Situação do pet</label><select class="campo" id="rSit">' + SITUACOES.map(([v, r]) => '<option value="' + v + '"' + (v === situacaoInicial ? " selected" : "") + '>' + r + '</option>').join("") + '</select>' +
    '<button class="btn-prim" id="btRecomendar">Pedir recomendação</button></div>' +
    '<div id="resRec"></div>';
  $("btRecomendar").addEventListener("click", pedirRecomendacao);
}

async function pedirRecomendacao() {
  const bt = $("btRecomendar"), res = $("resRec");
  bt.disabled = true; bt.textContent = "Consultando o modelo…";
  const corpo = { tutor_id: TUTOR_ID, especie: $("rEsp").value, idade_anos: parseFloat($("rIdade").value) || 0, porte: $("rPorte").value, situacao: $("rSit").value, hora: $("rHora").value || horaAgora(), ...corpoPos() };
  await posicaoTutor().catch(() => {});
  try {
    const r = await api("/api/recomendar", { method: "POST", body: JSON.stringify(corpo) });
    // parceiras logo abaixo da tabela da IA (mesma coluna no computador); as clínicas ficam ao lado
    res.innerHTML = '<div class="col-ia">' + htmlIA(r.ia, corpo) + '<div class="bloco" id="parceirasRec" hidden></div></div>' + htmlClinicas(r.banco) + htmlRodapeModelo();
    renderParceiras($("parceirasRec"), { especialidade: r.ia.especialidade, motivo: NOME_SIT[corpo.situacao] });
    if (r.banco.clinicas.length && montarMapa($("mapaRec"), r.banco.clinicas, { compacto: true })) ligarListaAoMapa(res, $("mapaRec"));
  } catch (e) {
    res.innerHTML = '<div class="aviso-erro">' + (e.message.startsWith("HTTP") || e.message.includes("fetch") ? MSG_SEM_API : esc(e.message)) + '</div>';
  }
  bt.disabled = false; bt.textContent = "Pedir recomendação";
  res.scrollIntoView({ behavior: "smooth", block: "start" });
}

function htmlIA(ia, corpo) {
  const f = ia.features_usadas;
  const gastos = Object.keys(f).filter(k => k.startsWith("gasto_")).sort((a, b) => f[b] - f[a]).slice(0, 4).filter(k => f[k] > 0)
    .map(k => k.replace("gasto_", "") + " " + fmt(f[k]) + "/mês").join(" · ");
  const barras = ia.probabilidades.map((x, i) => '<div class="barra-prob' + (i === 0 ? " top" : "") + '"><span>' + esc(x.nome.split(" (")[0]) + '</span><div class="trilho"><div class="fill" style="width:' + (x.p * 100) + '%"></div></div><span class="pct">' + pct(x.p) + '</span></div>').join("");
  return '<div class="bloco"><h3>Especialidade indicada <span class="rot-ia">IA · Random Forest</span></h3><p class="origem">' + esc(ia.origem) + '</p>' +
    '<div class="resultado"><span class="big">' + esc(ia.especialidade_nome) + '</span><span class="conf">confiança ' + pct(ia.confianca) + '</span></div>' +
    '<div class="barras">' + barras + '</div>' +
    '<p class="explica"><b>O que o modelo recebeu:</b> ' + (corpo.especie === "cao" ? "cão" : "gato") + ', ' + corpo.idade_anos + ' anos, porte ' + corpo.porte + ', situação “' + esc(NOME_SIT[corpo.situacao] || corpo.situacao) + '”; ' +
    'do banco: ' + ia.historico_compras.total_compras_janela + ' compras em ' + ia.historico_compras.janela_dias + ' dias (' + f.compras_mes + '/mês)' + (gastos ? ' — ' + gastos : '') + '.</p></div>';
}

function htmlClinicas(b) {
  const lista = b.clinicas.length ? b.clinicas.map(c => itemClinica(c)).join("") :
    (b.fonte !== "osm" ? '' : '<p class="vazio-clin">Nenhuma clínica encontrada para esse filtro às ' + b.hora_consultada + '. Tente outro horário, aumente o raio na aba Mapa ou veja as clínicas de emergência.</p>');
  const fonte = b.fonte === "osm" ? '<span class="rot-ok">dados reais · OpenStreetMap</span>' : '';
  return '<div class="bloco"><h3>Clínicas abertas às ' + b.hora_consultada + ' <span class="rot-db">consulta a dados</span> ' + fonte + '</h3>' +
    '<p class="origem">filtro: especialidade = ' + esc(b.especialidade_filtrada) + ' e horário de funcionamento · ' + esc(b.origem) + '</p>' +
    (b.aviso ? '<div class="aviso" style="margin-bottom:10px">' + esc(b.aviso) + '</div>' : '') +
    (!temPosicaoReal() ? '<p class="explica" style="margin:0 0 10px">Defina sua localização na aba <b>' + ic("mapa") + ' Mapa</b> (GPS ou cidade) e peça a recomendação de novo.</p>' : '') +
    (b.clinicas.length ? '<div id="mapaRec" class="mapa compacto"></div><p class="explica" style="margin-top:6px">' + ic("mapa") + ' Toque em uma clínica no mapa para ver telefone, horário e a rota.</p>' : '') + lista + '</div>';
}

function htmlRodapeModelo() {
  if (!metricasModelo) return "";
  const m = metricasModelo;
  return '<p class="rodape-modelo">Modelo: ' + esc(m.algoritmo) + ' · treinado com ' + m.n_linhas + ' linhas sintéticas · acurácia no teste ' + pct(m.acuracia) + ' (validação cruzada ' + pct(m.cv_media) + ')</p>';
}

/* ================= EMERGÊNCIA (primeiros socorros + clínicas) ================= */
const primeirosSocorros = [
  { id: "engasgo", icone: "vento", titulo: "Engasgo",
    passos: ["Mantenha a calma e contenha o animal com cuidado para não se machucar.", "Abra a boca e verifique se o objeto está visível; retire apenas se conseguir alcançá-lo sem empurrar.", "Em cães pequenos, segure-o de cabeça para baixo por instantes; em cães grandes, eleve as patas traseiras.", "Se não resolver em segundos, leve imediatamente ao veterinário."],
    alerta: "Não coloque a mão fundo na garganta às cegas — você pode empurrar o objeto ainda mais." },
  { id: "sangramento", icone: "gota", titulo: "Sangramento / corte",
    passos: ["Pressione o local com um pano limpo ou gaze por alguns minutos.", "Se encharcar, não retire o pano: coloque outro por cima e continue pressionando.", "Mantenha o animal o mais calmo e imóvel possível.", "Procure atendimento se o sangramento for intenso ou não parar."], alerta: "" },
  { id: "toxico", icone: "frasco", titulo: "Ingestão de algo tóxico",
    passos: ["Afaste o animal da substância e tente identificar o que foi ingerido.", "NÃO induza o vômito sem orientação do veterinário.", "Guarde a embalagem ou o rótulo do produto para mostrar ao profissional.", "Ligue para o veterinário ou vá à clínica imediatamente."],
    alerta: "Alguns produtos causam mais dano se vomitados — só induza o vômito se o veterinário orientar." },
  { id: "convulsao", icone: "raio", titulo: "Convulsão",
    passos: ["Afaste móveis e objetos ao redor para o animal não se machucar.", "Não coloque a mão na boca dele.", "Observe e anote quanto tempo dura a crise.", "Depois da crise, deixe-o em ambiente calmo e procure o veterinário."], alerta: "" },
  { id: "insolacao", icone: "termometro", titulo: "Superaquecimento (insolação)",
    passos: ["Leve o animal para um local fresco e à sombra.", "Molhe o corpo com água em temperatura ambiente (nunca gelada).", "Ofereça água fresca em pequena quantidade.", "Procure o veterinário — insolação é uma emergência."],
    alerta: "Água muito gelada pode causar choque térmico; use água natural." },
];
const tEmg = telas.emergencia;
const RAIO_SILVESTRES_KM = 30;   // = RAIO_BUSCA_KM em banco/clinicas_osm.py
const TIPOS_ANIMAL = {
  domesticos: { icone: "pata", titulo: "Cão ou gato", sub: "Clínicas de pequenos animais" },
  silvestres: { icone: "passaro", titulo: "Animal silvestre ou exótico", sub: "Aves, répteis, roedores exóticos, fauna" },
};
const btVoltarEmg = '<button class="voltar" id="btVoltarEmg">' + ic("voltar") + ' Voltar</button>';
const telLink = t => { const n = t.replace(/[^\d+]/g, ""); return "tel:" + (n.startsWith("+") ? n : "+55" + n); };   // com DDI: funciona em qualquer celular

function wireEmg() {
  const bv = $("btVoltarEmg"); if (bv) bv.addEventListener("click", renderEmergenciaHome);
  tEmg.querySelectorAll("[data-clinicas]").forEach(b => b.addEventListener("click", () => escolherTipoAnimal("clinicas")));
  tEmg.querySelectorAll("[data-sos]").forEach(b => b.addEventListener("click", () => escolherTipoAnimal("sos")));
  tEmg.querySelectorAll("[data-rec]").forEach(b => b.addEventListener("click", () => { mostrar("recomendacao"); renderRecomendacao(b.dataset.rec); }));
}

function renderEmergenciaHome() {
  tEmg.innerHTML =
    '<div class="aviso">' + ic("alerta") + ' As orientações abaixo são educativas e não substituem o atendimento veterinário. Em caso de emergência, procure um profissional.</div>' +
    '<div class="sos-card"><h3>' + ic("pulso") + ' Emergência veterinária</h3><p>Seu pet está passando mal? Acione o veterinário da família ou encontre a clínica mais próxima.</p>' +
      '<button class="btn-sos" data-sos>Acionar veterinário da família</button><button class="btn-sec" data-clinicas>Ver clínicas próximas</button></div>' +
    '<h3 class="emg-h3">Primeiros socorros — o que fazer</h3><div class="sit-lista">' +
      primeirosSocorros.map(s => '<div class="sit-item" data-id="' + s.id + '"><span class="sit-ic">' + ic(s.icone) + '</span><span class="nm">' + s.titulo + '</span></div>').join('') + '</div>';
  wireEmg();
  tEmg.querySelectorAll(".sit-item").forEach(el => el.addEventListener("click", () => renderSituacao(el.dataset.id)));
}

function renderSituacao(id) {
  const s = primeirosSocorros.find(x => x.id === id);
  tEmg.innerHTML =
    btVoltarEmg + '<h2 class="det-titulo">' + ic(s.icone) + ' ' + s.titulo + '</h2>' +
    '<ol class="passos">' + s.passos.map(p => '<li>' + p + '</li>').join('') + '</ol>' +
    (s.alerta ? '<div class="alerta-passo">' + ic("alerta") + ' ' + s.alerta + '</div>' : '') +
    '<button class="btn-sos" data-sos style="margin-top:18px">Acionar veterinário da família</button>' +
    '<button class="btn-sec" data-rec="' + s.id + '">' + ic("ia") + ' Ver recomendação da IA para esta situação</button>' +
    '<button class="btn-sec" data-clinicas>Ver clínicas próximas</button>';
  wireEmg();
}

// Antes de listar clínicas ou acionar o veterinário: que tipo de animal precisa de ajuda?
function escolherTipoAnimal(destino) {
  const sos = destino === "sos";
  tEmg.innerHTML =
    btVoltarEmg + '<h2 class="det-titulo">' + ic(sos ? "pulso" : "cruz") + ' ' + (sos ? "Acionar veterinário" : "Clínicas próximas") + '</h2>' +
    '<p class="secao" style="margin:8px 0 0">Que tipo de animal precisa de ajuda?</p><div class="tipo-conta">' +
    Object.entries(TIPOS_ANIMAL).map(([v, t]) => '<button class="tipo-op" data-tipo="' + v + '"><span class="tipo-ic">' + ic(t.icone) + '</span><b>' + t.titulo + '</b><small>' + t.sub + '</small></button>').join("") +
    '</div>';
  wireEmg();
  tEmg.querySelectorAll("[data-tipo]").forEach(b => b.addEventListener("click", () => (sos ? renderSOS : renderClinicasEmergencia)(b.dataset.tipo)));
}

async function renderClinicasEmergencia(tipo) {
  const hora = horaAgora(), silv = tipo === "silvestres";
  tEmg.innerHTML =
    btVoltarEmg + '<h2 class="det-titulo">' + ic(silv ? "passaro" : "cruz") + ' ' + (silv ? "Clínicas para silvestres e exóticos" : "Clínicas para cães e gatos") + ' <span class="rot-ok">OpenStreetMap</span></h2>' +
    '<p class="secao" style="margin:8px 0 14px">' + (silv ? "Clínicas que indicam atender silvestres ou exóticos, num raio de " + RAIO_SILVESTRES_KM + " km (são raras)."
      : "Abertas às " + hora + " (ou sem horário informado). As que indicam emergência ou 24h vêm primeiro; depois, da mais perto para a mais longe.") + '</p>' +
    '<div id="mapaEmg" class="mapa compacto"></div><div id="parceirasEmg" style="margin-top:18px" hidden></div><div id="listaClin" style="margin-top:12px"><p class="vazio-clin">Carregando…</p></div>';
  wireEmg();
  if (!temPosicaoReal()) {
    $("mapaEmg").hidden = true;
    $("listaClin").innerHTML = htmlLocalizacao(() => renderClinicasEmergencia(tipo));
    return;
  }
  try {
    await posicaoTutor();
    const r = await api("/api/clinicas?meta=1&publico=" + tipo + "&hora=" + hora + (silv ? "" : "&so_abertas=1") + paramsPos());
    // "emergência" é inferida pelo nome e quase nenhuma clínica a indica: em vez de esconder as outras, ela só sobe na lista
    const urgente = c => c.especialidades.includes("emergencia") ? 0 : 1;
    const cl = r.clinicas.slice().sort((a, b) => urgente(a) - urgente(b) || a.distancia_km - b.distancia_km);
    if (silv && r.meta.fonte === "osm" && !cl.length) { $("mapaEmg").hidden = true; $("listaClin").innerHTML = htmlCaminhoOficial(); return; }
    const mapaEmg = montarMapa($("mapaEmg"), cl, { compacto: true });
    $("listaClin").innerHTML = (r.meta.aviso ? '<div class="aviso" style="margin-bottom:10px">' + esc(r.meta.aviso) + '</div>' : '') +
      cl.map(c => itemClinica(c)).join('');
    if (mapaEmg) ligarListaAoMapa($("listaClin"), $("mapaEmg"));
    if (!silv) { const pe = $("parceirasEmg"); $("listaClin").after(pe); renderParceiras(pe, { especialidade: "emergencia" }); }
  } catch { $("listaClin").innerHTML = '<div class="aviso-erro">' + MSG_SEM_API + '</div>'; }
}

// "Acionar veterinário": a mensagem vai para a clínica real mais próxima que atende o tipo de animal.
// SIMULAÇÃO: o PatasPerto é um site de teste e nada é enviado de verdade.
async function renderSOS(tipo) {
  const p = lerPerfil(), silv = tipo === "silvestres";
  tEmg.innerHTML = btVoltarEmg + '<h2 class="det-titulo">' + ic("pulso") + ' Acionar veterinário · ' + TIPOS_ANIMAL[tipo].titulo + '</h2>' +
    '<div id="sosCorpo"><p class="vazio-clin">Procurando a clínica mais próxima…</p></div>';
  wireEmg();
  const corpo = $("sosCorpo");
  if (!temPosicaoReal()) {
    corpo.innerHTML = '<p class="secao" style="margin:8px 0 0">Para saber qual clínica acionar, defina onde você está:</p>' + htmlLocalizacao(() => renderSOS(tipo));
    return;
  }
  let r;
  try { r = await api("/api/clinicas?meta=1&publico=" + tipo + "&hora=" + horaAgora() + paramsPos()); }
  catch { corpo.innerHTML = '<div class="aviso-erro">' + MSG_SEM_API + '</div>'; return; }
  const alvo = r.clinicas.find(c => c.aberta_agora !== false) || r.clinicas[0];   // a mais próxima que não está fechada
  if (!alvo) {
    corpo.innerHTML = silv && r.meta.fonte === "osm" ? htmlCaminhoOficial()
      : '<div class="aviso" style="margin-top:12px">' + esc(r.meta.aviso || "Nenhuma clínica encontrada perto de você.") + '</div>';
    return;
  }
  corpo.innerHTML =
    '<p class="secao" style="margin:8px 0 8px">O alerta vai para a clínica ' + (silv ? "de silvestres e exóticos " : "") + 'mais próxima de você:</p>' + itemClinica(alvo) +
    '<label class="rotulo" for="fPet">Nome do pet</label><input class="campo" id="fPet" value="' + esc(silv ? "" : p.petNome) + '"' + (silv ? ' placeholder="se não tiver nome, deixe em branco"' : '') + '>' +
    (silv ? '<label class="rotulo" for="fEspecie">Que animal é?</label><input class="campo" id="fEspecie" placeholder="ex.: calopsita, jabuti, gambá, filhote de ave">'
      : '<label class="rotulo" for="fEspecie">Espécie</label><select class="campo" id="fEspecie"><option' + (p.especie === "cao" ? " selected" : "") + '>Cão</option><option' + (p.especie === "gato" ? " selected" : "") + '>Gato</option></select>') +
    '<label class="rotulo" for="fSituacao">Situação</label><select class="campo" id="fSituacao">' + primeirosSocorros.map(s => '<option>' + s.titulo + '</option>').join('') + '<option>Outra</option></select>' +
    '<label class="rotulo" for="fObs">Observações</label><textarea class="campo" id="fObs" rows="3" placeholder="Descreva rapidamente o que está acontecendo"></textarea>' +
    '<div class="aviso simulado">' + ic("cadeado") + '<span><b>Simulação.</b> O PatasPerto é um site de teste: nenhuma mensagem é enviada de verdade.</span></div>' +
    '<button class="btn-sos" id="btEnviar" style="margin-top:16px">Enviar alerta (simulação)</button><button class="btn-sec" id="btLevar">Prefiro levar — ver clínicas próximas</button>';
  $("btEnviar").addEventListener("click", () => enviarSOS(alvo, tipo));
  $("btLevar").addEventListener("click", () => renderClinicasEmergencia(tipo));
}

function enviarSOS(alvo, tipo) {
  const pet = $("fPet").value.trim() || "Sem nome", esp = $("fEspecie").value.trim() || "não informado",
    sit = $("fSituacao").value, obs = $("fObs").value.trim() || "—";
  tEmg.innerHTML =
    '<div class="confirma"><div class="check">' + ic("check") + '</div><h3>Alerta registrado (simulação)</h3>' +
      '<p class="secao" style="margin:0 auto;max-width:460px">Num app de verdade, esta mensagem iria agora para <b>' + esc(alvo.nome) + '</b>. ' +
      '<b>Nada foi enviado</b>: o PatasPerto é um site de teste. Em uma emergência real, ligue para a clínica.</p></div>' +
    (alvo.telefone ? '<a class="btn-sos" href="' + esc(telLink(alvo.telefone)) + '">' + ic("telefone") + ' Ligar para ' + esc(alvo.nome) + '</a>'
      : '<div class="aviso">Esta clínica não tem telefone no OpenStreetMap. Veja outras clínicas próximas.</div>') +
    '<div class="secao"><h3>Mensagem que seria enviada</h3><table class="tabela">' +
      '<tr><td class="rot">Para</td><td>' + esc(alvo.nome) + ' · ' + num1(alvo.distancia_km) + ' km</td></tr>' +
      '<tr><td class="rot">Tipo de animal</td><td>' + TIPOS_ANIMAL[tipo].titulo + '</td></tr>' +
      '<tr><td class="rot">Pet</td><td>' + esc(pet) + ' (' + esc(esp) + ')</td></tr>' +
      '<tr><td class="rot">Situação</td><td>' + esc(sit) + '</td></tr><tr><td class="rot">Observações</td><td>' + esc(obs) + '</td></tr></table></div>' +
    '<button class="btn-sec" id="btLevar">Ver outras clínicas próximas</button><button class="btn-sec" id="btVoltarEmg">Voltar ao início</button>';
  wireEmg();
  $("btLevar").addEventListener("click", () => renderClinicasEmergencia(tipo));
}

// Animal silvestre sem clínica de silvestres por perto: o caminho certo é o oficial.
const htmlCaminhoOficial = () =>
  '<div class="bloco silvestre-oficial"><h3>' + ic("passaro") + ' Animal silvestre ou exótico</h3>' +
  '<p class="explica" style="margin:0 0 8px">Nenhuma clínica que indique atender <b>silvestres ou exóticos</b> foi encontrada num raio de ' + RAIO_SILVESTRES_KM + ' km. O OpenStreetMap raramente registra isso.</p>' +
  '<ul class="lista-oficial">' +
    '<li><b>Animal silvestre solto, machucado ou filhote</b> (ave, gambá, macaco…): acione a <b>Polícia Militar Ambiental</b> pelo <a href="tel:190">190</a> ou procure o <b>Cetas</b> (Centro de Triagem de Animais Silvestres) da sua região. Não leve o animal para casa.</li>' +
    '<li><b>Pet exótico legalizado</b> (calopsita, jabuti, coelho, réptil…): ligue antes para as clínicas de cães e gatos e pergunte se atendem a espécie. Algumas atendem.</li>' +
  '</ul></div>';

// Linha de clínica (Mapa e Emergência): nome, endereço, distância, horário e telefone clicável.
function itemClinica(c, { especialidades = false } = {}) {
  const horario = ic("relogio") + ' ' + (c.horario_texto ? esc(c.horario_texto) : 'Horário não informado no mapa' + (c.telefone ? ' — ligue antes' : ''));
  return '<div class="clinica' + (c.aberta_agora === false ? ' fechada-lin' : '') + '" data-id="' + esc(c.id) + '"><div class="cl-info">' +
    '<span class="cl-nome">' + (c.atende_silvestres ? ic("passaro") + ' ' : '') + esc(c.nome) + '</span>' +
    '<small>' + ic("mapa") + ' ' + esc(c.endereco) + ' — <b>' + num1(c.distancia_km) + ' km</b></small>' +
    '<small class="cl-horario">' + horario + '</small>' +
    ((c.telefone || tutorPos) ? '<small class="cl-acoes">' + (c.telefone ? '<a class="cl-tel" href="' + esc(telLink(c.telefone)) + '">' + ic("telefone") + ' ' + esc(c.telefone) + '</a>' : '') +
      (tutorPos ? linkRota(c).replace('<a ', '<a class="cl-tel" ') : '') + '</small>' : '') +
    (c.fonte === "equipe" ? '<small class="selo-equipe">' + ic("check") + ' ' + (c.verificado_por_telefone_em
      ? 'Confirmada por telefone pela equipe em ' + esc(c.verificado_por_telefone_em.split("-").reverse().join("/"))
      : 'Pesquisada pela equipe') + (c.fonte_url ? ' · <a href="' + esc(c.fonte_url) + '" target="_blank" rel="noopener">fonte</a>' : '') + '</small>' : '') +
    (especialidades ? '<small>' + ic("estetoscopio") + ' ' + c.especialidades.map(e => ESPECIALIDADES_NOMES[e] || e).join(", ") + (c.especialidade_inferida ? '*' : '') + '</small>' : '') +
    '</div>' +
    (c.aberta_agora === true ? '<span class="tag24">' + (c.aberto_24h ? '24h' : 'aberta') + '</span>' : c.aberta_agora === false ? '<span class="tagoff">fechada</span>' : '<span class="tagoff">horário ?</span>') +
    '</div>';
}

/* ================= MAPA (Leaflet + OpenStreetMap) ================= */
/* As clínicas vêm do OpenStreetMap, pelo back-end (banco/clinicas_osm.py). O mapa é visualização:
   o filtro "quem está aberta / qual especialidade" é feito no servidor. */
/* Posição do usuário: GPS do navegador ou endereço geocodificado (Nominatim), guardada no
   navegador. As clínicas vêm só do OpenStreetMap; sem posição, o app pede o GPS ou a cidade. */
let tutorPos = null;            // posição em uso no mapa (GPS ou cidade); null = ainda não definida
let raioKm = 5;
function lerPosicao() { try { return JSON.parse(localStorage.getItem("posicao") || "null"); } catch { return null; } }
function salvarPosicao(p) { try { if (p) localStorage.setItem("posicao", JSON.stringify(p)); else localStorage.removeItem("posicao"); } catch {} tutorPos = p ? { ...p } : null; }
const temPosicaoReal = () => !!lerPosicao();
const paramsPos = () => { const p = lerPosicao(); return p ? "&lat=" + p.lat + "&lon=" + p.lon + "&raio_km=" + raioKm : ""; };
const corpoPos = () => { const p = lerPosicao(); return p ? { lat: p.lat, lon: p.lon, raio_km: raioKm } : {}; };

async function posicaoTutor() {
  const real = lerPosicao();   // só a posição real (GPS ou cidade digitada): sem ela, não há clínicas
  tutorPos = real ? { ...real } : null;
  return tutorPos;
}

function usarGPS(aoTerminar) {
  if (!navigator.geolocation) { toast("Seu navegador não oferece geolocalização. Digite um endereço."); return; }
  toast("Obtendo sua localização…");
  navigator.geolocation.getCurrentPosition(async pos => {
    const p = { lat: +pos.coords.latitude.toFixed(6), lon: +pos.coords.longitude.toFixed(6), fonte: "gps", rotulo: "Minha localização (GPS)", precisao_m: Math.round(pos.coords.accuracy) };
    salvarPosicao(p); toast("Localização obtida (precisão ~" + p.precisao_m + " m). Buscando clínicas reais…");
    aoTerminar && aoTerminar();
  }, err => {
    toast(err.code === 1 ? "Permissão de localização negada. Digite um endereço abaixo." : "Não foi possível obter a localização (" + err.message + "). Digite um endereço.", 4500);
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}

async function usarEndereco(q, aoTerminar) {
  if (!q || q.trim().length < 3) { toast("Digite um endereço ou cidade."); return; }
  try {
    const r = await api("/api/geocodificar?q=" + encodeURIComponent(q.trim()));
    salvarPosicao({ lat: r.lat, lon: r.lon, fonte: "endereco", rotulo: r.rotulo });
    toast("Localização: " + r.rotulo.split(",").slice(0, 3).join(","), 3500);
    aoTerminar && aoTerminar();
  } catch (e) { toast("Endereço não encontrado: " + e.message, 4000); }
}

function htmlLocalizacao(aoMudar) {
  const p = lerPosicao();
  const html = '<div class="bloco loc"><h3>' + ic("mapa") + ' Sua localização ' + (p ? '<span class="rot-ok">real · ' + (p.fonte === "gps" ? "GPS" : "endereço") + '</span>' : '<span class="rot-demo">não definida</span>') + '</h3>' +
    '<p class="origem">' + (p ? esc(p.rotulo) + ' · ' + p.lat + ', ' + p.lon : 'Use o GPS ou digite sua cidade para ver as clínicas veterinárias reais perto de você.') + '</p>' +
    '<div class="mapa-filtros"><button class="btn-sec" id="btGPS">' + ic("gps") + ' Usar meu GPS</button>' +
    '<div class="grupo-end"><input class="campo" id="inEnd" placeholder="ou digite endereço / cidade"><button class="btn-sec" id="btEnd">Definir</button></div>' +
    (p ? '<button class="btn-sec" id="btLimparPos" title="Apagar a localização" aria-label="Apagar a localização">' + ic("fechar") + '</button>' : '') + '</div></div>';
  setTimeout(() => {
    const g = $("btGPS"), e = $("btEnd"), i = $("inEnd"), l = $("btLimparPos");
    if (g) g.onclick = () => usarGPS(aoMudar);
    if (e) e.onclick = () => usarEndereco(i.value, aoMudar);
    if (i) i.onkeydown = ev => { if (ev.key === "Enter") usarEndereco(i.value, aoMudar); };
    if (l) l.onclick = () => { salvarPosicao(null); tutorPos = null; toast("Localização apagada."); aoMudar(); };
  }, 0);
  return html;
}
const pin = (emoji, classe) => L.divIcon({ className: "pin " + (classe || ""), html: emoji, iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18] });
const linkRota = c => tutorPos ? '<a href="https://www.google.com/maps/dir/?api=1&origin=' + tutorPos.lat + ',' + tutorPos.lon + '&destination=' + c.lat + ',' + c.lon + '&travelmode=driving" target="_blank" rel="noopener">' + ic("carro") + ' Como chegar</a>' : '';

const txtHorario = c => c.horario_texto || 'horário não informado no mapa — ligue antes';
const txtAberta = c => c.aberta_agora === true ? ' · <span style="color:#12805c">aberta agora</span>' : c.aberta_agora === false ? ' · <span style="color:#b23636">fechada agora</span>' : '';
function popupClinica(c) {
  return '<b>' + esc(c.nome) + '</b><br>' + ic("mapa") + ' ' + esc(c.endereco) + ' — <b>' + num1(c.distancia_km) + ' km</b>' +
    (c.telefone ? '<br>' + ic("telefone") + ' <a href="tel:' + esc(c.telefone.replace(/\s/g, "")) + '">' + esc(c.telefone) + '</a>' : '') +
    (c.site ? '<br>' + ic("globo") + ' <a href="' + esc(c.site) + '" target="_blank" rel="noopener">site</a>' : '') +
    '<br>' + ic("relogio") + ' ' + esc(txtHorario(c)) + txtAberta(c) +
    '<br>' + ic("estetoscopio") + ' ' + c.especialidades.map(e => ESPECIALIDADES_NOMES[e] || e).join(", ") + (c.especialidade_inferida ? ' <small>(inferida pelo nome)</small>' : '') +
    '<br>' + linkRota(c) + (c.osm_url ? ' · <a href="' + esc(c.osm_url) + '" target="_blank" rel="noopener">ver no OSM</a>' : '');
}

// Clicar numa clínica da lista centraliza o mapa nela e abre a ficha (Mapa, Recomendação e Emergência).
// Links dentro do cartão (ligar, como chegar, fonte) continuam funcionando normalmente.
function ligarListaAoMapa(lista, elMapa) {
  lista.querySelectorAll(".clinica[data-id]").forEach(el => {
    el.tabIndex = 0; el.setAttribute("role", "button"); el.title = "Ver no mapa";
    const abrir = ev => {
      if (ev.target.closest("a, button, select, textarea, input")) return;
      const mk = elMapa._marcadores && elMapa._marcadores[el.dataset.id];
      if (!mk) return;
      lista.querySelectorAll(".clinica").forEach(x => x.classList.remove("sel")); el.classList.add("sel");
      elMapa._mapa.setView(mk.getLatLng(), 16, { animate: true }); mk.openPopup();
      elMapa.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    el.addEventListener("click", abrir);
    el.addEventListener("keydown", ev => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); abrir(ev); } });
  });
}

function montarMapa(el, clinicas, opcoes = {}) {
  if (!el || typeof L === "undefined") return null;
  if (el._mapa) { el._mapa.remove(); el._mapa = null; }
  el.classList.remove("sem-tiles");
  const m = L.map(el, { scrollWheelZoom: false });
  el._mapa = m; el._marcadores = {};
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' })
    .on("tileerror", () => el.classList.add("sem-tiles")).addTo(m);
  const pontos = [];
  if (tutorPos) {
    const p = [tutorPos.lat, tutorPos.lon]; pontos.push(p);
    L.marker(p, { icon: pin(ic("mapa"), "voce"), zIndexOffset: 1000 }).addTo(m).bindPopup("<b>Você está aqui</b><br>" + esc(tutorPos.rotulo || lerPerfil().endereco));
    [1, 2].forEach(km => L.circle(p, { radius: km * 1000, color: getComputedStyle(document.documentElement).getPropertyValue("--texto").trim(), weight: 2, dashArray: "6 6", fill: false, opacity: .75 }).addTo(m));
  }
  clinicas.forEach(c => {
    const p = [c.lat, c.lon]; pontos.push(p);
    const fechada = c.aberta_agora === false;
    if (!c.lat || !c.lon) return;
    const mk = L.marker(p, { icon: pin(ic(c.atende_silvestres ? "passaro" : "cruz"), (fechada ? "fechada" : "") + (c.atende_silvestres ? " silvestre" : "") + (c.id === opcoes.destaque ? " destaque" : "")) }).addTo(m).bindPopup(popupClinica(c));
    el._marcadores[c.id] = mk;
  });
  if (pontos.length) m.fitBounds(pontos, { padding: [36, 36], maxZoom: 15 }); else m.setView([-22.8219, -47.2669], 14);
  return m;
}

const ESPECIALIDADES_NOMES = { emergencia: "Emergência", dermatologia: "Dermatologia", odontologia: "Odontologia", ortopedia: "Ortopedia", nutricao: "Nutrição", clinico_geral: "Clínico geral" };

function renderMapa() {
  telas.mapa.innerHTML =
    '<h2 class="det-titulo">' + ic("mapa") + ' Clínicas perto de você <span class="rot-ok">OpenStreetMap</span></h2>' +
    '<p class="secao" style="margin:6px 0 0">Com a sua localização, as clínicas vêm do <b>OpenStreetMap</b> (dados reais, mantidos por voluntários). Os filtros são consulta a dados — o mapa só desenha o resultado.</p>' +
    htmlLocalizacao(atualizarMapa) +
    '<div class="bloco"><div class="mapa-filtros">' +
      '<div style="flex:0 0 110px"><label class="rotulo" style="margin-top:0">Raio</label><select class="campo" id="mRaio">' + [2, 5, 10, 20].map(r => '<option value="' + r + '"' + (r === raioKm ? ' selected' : '') + '>' + r + ' km</option>').join("") + '</select></div>' +
      '<div><label class="rotulo" style="margin-top:0">Horário</label><input class="campo" id="mHora" type="time" value="' + horaAgora() + '"></div>' +
      '<div style="flex:0 0 auto"><label class="rotulo" style="margin-top:0">&nbsp;</label><label class="campo" style="display:flex;gap:8px;align-items:center;cursor:pointer"><input type="checkbox" id="mAbertas" checked> só abertas</label></div>' +
    '</div>' +
    '<div id="mapaGeral" class="mapa"></div>' +
    '<div class="leg"><span class="l-voce">você</span><span class="l-aberta">clínica aberta</span><span class="l-fechada">clínica fechada</span><span class="l-anel">anéis de 1 km e 2 km</span></div></div>' +
    '<div id="mapaLista" style="margin-top:14px"><p class="vazio-clin">Carregando…</p></div><div id="parceiras" style="margin-top:22px"></div>';
  ["mHora", "mAbertas"].forEach(id => $(id).addEventListener("change", atualizarMapa));
  $("mRaio").addEventListener("change", () => { raioKm = +$("mRaio").value; atualizarMapa(); });
  atualizarMapa();
  renderParceiras($("parceiras"));
}

async function atualizarMapa() {
  if (!$("mHora")) return;
  const hora = $("mHora").value || horaAgora(), soAbertas = $("mAbertas").checked;
  const lista = $("mapaLista");
  const blocoLoc = telas.mapa.querySelector(".bloco.loc"); if (blocoLoc) blocoLoc.outerHTML = htmlLocalizacao(atualizarMapa);
  $("mapaGeral").parentElement.hidden = !temPosicaoReal();
  if (!temPosicaoReal()) {
    lista.innerHTML = '<p class="vazio-clin">Defina sua localização acima (GPS ou cidade) para ver as clínicas reais perto de você.</p>';
    return;
  }
  lista.innerHTML = '<p class="vazio-clin">Buscando clínicas reais no OpenStreetMap (raio ' + raioKm + ' km)…</p>';
  try {
    await posicaoTutor();
    // dois grupos: cães e gatos (no raio escolhido) e silvestres/exóticos (sempre no raio máximo: são raras)
    const [r, rs] = await Promise.all([
      api("/api/clinicas?meta=1&publico=domesticos&hora=" + hora + paramsPos()),
      api("/api/clinicas?meta=1&publico=silvestres&hora=" + hora + paramsPos()).catch(() => ({ clinicas: [], meta: {} })),
    ]);
    const meta = r.meta, filtrar = l => soAbertas ? l.filter(c => c.aberta_agora !== false) : l;
    const domesticas = filtrar(r.clinicas), silvestres = filtrar(rs.clinicas);
    const mapa = montarMapa($("mapaGeral"), [...domesticas, ...silvestres]);
    const temEquipe = [...domesticas, ...silvestres].some(c => c.fonte === "equipe");
    const fonte = '<span class="rot-ok">dados reais · ' + (meta.fonte === "osm" ? 'OpenStreetMap' + (temEquipe ? ' + pesquisa da equipe' : '') : 'pesquisa da equipe') + '</span>';
    lista.innerHTML = (meta.aviso ? '<div class="aviso" style="margin-bottom:10px">' + esc(meta.aviso) + '</div>' : '') +
      '<h3 class="grupo-clin">' + ic("pata") + ' Cães e gatos <span class="qtd-grupo">' + domesticas.length + '</span></h3>' +
      '<p class="info" style="padding:0 0 8px">' + (soAbertas ? 'Abertas (ou sem horário informado) às ' + hora : 'Todas') + (meta.fonte === "osm" ? ', num raio de ' + meta.raio_km + ' km' : '') + ', da mais perto para a mais longe · ' + fonte + '</p>' +
      (domesticas.length ? domesticas.map(c => itemClinica(c)).join("")
        : (meta.aviso ? '' : '<p class="vazio-clin">Nenhuma clínica aberta nesse horário. Desmarque "só abertas" ou mude o horário.</p>')) +   // com aviso, ele já explica o motivo
      (rs.meta.fonte !== "osm" ? '' :
        '<h3 class="grupo-clin">' + ic("passaro") + ' Silvestres e exóticos <span class="qtd-grupo">' + silvestres.length + '</span></h3>' +
        (silvestres.length ? '<p class="info" style="padding:0 0 8px">Num raio de ' + RAIO_SILVESTRES_KM + ' km (são raras). Confirme por telefone se atendem a espécie.</p>' + silvestres.map(c => itemClinica(c)).join("")
          : htmlCaminhoOficial()));
    if (mapa) ligarListaAoMapa(lista, $("mapaGeral"));
  } catch (e) { lista.innerHTML = '<div class="aviso-erro">' + MSG_SEM_API + '</div>'; }
}

/* ================= CONTAS (login de demonstração) =================
   Dois tipos: cliente (tutor + pet) e clínica. A API guarda só o hash da senha
   e mantém a sessão num cookie (flask.session). */
// modo da interface (atributo data-modo no <body>, usado pelo CSS):
//   anon = tela de login · visitante = app sem conta (tutor demo) · cliente · clinica
function aplicarConta(c, modo) {
  conta = c;
  TUTOR_ID = c && c.tipo === "cliente" ? c.tutor.id : 1;
  document.body.dataset.modo = modo || (c ? c.tipo : "visitante");
  atualizarConta();
  carrinho = lerCarrinho(); salvarCarrinho();   // trocou de conta: carrega o carrinho dela
}

function abrirLogin(aba) { aplicarConta(null, "anon"); mostrar("login"); renderLogin(aba); }

async function sair() {
  try { await api("/api/logout", { method: "POST" }); } catch {}
  history.replaceState(null, "", location.pathname);
  abrirLogin("entrar");
  toast("Você saiu da conta.");
}

function entrarComConta(c, msg) {
  aplicarConta(c);
  history.replaceState(null, "", location.pathname);
  if (c.tipo === "clinica") { mostrar("painel"); renderPainel(); }
  else { mostrar("lista"); if (catalogo.ofertas.length) render(); }
  toast(msg);
}

// CPF FICTÍCIO com dígitos verificadores válidos — para testar o cadastro sem usar dado real.
function cpfFicticio() {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  for (const ini of [10, 11]) n.push((n.reduce((s, d, i) => s + d * (ini - i), 0) * 10 % 11) % 10);
  const d = n.join("");
  return d.slice(0, 3) + "." + d.slice(3, 6) + "." + d.slice(6, 9) + "-" + d.slice(9);
}
const mascaraCpf = v => { const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2"); };

const AVISO_LGPD = '<div class="aviso lgpd">' + ic("cadeado") + ' <b>Projeto acadêmico — use apenas dados fictícios.</b> CPF e informações de saúde do pet são dados pessoais/sensíveis (LGPD): não informe dados reais. A senha é guardada só como hash.</div>';

function renderLogin(aba = "entrar", tipo = "cliente") {
  const campo = (id, rotulo, extra = "") => '<div><label class="rotulo" for="' + id + '">' + rotulo + '</label><input class="campo" id="' + id + '" ' + extra + '></div>';
  const acesso = '<div class="bloco"><h3>' + ic("cadeado") + ' Acesso</h3><div class="form-grid">' +
    campo("cEmail", "E-mail", 'type="email" autocomplete="email" placeholder="voce@exemplo.com"') +
    campo("cSenha", "Senha (mín. 6 caracteres)", 'type="password" autocomplete="new-password"') + '</div></div>';
  const formCliente =
    '<div class="bloco"><h3>' + ic("usuario") + ' Seus dados</h3><div class="form-grid">' +
      campo("cNome", "Nome completo", 'autocomplete="name"') +
      '<div><label class="rotulo" for="cCpf">CPF (fictício)</label><div class="campo-acao"><input class="campo" id="cCpf" inputmode="numeric" placeholder="000.000.000-00"><button type="button" class="btn-sec" id="btCpf" title="Gerar um CPF fictício">Gerar</button></div></div>' +
      campo("cTel", "Telefone", 'placeholder="(19) 90000-0000"') + campo("cEnd", "Endereço", 'placeholder="Rua, número · bairro"') + '</div></div>' +
    '<div class="bloco"><h3>' + ic("pata") + ' Seu pet</h3><div class="form-grid">' +
      campo("cPet", "Nome do pet") +
      '<div><label class="rotulo" for="cEsp">Espécie</label><select class="campo" id="cEsp"><option value="cao">Cão</option><option value="gato">Gato</option></select></div>' +
      campo("cRaca", "Raça", 'placeholder="ex.: SRD, Labrador, Siamês"') +
      campo("cIdade", "Idade (anos)", 'type="number" min="0" max="30" step="0.5" value="3"') +
      '<div><label class="rotulo" for="cPorte">Porte</label><select class="campo" id="cPorte"><option value="pequeno">Pequeno</option><option value="medio" selected>Médio</option><option value="grande">Grande</option></select></div></div>' +
      '<label class="rotulo" for="cObs">Possíveis problemas / observações de saúde (fictícios)</label><textarea class="campo" id="cObs" rows="2" placeholder="ex.: alergia alimentar, artrose, otite recorrente"></textarea></div>';
  const formClinica =
    '<div class="bloco"><h3>' + ic("cruz") + ' Dados da clínica</h3><div class="form-grid">' +
      campo("kNome", "Nome da clínica") + campo("kTel", "Telefone", 'placeholder="(19) 3000-0000"') + '</div>' +
      '<label class="rotulo" for="kEnd">Endereço</label><input class="campo" id="kEnd" placeholder="Rua, número · bairro">' +
      '<div class="form-grid">' + campo("kAbre", "Abre às", 'type="time" value="08:00"') + campo("kFecha", "Fecha às", 'type="time" value="18:00"') + '</div>' +
      '<label class="chk"><input type="checkbox" id="k24"> Atendimento 24 horas</label>' +
      '<span class="rotulo">Especialidades</span><div class="chk-grupo">' +
        Object.entries(ESPECIALIDADES_NOMES).map(([v, n]) => '<label class="chk"><input type="checkbox" name="kEsp" value="' + v + '"' + (v === "clinico_geral" ? " checked" : "") + '> ' + n + '</label>').join("") + '</div>' +
      '<p class="explica">A conta de clínica dá acesso ao painel de indicadores dos clientes do PatasPerto. A lista de clínicas que os tutores veem vem só do OpenStreetMap.</p></div>';

  telas.login.innerHTML =
    '<div class="auth-topo"><img class="auth-logo" src="/static/img/logo.png" alt="" width="262" height="192"><h2>Bem-vindo ao PatasPerto</h2><p>Entre com sua conta de <b>tutor</b> ou de <b>clínica</b>.</p></div>' +
    '<div class="abas auth-abas"><button class="aba' + (aba === "entrar" ? " ativa" : "") + '" data-aba="entrar">Entrar</button>' +
      '<button class="aba' + (aba === "cadastro" ? " ativa" : "") + '" data-aba="cadastro">Criar conta</button></div>' +
    (aba === "entrar"
      ? '<div class="bloco"><label class="rotulo" for="lEmail">E-mail</label><input class="campo" id="lEmail" type="email" autocomplete="username">' +
          '<label class="rotulo" for="lSenha">Senha</label><input class="campo" id="lSenha" type="password" autocomplete="current-password">' +
          '<button class="btn-prim" id="btEntrar">Entrar</button><div id="authErro"></div></div>' +
        '<div class="bloco demo-contas"><h3>' + ic("frasco") + ' Contas de demonstração <span class="rot-demo">senha demo123</span></h3>' +
          '<button class="btn-sec" data-demo="ana.ribeiro@exemplo.com">' + ic("usuario") + ' Cliente · ana.ribeiro@exemplo.com</button>' +
          '<button class="btn-sec" data-demo="contato@vidapet.exemplo">' + ic("cruz") + ' Clínica · contato@vidapet.exemplo</button></div>'
      : '<div class="tipo-conta">' +
          '<button class="tipo-op' + (tipo === "cliente" ? " ativo" : "") + '" data-tipo="cliente"><span class="tipo-ic">' + ic("pata") + '</span><b>Sou tutor</b><small>Compro na loja e cuido do meu pet</small></button>' +
          '<button class="tipo-op' + (tipo === "clinica" ? " ativo" : "") + '" data-tipo="clinica"><span class="tipo-ic">' + ic("cruz") + '</span><b>Sou clínica</b><small>Vejo indicadores dos clientes</small></button></div>' +
        AVISO_LGPD + (tipo === "cliente" ? formCliente : formClinica) + acesso +
        '<button class="btn-prim" id="btCadastrar">Criar conta de ' + (tipo === "cliente" ? "tutor" : "clínica") + '</button><div id="authErro"></div>') +
    '<button class="link-demo" id="btVisitante">Continuar sem conta (modo demonstração) →</button>';

  telas.login.querySelectorAll(".auth-abas .aba").forEach(b => b.addEventListener("click", () => renderLogin(b.dataset.aba, tipo)));
  telas.login.querySelectorAll(".tipo-op").forEach(b => b.addEventListener("click", () => renderLogin("cadastro", b.dataset.tipo)));
  $("btVisitante").addEventListener("click", () => { aplicarConta(null, "visitante"); mostrar("lista"); if (catalogo.ofertas.length) render(); });
  const erro = msg => { $("authErro").innerHTML = '<div class="aviso-erro">' + esc(msg) + '</div>'; };

  if (aba === "entrar") {
    const entrar = async () => {
      const bt = $("btEntrar"); bt.disabled = true;
      try {
        const r = await api("/api/login", { method: "POST", body: JSON.stringify({ email: $("lEmail").value, senha: $("lSenha").value }) });
        entrarComConta(r.conta, "Olá, " + (r.conta.tipo === "clinica" ? r.conta.clinica.nome : r.conta.tutor.nome.split(" ")[0]) + "!");
      } catch (e) { erro(e.message); bt.disabled = false; }
    };
    $("btEntrar").addEventListener("click", entrar);
    $("lSenha").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });
    telas.login.querySelectorAll("[data-demo]").forEach(b => b.addEventListener("click", () => { $("lEmail").value = b.dataset.demo; $("lSenha").value = "demo123"; $("lSenha").focus(); }));
    return;
  }
  if (tipo === "cliente") {
    $("btCpf").addEventListener("click", () => { $("cCpf").value = cpfFicticio(); });
    $("cCpf").addEventListener("input", e => { e.target.value = mascaraCpf(e.target.value); });
    $("cEsp").addEventListener("change", e => { if (e.target.value === "gato") $("cPorte").value = "pequeno"; });
  } else {
    $("k24").addEventListener("change", e => { $("kAbre").disabled = $("kFecha").disabled = e.target.checked; });
  }
  $("btCadastrar").addEventListener("click", async () => {
    const corpo = { tipo, email: $("cEmail").value, senha: $("cSenha").value };
    if (tipo === "cliente") Object.assign(corpo, { nome: $("cNome").value, cpf: $("cCpf").value, telefone: $("cTel").value, endereco: $("cEnd").value,
      pet: { nome: $("cPet").value, especie: $("cEsp").value, raca: $("cRaca").value, idade_anos: parseFloat($("cIdade").value), porte: $("cPorte").value, observacoes_saude: $("cObs").value } });
    else Object.assign(corpo, { nome: $("kNome").value, telefone: $("kTel").value, endereco: $("kEnd").value, abre: $("kAbre").value, fecha: $("kFecha").value,
      aberto_24h: $("k24").checked, especialidades: [...telas.login.querySelectorAll('input[name="kEsp"]:checked')].map(i => i.value) });
    const bt = $("btCadastrar"); bt.disabled = true;
    try {
      const r = await api("/api/cadastro", { method: "POST", body: JSON.stringify(corpo) });
      entrarComConta(r.conta, "Conta criada! Bem-vindo(a) ao PatasPerto.");
    } catch (e) { erro(e.message); bt.disabled = false; }
  });
}

/* ================= PAINEL DA CLÍNICA (CRM) =================
   Duas partes, bem separadas:
   - CONTATOS: pedidos de tutores que AUTORIZARAM enviar nome, contato e dados básicos do pet a esta clínica;
   - MERCADO: agregações SQL (COUNT/SUM/GROUP BY em banco/consultas.py) — não é IA e não tem dado individual (LGPD). */
const NOME_ESPECIE = { cao: "Cães", gato: "Gatos" };
const fmtInt = n => Number(n).toLocaleString("pt-BR");
const fmtR$ = v => "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ETAPAS = { novo: "Novos", em_contato: "Em contato", agendado: "Agendados", atendido: "Atendidos", perdido: "Perdidos" };
const ETAPA_UM = { novo: "Novo", em_contato: "Em contato", agendado: "Agendado", atendido: "Atendido", perdido: "Perdido" };
const CONTATO_NOME = { telefone: "Telefone", whatsapp: "WhatsApp", email: "E-mail" };
const SECOES_CRM = [
  ["geral", "grafico", "Visão geral"], ["contatos", "usuario", "Contatos"], ["demanda", "ia", "Demanda da região"],
  ["mercado", "carrinho", "Produtos e clientes"], ["clinica", "cruz", "Minha clínica"],
];
const crm = { secao: "geral", dias: 90, periodo: "mes", d: null, leads: [], filtroEtapa: null };

function barraH(rotulo, sub, valor, max, txt, destaque) {
  return '<div class="hbar' + (destaque ? " top" : "") + '"><span class="hb-rot">' + esc(rotulo) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
    '<div class="trilho"><div class="fill" style="width:' + (max ? Math.max(2, valor / max * 100) : 0) + '%"></div></div><span class="hb-val">' + txt + '</span></div>';
}
// variação contra o período anterior: ▲ 12% / ▼ 5% / "novo"
function delta(atual, anterior, menosEhMelhor) {
  if (!anterior) return atual ? '<span class="delta neutro">novo</span>' : '';
  const p = (atual - anterior) / anterior, bom = menosEhMelhor ? p < 0 : p > 0;
  if (Math.abs(p) < 0.005) return '<span class="delta neutro">= estável</span>';
  return '<span class="delta ' + (bom ? "up" : "down") + '" title="período anterior: ' + esc(anterior) + '">' + (p > 0 ? "▲ " : "▼ ") + Math.abs(Math.round(p * 100)) + '%</span>';
}
const tempoDesde = iso => {
  const dias = Math.floor((Date.now() - new Date(iso)) / 864e5);
  return dias <= 0 ? "hoje" : dias === 1 ? "ontem" : "há " + dias + " dias";
};
const digitos = t => (t || "").replace(/\D/g, "");
const linkWhats = t => "https://wa.me/" + (digitos(t).startsWith("55") ? "" : "55") + digitos(t);
// CSV para abrir no Excel (";" e BOM). Textos que começam com = + - @ ganham ' na frente: evita fórmula injetada.
function baixarCSV(nome, cabecalho, linhas) {
  const cel = v => { let s = String(v ?? ""); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const csv = [cabecalho, ...linhas].map(l => l.map(cel).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  a.download = nome; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const btCSV = id => '<button class="btn-csv" id="' + id + '">' + ic("seta") + ' Exportar CSV</button>';

async function renderPainel() {
  telas.painel.innerHTML = '<p class="vazio-clin">Carregando o painel…</p>';
  try {
    const [d, l] = await Promise.all([api("/api/clinica/painel?periodo=" + crm.periodo + "&dias=" + crm.dias), api("/api/clinica/leads")]);
    crm.d = d; crm.leads = l.leads;
  } catch (e) {
    if (/login/.test(e.message)) { abrirLogin("entrar"); toast("Sua sessão expirou. Entre novamente."); return; }
    telas.painel.innerHTML = '<div class="aviso-erro">' + (e.message.startsWith("HTTP") || e.message.includes("fetch") ? MSG_SEM_API : esc(e.message)) + '</div>';
    return;
  }
  desenharCRM();
}

function desenharCRM() {
  const c = crm.d.clinica, novos = crm.leads.filter(l => l.status === "novo").length;
  telas.painel.innerHTML =
    '<div class="crm"><aside class="crm-menu" aria-label="Seções do painel">' +
      '<div class="crm-marca"><span class="crm-avatar">' + ic("cruz") + '</span><span><b>' + esc(c.nome) + '</b><small>Painel da clínica</small></span></div>' +
      SECOES_CRM.map(([id, icone, nome]) => '<button class="crm-item' + (crm.secao === id ? ' ativo' : '') + '" data-secao="' + id + '"' + (crm.secao === id ? ' aria-current="page"' : '') + '>' +
        ic(icone) + '<span>' + nome + '</span>' + (id === "contatos" && novos ? '<span class="crm-badge" aria-label="' + novos + ' novos">' + novos + '</span>' : '') + '</button>').join("") +
    '</aside><section class="crm-conteudo" id="crmConteudo"></section></div>';
  telas.painel.querySelectorAll("[data-secao]").forEach(b => b.addEventListener("click", () => { crm.secao = b.dataset.secao; desenharCRM(); }));
  ({ geral: secaoGeral, contatos: secaoContatos, demanda: secaoDemanda, mercado: secaoMercado, clinica: secaoClinica })[crm.secao]($("crmConteudo"));
}

const chipsDias = () => '<div class="filtros periodo" role="group" aria-label="Período">' + [30, 90, 180].map(n =>
  '<button class="chip' + (crm.dias === n ? ' ativo' : '') + '" data-dias="' + n + '">' + n + ' dias</button>').join("") + '</div>';
const ligarChipsDias = el => el.querySelectorAll("[data-dias]").forEach(b => b.addEventListener("click", () => { crm.dias = +b.dataset.dias; renderPainel(); }));
const cabecalhoSecao = (titulo, sub, extra) => '<div class="crm-topo"><div><h2>' + titulo + '</h2><p>' + sub + '</p></div>' + (extra || '') + '</div>';

function cartaoKpi(icone, valor, rotulo, variacao, alvo) {
  return '<' + (alvo ? 'button data-ir="' + alvo + '"' : 'div') + ' class="kpi"><span class="kpi-ic">' + ic(icone) + '</span><span class="kpi-v">' + valor + '</span>' +
    '<span class="kpi-r">' + rotulo + '</span>' + (variacao || '') + '</' + (alvo ? 'button' : 'div') + '>';
}

function secaoGeral(el) {
  const d = crm.d, cp = d.comparativo, dm = d.demanda_ia, ct = d.contatos;
  const maxVol = Math.max(1, ...d.volume.map(v => v.compras));
  const abertos = crm.leads.filter(l => l.status === "novo" || l.status === "em_contato").slice(0, 4);
  el.innerHTML =
    cabecalhoSecao("Visão geral", "Últimos " + d.janela_dias + " dias, comparados com os " + d.janela_dias + " dias anteriores.", chipsDias()) +
    '<div class="kpis">' +
      cartaoKpi("usuario", fmtInt(ct.novo), "contatos novos", ct.em_contato ? '<span class="delta neutro">+' + ct.em_contato + ' em contato</span>' : '', "contatos") +
      cartaoKpi("ia", fmtInt(dm.total_atual), "recomendações da IA na região", delta(dm.total_atual, dm.total_anterior), "demanda") +
      cartaoKpi("carrinho", fmtInt(cp.compras.atual), "compras dos tutores", delta(cp.compras.atual, cp.compras.anterior)) +
      cartaoKpi("dinheiro", fmtR$(cp.faturamento.atual), "volume em compras", delta(cp.faturamento.atual, cp.faturamento.anterior)) +
      cartaoKpi("recibo", fmtR$(cp.ticket_medio.atual), "ticket médio", delta(cp.ticket_medio.atual, cp.ticket_medio.anterior)) +
      cartaoKpi("grupo", fmtInt(cp.clientes_ativos.atual), "tutores que compraram", delta(cp.clientes_ativos.atual, cp.clientes_ativos.anterior)) +
    '</div>' +
    '<div class="painel-grid">' +
      '<div class="bloco"><h3>' + ic("usuario") + ' Contatos para responder</h3>' +
        (abertos.length ? abertos.map(l => '<button class="lead-mini" data-ir="contatos"><span><b>' + esc(l.tutor.nome) + '</b><small>' + esc(l.motivo) + ' · ' + tempoDesde(l.criado_em) + '</small></span>' +
          '<span class="etapa etapa-' + l.status + '">' + ETAPA_UM[l.status] + '</span></button>').join("")
          : '<p class="vazio-clin">Nenhum contato pendente. Os pedidos dos tutores aparecem aqui.</p>') + '</div>' +
      '<div class="bloco"><h3>' + ic("grafico") + ' Compras por período <span class="rot-db">GROUP BY</span></h3>' +
        '<div class="filtros periodo" role="group" aria-label="Agrupar por"><button class="chip' + (crm.periodo === "mes" ? " ativo" : "") + '" data-per="mes">Por mês</button><button class="chip' + (crm.periodo === "semana" ? " ativo" : "") + '" data-per="semana">Por semana</button></div>' +
        '<div class="colunas">' + d.volume.map(v => '<div class="col" title="' + v.compras + ' compras · ' + fmtR$(v.valor) + '"><span class="col-v">' + v.compras + '</span>' +
          '<div class="col-b" style="height:' + (v.compras / maxVol * 100) + '%"></div><span class="col-r">' + v.periodo + '</span></div>').join("") + '</div></div>' +
    '</div>';
  ligarChipsDias(el);
  el.querySelectorAll("[data-ir]").forEach(b => b.addEventListener("click", () => { crm.secao = b.dataset.ir; desenharCRM(); }));
  el.querySelectorAll("[data-per]").forEach(b => b.addEventListener("click", () => { crm.periodo = b.dataset.per; renderPainel(); }));
}

function cartaoLead(l) {
  const p = l.pet, pet = [p.nome, NOME_ESPECIE[p.especie] ? (p.especie === "cao" ? "cão" : "gato") : "", p.raca, p.idade_anos != null ? num1(p.idade_anos).replace(",0", "") + " anos" : ""].filter(Boolean).join(" · ");
  const acoes = [
    l.tutor.telefone ? '<a class="acao" href="' + esc(telLink(l.tutor.telefone)) + '">' + ic("telefone") + ' Ligar</a>' : '',
    l.tutor.telefone ? '<a class="acao" href="' + esc(linkWhats(l.tutor.telefone)) + '" target="_blank" rel="noopener">' + ic("pulso") + ' WhatsApp</a>' : '',
    l.tutor.email ? '<a class="acao" href="mailto:' + esc(l.tutor.email) + '">' + ic("recibo") + ' E-mail</a>' : '',
  ].join("");
  return '<article class="lead" data-id="' + l.id + '">' +
    '<div class="lead-topo"><b>' + esc(l.tutor.nome) + '</b><small>' + tempoDesde(l.criado_em) + '</small></div>' +
    '<p class="lead-motivo">' + esc(l.motivo) + '</p>' +
    (pet ? '<p class="lead-pet">' + ic("pata") + ' ' + esc(pet) + '</p>' : '') +
    (l.mensagem ? '<p class="lead-msg">“' + esc(l.mensagem) + '”</p>' : '') +
    '<p class="lead-pref">Prefere: <b>' + CONTATO_NOME[l.contato_preferido] + '</b></p>' +
    '<div class="lead-acoes">' + acoes + '</div>' +
    '<label class="rotulo" for="et' + l.id + '">Etapa</label><select class="campo" id="et' + l.id + '" data-etapa>' +
      Object.entries(ETAPA_UM).map(([v, n]) => '<option value="' + v + '"' + (v === l.status ? ' selected' : '') + '>' + n + '</option>').join("") + '</select>' +
    '<label class="rotulo" for="nt' + l.id + '">Anotação interna</label><textarea class="campo" id="nt' + l.id + '" rows="2" maxlength="1000" placeholder="Ex.: consulta marcada sexta 15h" data-nota>' + esc(l.nota) + '</textarea>' +
    '<button class="btn-sec" data-salvar>Salvar anotação</button>' +
    '</article>';
}

function secaoContatos(el) {
  const ct = crm.d.contatos, filtro = crm.filtroEtapa;
  const etapas = Object.keys(ETAPAS).filter(e => !filtro || e === filtro);
  el.innerHTML =
    cabecalhoSecao("Contatos", "Tutores que pediram para ser contatados por " + esc(crm.d.clinica.nome) + ".", btCSV("csvLeads")) +
    '<div class="aviso lgpd">' + ic("cadeado") + ' Cada tutor <b>autorizou</b> o envio do nome, do contato e dos dados básicos do pet para esta clínica. Use só para responder a este pedido. Dados de saúde não são enviados (LGPD).</div>' +
    '<div class="funil" role="group" aria-label="Filtrar por etapa">' +
      '<button class="chip' + (!filtro ? ' ativo' : '') + '" data-filtro="">Todas (' + crm.leads.length + ')</button>' +
      Object.entries(ETAPAS).map(([e, n]) => '<button class="chip' + (filtro === e ? ' ativo' : '') + '" data-filtro="' + e + '">' + n + ' (' + ct[e] + ')</button>').join("") + '</div>' +
    (crm.leads.length ? '<div class="kanban">' + etapas.map(e => {
      const daEtapa = crm.leads.filter(l => l.status === e);
      return '<section class="kanban-col"><h3><span class="etapa etapa-' + e + '">' + ETAPAS[e] + '</span><span class="qtd-grupo">' + daEtapa.length + '</span></h3>' +
        (daEtapa.length ? daEtapa.map(cartaoLead).join("") : '<p class="vazio-clin">Nenhum.</p>') + '</section>';
    }).join("") + '</div>'
      : '<div class="bloco"><p class="vazio-clin">Ainda não há pedidos. Os tutores pedem contato pela aba Mapa, em "Clínicas parceiras PatasPerto".</p></div>');

  el.querySelectorAll("[data-filtro]").forEach(b => b.addEventListener("click", () => { crm.filtroEtapa = b.dataset.filtro || null; secaoContatos(el); }));
  const salvar = async (card, corpo, msg) => {
    try {
      const novo = await api("/api/clinica/leads/" + card.dataset.id, { method: "PATCH", body: JSON.stringify(corpo) });
      const i = crm.leads.findIndex(l => l.id === novo.id), antigo = crm.leads[i].status;
      crm.leads[i] = novo;
      if (antigo !== novo.status) { crm.d.contatos[antigo]--; crm.d.contatos[novo.status]++; desenharCRM(); }
      toast(msg);
    } catch (e) { toast("Não foi possível salvar: " + e.message, 4000); }
  };
  el.querySelectorAll(".lead").forEach(card => {
    card.querySelector("[data-etapa]").addEventListener("change", e => salvar(card, { status: e.target.value }, "Movido para " + ETAPA_UM[e.target.value] + "."));
    card.querySelector("[data-salvar]").addEventListener("click", () => salvar(card, { nota: card.querySelector("[data-nota]").value }, "Anotação salva."));
  });
  const csv = $("csvLeads");
  if (csv) csv.addEventListener("click", () => baixarCSV("contatos-" + new Date().toISOString().slice(0, 10) + ".csv",
    ["Data", "Etapa", "Tutor", "Telefone", "E-mail", "Prefere", "Pet", "Espécie", "Raça", "Motivo", "Mensagem", "Anotação"],
    crm.leads.map(l => [l.criado_em.slice(0, 10), ETAPA_UM[l.status], l.tutor.nome, l.tutor.telefone, l.tutor.email, CONTATO_NOME[l.contato_preferido],
      l.pet.nome, l.pet.especie, l.pet.raca, l.motivo, l.mensagem, l.nota])));
}

function secaoDemanda(el) {
  const dm = crm.d.demanda_ia, esp = dm.especialidades, max = Math.max(1, ...esp.map(e => e.atual));
  const cresce = esp.filter(e => e.anterior && e.atual > e.anterior).sort((a, b) => b.atual / b.anterior - a.atual / a.anterior)[0];
  const maxSit = Math.max(1, ...dm.situacoes.map(s => s.n));
  el.innerHTML =
    cabecalhoSecao("Demanda da região", "O que a IA do PatasPerto indicou aos tutores nos últimos " + crm.d.janela_dias + " dias. Registro anônimo: nenhum tutor é identificado.", chipsDias() + btCSV("csvDemanda")) +
    (cresce ? '<div class="destaque-crm">' + ic("grafico") + '<span><b>Oportunidade:</b> a procura por <b>' + esc(ESPECIALIDADES_NOMES[cresce.especialidade] || cresce.especialidade) + '</b> cresceu ' +
      Math.round((cresce.atual / cresce.anterior - 1) * 100) + '% em relação ao período anterior.</span></div>' : '') +
    '<div class="painel-grid">' +
      '<div class="bloco"><h3>' + ic("estetoscopio") + ' Especialidades indicadas pela IA <span class="rot-ia">IA · Random Forest</span></h3><p class="origem">' + fmtInt(dm.total_atual) + ' recomendações ' + delta(dm.total_atual, dm.total_anterior) + '</p>' +
        (esp.length ? esp.map((e, i) => barraH(ESPECIALIDADES_NOMES[e.especialidade] || e.especialidade, "antes: " + e.anterior, e.atual, max, fmtInt(e.atual) + ' ' + delta(e.atual, e.anterior), i === 0)).join("")
          : '<p class="vazio-clin">Ainda não há recomendações neste período.</p>') + '</div>' +
      '<div class="bloco"><h3>' + ic("alerta") + ' O que os tutores relataram</h3><p class="origem">situações informadas ao pedir a recomendação</p>' +
        dm.situacoes.map((s, i) => barraH(NOME_SIT[s.situacao] || s.situacao, null, s.n, maxSit, fmtInt(s.n), i === 0)).join("") + '</div>' +
    '</div>';
  ligarChipsDias(el);
  $("csvDemanda").addEventListener("click", () => baixarCSV("demanda-ia-" + crm.d.janela_dias + "dias.csv", ["Especialidade", "Período atual", "Período anterior"],
    esp.map(e => [ESPECIALIDADES_NOMES[e.especialidade] || e.especialidade, e.atual, e.anterior])));
}

function secaoMercado(el) {
  const d = crm.d, rotDb = '<span class="rot-db">GROUP BY</span>';
  const maxItens = Math.max(1, ...d.mais_comprados.map(x => x.itens));
  const totPets = d.especies.reduce((s, e) => s + e.n, 0) || 1, maxRaca = Math.max(1, ...d.racas.map(r => r.n));
  el.innerHTML =
    cabecalhoSecao("Produtos e clientes", "Compras e pets dos tutores do PatasPerto, só em totais agregados (sem dado individual).", chipsDias() + btCSV("csvProdutos")) +
    '<div class="painel-grid">' +
      '<div class="bloco"><h3>' + ic("carrinho") + ' O que os tutores mais compram ' + rotDb + '</h3><p class="origem">itens vendidos por produto</p>' +
        d.mais_comprados.map((x, i) => barraH(x.nome, x.categoria + " · " + x.clientes + " tutores", x.itens, maxItens, fmtInt(x.itens), i === 0)).join("") + '</div>' +
      '<div class="bloco"><h3>' + ic("pata") + ' Espécies e raças ' + rotDb + '</h3><p class="origem">pets cadastrados</p>' +
        d.especies.map((e, i) => barraH(NOME_ESPECIE[e.especie] || e.especie, "idade média " + num1(e.idade_media) + " anos", e.n, totPets, pct(e.n / totPets), i === 0)).join("") +
        '<p class="sub-tit">Raças mais frequentes</p>' + d.racas.map((r, i) => barraH(r.raca, NOME_ESPECIE[r.especie] || r.especie, r.n, maxRaca, fmtInt(r.n), i === 0)).join("") + '</div>' +
      '<div class="bloco"><h3>' + ic("alvo") + ' O que cada espécie compra ' + rotDb + '</h3><p class="origem">fatia da categoria nas compras de quem tem aquela espécie</p>' +
        Object.entries(d.match_categoria_especie).map(([esp, lista]) => '<p class="sub-tit">' + (NOME_ESPECIE[esp] || esp) + '</p>' +
          lista.map((m, i) => barraH(m.categoria, null, m.participacao, 1, pct(m.participacao) +
            ' <span class="afin' + (m.afinidade >= 1.2 ? " alta" : "") + '" title="quantas vezes acima ou abaixo da média geral">' + num1(m.afinidade) + '×</span>', i === 0)).join("")).join("") +
        '<p class="explica"><b>×</b> = afinidade: quantas vezes acima (ou abaixo) da média geral a espécie compra a categoria.</p></div>' +
    '</div>';
  ligarChipsDias(el);
  $("csvProdutos").addEventListener("click", () => baixarCSV("produtos-" + d.janela_dias + "dias.csv", ["Produto", "Categoria", "Itens", "Tutores", "Total (R$)"],
    d.mais_comprados.map(x => [x.nome, x.categoria, x.itens, x.clientes, String(x.total).replace(".", ",")])));
}

function secaoClinica(el) {
  const c = crm.d.clinica, horario = c.aberto_24h ? "24 horas" : c.abre + "–" + c.fecha;
  el.innerHTML =
    cabecalhoSecao("Minha clínica", "Seus dados e como os tutores veem a sua clínica.") +
    '<div class="painel-grid">' +
      '<div class="bloco"><h3>' + ic("cruz") + ' Dados da clínica</h3><table class="tabela">' +
        '<tr><td class="rot">Nome</td><td>' + esc(c.nome) + '</td></tr><tr><td class="rot">Endereço</td><td>' + esc(c.endereco) + '</td></tr>' +
        '<tr><td class="rot">Telefone</td><td>' + esc(c.telefone) + '</td></tr><tr><td class="rot">Horário</td><td>' + esc(horario) + '</td></tr>' +
        '<tr><td class="rot">Especialidades</td><td>' + c.especialidades.map(e => ESPECIALIDADES_NOMES[e] || esc(e)).join(", ") + '</td></tr></table></div>' +
      '<div class="bloco"><h3>' + ic("usuario") + ' Como os tutores veem você</h3><p class="origem">na aba Mapa, em "Clínicas parceiras PatasPerto"</p>' +
        cartaoParceira({ id: c.id, nome: c.nome, endereco: c.endereco, telefone: c.telefone, horario_texto: c.aberto_24h ? "24h" : c.abre + "–" + c.fecha, especialidades: c.especialidades }, true) +
        '<p class="explica">O tutor clica em <b>Quero ser contatado</b>, autoriza o envio dos dados e o pedido chega na seção <b>Contatos</b>.</p></div>' +
    '</div>' +
    '<div class="aviso lgpd" style="margin-top:16px">' + ic("cadeado") + ' Os números de mercado são <b>agregados</b>: a clínica não recebe CPF nem dados de saúde. Dados individuais só chegam por um pedido de contato, com autorização do tutor (LGPD).</div>';
}

/* ---- Clínicas parceiras (têm conta no PatasPerto): o tutor pede contato, com consentimento explícito ---- */
const MOTIVOS_CONTATO = [...SITUACOES.map(([, r]) => r), "Vacinação", "Banho e tosa", "Outro"];

function cartaoParceira(p, previa) {
  return '<div class="clinica parceira' + (previa ? ' previa' : '') + '" data-parceira="' + p.id + '">' + (previa ? '<span class="selo-previa">Prévia</span>' : '') + '<div class="cl-info">' +
    '<span class="cl-nome">' + esc(p.nome) + ' <span class="selo-parceira">Parceira PatasPerto</span></span>' +
    '<small>' + ic("mapa") + ' ' + esc(p.endereco) + '</small>' +
    '<small class="cl-horario">' + ic("relogio") + ' ' + esc(p.horario_texto) + '</small>' +
    (p.telefone ? '<small><a class="cl-tel" href="' + esc(telLink(p.telefone)) + '">' + ic("telefone") + ' ' + esc(p.telefone) + '</a></small>' : '') +
    '<small>' + ic("estetoscopio") + ' ' + p.especialidades.map(e => ESPECIALIDADES_NOMES[e] || esc(e)).join(", ") + '</small>' +
    (previa ? '<span class="btn-prim btn-contato" aria-hidden="true" title="Prévia: o botão funciona na tela do tutor">' + ic("usuario") + ' Quero ser contatado</span>'
      : '<button class="btn-prim btn-contato" data-contato>' + ic("usuario") + ' Quero ser contatado</button><div class="form-contato" hidden></div>') +
    '</div></div>';
}

// `especialidade`: mostra primeiro (ou só) as parceiras que a atendem; `motivo`: já preenche o pedido de contato
async function renderParceiras(el, { especialidade, motivo } = {}) {
  let todas;
  try { todas = await api("/api/parceiras"); } catch { el.innerHTML = ''; el.hidden = true; return; }
  const atendem = especialidade ? todas.filter(p => p.especialidades.includes(especialidade)) : [];
  const lista = atendem.length ? atendem : todas;
  el.hidden = !lista.length;
  if (!lista.length) { el.innerHTML = ''; return; }
  const nomeEsp = ESPECIALIDADES_NOMES[especialidade] || especialidade;
  el.innerHTML = '<h3 class="grupo-clin">' + ic("check") + ' ' + (atendem.length ? 'Parceiras que atendem ' + esc(nomeEsp) : 'Clínicas parceiras PatasPerto') +
      ' <span class="qtd-grupo">' + lista.length + '</span></h3>' +
    '<p class="info" style="padding:0 0 8px">' + (especialidade && !atendem.length ? 'Nenhuma parceira indica ' + esc(nomeEsp) + ': confirme por telefone. ' : '') +
      'Clínicas cadastradas no PatasPerto: peça para a clínica entrar em contato com você.</p>' +
    lista.map(p => cartaoParceira(p)).join("");
  el.querySelectorAll("[data-contato]").forEach(b => b.addEventListener("click", () => {
    const card = b.closest("[data-parceira]"), p = lista.find(x => x.id === +card.dataset.parceira);
    if (!ehCliente()) { toast("Entre na sua conta de tutor para pedir contato."); abrirLogin("entrar"); return; }
    abrirFormContato(card, p, motivo);
  }));
}

function abrirFormContato(card, p, motivo) {
  const f = card.querySelector(".form-contato"), perfil = lerPerfil(), id = p.id;
  card.querySelector("[data-contato]").hidden = true; f.hidden = false;
  f.innerHTML =
    '<label class="rotulo" for="ctMotivo' + id + '">Motivo</label><select class="campo" id="ctMotivo' + id + '">' + MOTIVOS_CONTATO.map(m => '<option>' + esc(m) + '</option>').join("") + '</select>' +
    '<span class="rotulo">Como prefere ser contatado?</span><div class="escolhas tres">' +
      [["whatsapp", "pulso", "WhatsApp"], ["telefone", "telefone", "Telefone"], ["email", "recibo", "E-mail"]].map(([v, icone, nome], k) =>
        '<label class="op-escolha"><input type="radio" name="ctVia' + id + '" value="' + v + '"' + (k === 0 ? ' checked' : '') + '>' + ic(icone) + '<span><b>' + nome + '</b></span></label>').join("") + '</div>' +
    '<label class="rotulo" for="ctMsg' + id + '">Mensagem (opcional)</label><textarea class="campo" id="ctMsg' + id + '" rows="2" maxlength="1000" placeholder="Ex.: melhor horário para falar"></textarea>' +
    '<label class="chk consentimento"><input type="checkbox" id="ctOk' + id + '"><span>Autorizo enviar meu <b>nome, telefone e e-mail</b> e os dados básicos do meu pet (<b>' + esc(perfil.petNome || "pet") + '</b>: espécie, raça e idade) para a <b>' + esc(p.nome) + '</b> entrar em contato comigo. Dados de saúde não são enviados.</span></label>' +
    '<button class="btn-prim" id="ctEnviar' + id + '">Enviar pedido de contato</button><div id="ctErro' + id + '" role="alert"></div>';
  if (MOTIVOS_CONTATO.includes(motivo)) $("ctMotivo" + id).value = motivo;
  $("ctEnviar" + id).addEventListener("click", async () => {
    const erro = m => { $("ctErro" + id).innerHTML = '<div class="aviso-erro">' + esc(m) + '</div>'; };
    if (!$("ctOk" + id).checked) return erro("Marque a autorização para a clínica poder entrar em contato.");
    const via = f.querySelector('input[name="ctVia' + id + '"]:checked').value;
    try {
      await api("/api/leads", { method: "POST", body: JSON.stringify({ clinica_id: id, motivo: $("ctMotivo" + id).value,
        mensagem: $("ctMsg" + id).value, contato: via, consentimento: true }) });
      f.innerHTML = '<div class="pedido-enviado">' + ic("check") + '<span><b>Pedido enviado!</b> A ' + esc(p.nome) + ' vai falar com você por ' + CONTATO_NOME[via] + '.</span></div>';
    } catch (e) { erro(e.message); }
  });
}

/* ---- Navegação ---- */
const navs = { lista: $("navLoja"), recomendacao: $("navRec"), mapa: $("navMapa"), emergencia: $("navEmg") };
function mostrar(nome) {
  Object.entries(telas).forEach(([k, el]) => { el.style.display = k === nome ? "block" : "none"; });
  Object.entries(navs).forEach(([k, el]) => el.classList.toggle("ativo", k === nome));
  window.scrollTo(0, 0);
}
navs.lista.addEventListener("click", () => mostrar("lista"));
navs.recomendacao.addEventListener("click", () => { mostrar("recomendacao"); renderRecomendacao("checkup"); });
navs.emergencia.addEventListener("click", () => { mostrar("emergencia"); renderEmergenciaHome(); });
navs.mapa.addEventListener("click", () => { mostrar("mapa"); renderMapa(); });
$("btConta").addEventListener("click", () => {
  if (conta && conta.tipo === "clinica") { mostrar("painel"); renderPainel(); } else { mostrar("perfil"); renderPerfil(); }
});
$("btSair").addEventListener("click", () => conta ? sair() : abrirLogin("entrar"));
$("logo").addEventListener("click", () => {
  const modo = document.body.dataset.modo;
  if (modo === "clinica") { mostrar("painel"); renderPainel(); } else if (modo !== "anon") mostrar("lista");
});
// busca no cabeçalho: vale de qualquer tela e sempre leva à Loja
const buscar = () => { termoAtual = campo.value; if (telas.lista.style.display !== "block") mostrar("lista"); render(); };
$("botaoBusca").addEventListener("click", buscar);
campo.addEventListener("keydown", e => { if (e.key === "Enter") buscar(); });

/* ================= CARRINHO E PAGAMENTO =================
   O carrinho fica no navegador (localStorage). Ao confirmar, POST /api/pedidos grava cada item
   na tabela compras — o mesmo dado que alimenta a IA. O PAGAMENTO É SIMULADO (projeto acadêmico):
   nenhum valor é cobrado e nenhum dado de cartão é pedido. */
const FRETE_GRATIS = 100;
const PAGAMENTO_NOME = { pix: "Pix", cartao_entrega: "cartão", dinheiro: "dinheiro" };
// um carrinho por conta (e um para quem navega sem conta), como o perfil: chave "carrinho:<id da conta>"
const chaveCarrinho = () => conta ? "carrinho:" + conta.id : "carrinho";
const lerCarrinho = () => { try { return JSON.parse(localStorage.getItem(chaveCarrinho()) || "[]"); } catch { return []; } };
let carrinho = lerCarrinho();
const checkout = { entrega: "entrega", pagamento: "pix" };

function salvarCarrinho() {
  try { localStorage.setItem(chaveCarrinho(), JSON.stringify(carrinho)); } catch {}
  const q = $("qtdCarrinho"), n = carrinho.reduce((s, i) => s + i.qtd, 0);
  q.textContent = n; q.hidden = !n;
  $("btCarrinhoTopo").setAttribute("aria-label", n ? "Carrinho, " + n + " item(ns)" : "Carrinho vazio");
}
function adicionarAoCarrinho(o) {
  const item = carrinho.find(i => i.oferta_id === o.id);
  if (item) item.qtd = Math.min(20, item.qtd + 1); else carrinho.push({ oferta_id: o.id, qtd: 1 });
  salvarCarrinho();
  const bt = $("btCarrinhoTopo"); bt.classList.remove("pulou"); void bt.offsetWidth; bt.classList.add("pulou");
}
// itens com a oferta completa (descarta ofertas que saíram do catálogo)
const itensCarrinho = () => carrinho.map(i => ({ ...i, oferta: catalogo.ofertas.find(o => o.id === i.oferta_id) })).filter(i => i.oferta);
function totaisCarrinho(itens, entrega) {
  const subtotal = itens.reduce((s, i) => s + i.oferta.preco * i.qtd, 0);
  const lojas = [...new Map(itens.map(i => [i.oferta.loja.id, i.oferta.loja])).values()];
  // mesma regra do back-end (banco/consultas.py → registrar_pedido); o valor gravado é o do servidor
  const frete = entrega === "retirada" || subtotal >= FRETE_GRATIS ? 0 : lojas.reduce((s, l) => s + 8.90 + l.distanciaKm * 4, 0);
  return { subtotal, frete, total: subtotal + frete, lojas, qtd: itens.reduce((s, i) => s + i.qtd, 0) };
}
const opcaoEscolha = (grupo, valor, icone, titulo, sub) =>
  '<label class="op-escolha"><input type="radio" name="' + grupo + '" value="' + valor + '"' + (checkout[grupo] === valor ? ' checked' : '') + '>' +
  ic(icone) + '<span><b>' + titulo + '</b><small>' + sub + '</small></span></label>';
const linhasTotais = (t, entrega) =>
  '<div class="linha"><span>Subtotal (' + t.qtd + (t.qtd > 1 ? ' itens' : ' item') + ')</span><span>' + fmt(t.subtotal) + '</span></div>' +
  '<div class="linha"><span>Frete' + (t.frete && t.lojas.length > 1 ? ' (' + t.lojas.length + ' lojas)' : '') + '</span><span>' + (entrega === "retirada" ? 'Sem custo' : t.frete ? fmt(t.frete) : 'Grátis') + '</span></div>' +
  '<div class="linha total"><span>Total</span><span>' + fmt(t.total) + '</span></div>';

function abrirCarrinho() { mostrar("carrinho"); renderCarrinho(); }

function renderCarrinho(foco) {
  const itens = itensCarrinho();
  if (!itens.length) {
    telas.carrinho.innerHTML = '<div class="vazio-car">' + salsicha(0, "Salsicha esperando, com o corpo curtinho") +
      '<h2 class="det-titulo">Seu carrinho está vazio</h2><p class="secao">A salsicha está esperando. Que tal uma ração, um petisco ou uma bolinha nova?</p>' +
      '<button class="btn-prim" id="btIrLoja">Ver ofertas</button></div>';
    $("btIrLoja").addEventListener("click", () => mostrar("lista"));
    return;
  }
  const t = totaisCarrinho(itens, checkout.entrega), falta = FRETE_GRATIS - t.subtotal;
  telas.carrinho.innerHTML =
    '<h2 class="det-titulo">Seu carrinho</h2>' +
    '<div class="carrinho-grid"><div>' +
      itens.map(i => '<div class="item-car" data-id="' + i.oferta_id + '">' +
        '<div class="mini">' + (ILUSTRACOES[i.oferta.produto.img] || "") + '</div>' +
        '<div class="item-info"><b>' + esc(i.oferta.produto.nome) + '</b><small>' + esc(i.oferta.loja.nome) + ' · ' + num1(i.oferta.loja.distanciaKm) + ' km</small>' +
          '<span class="item-preco">' + fmt(i.oferta.preco * i.qtd) + (i.qtd > 1 ? ' <small>(' + fmt(i.oferta.preco) + ' cada)</small>' : '') + '</span></div>' +
        '<div class="item-lado"><div class="qtd-ctrl"><button data-acao="menos" aria-label="Diminuir quantidade de ' + esc(i.oferta.produto.nome) + '"' + (i.qtd <= 1 ? ' disabled' : '') + '>' + ic("menos") + '</button>' +
          '<span>' + i.qtd + '</span><button data-acao="mais" aria-label="Aumentar quantidade de ' + esc(i.oferta.produto.nome) + '"' + (i.qtd >= 20 ? ' disabled' : '') + '>' + ic("mais") + '</button></div>' +
          '<button class="remover" data-acao="remover">' + ic("lixo") + ' Remover</button></div></div>').join("") +
      '<h3 class="car-h3">Como você quer receber?</h3><div class="escolhas">' +
        opcaoEscolha("entrega", "entrega", "caminhao", "Receber em casa", "Chega em 1 a 3 dias úteis") +
        opcaoEscolha("entrega", "retirada", "loja", "Retirar na loja", "Hoje, sem custo de entrega") + '</div>' +
    '</div><aside class="resumo" aria-live="polite">' +
      (checkout.entrega === "entrega" ? '<div class="frete-salsicha">' +
        salsicha(t.subtotal / FRETE_GRATIS, falta > 0 ? "Salsicha a " + Math.round(t.subtotal / FRETE_GRATIS * 100) + "% do frete grátis" : "Salsicha esticada: frete grátis") +
        '<p>' + (falta > 0 ? 'Faltam <b>' + fmt(falta) + '</b> para o frete grátis. A salsicha vai esticando!' : '<b>Frete grátis liberado!</b> A salsicha chegou lá.') + '</p></div>' : '') +
      linhasTotais(t, checkout.entrega) +
      '<button class="btn-prim" id="btIrPagamento">Continuar para o pagamento ' + ic("seta") + '</button>' +
      '<button class="btn-sec" id="btContinuar">Continuar comprando</button>' +
    '</aside></div>';

  telas.carrinho.querySelectorAll(".item-car [data-acao]").forEach(b => b.addEventListener("click", () => {
    const id = +b.closest(".item-car").dataset.id, item = carrinho.find(i => i.oferta_id === id), acao = b.dataset.acao;
    if (acao === "mais") item.qtd = Math.min(20, item.qtd + 1);
    else if (acao === "menos") item.qtd = Math.max(1, item.qtd - 1);
    else carrinho = carrinho.filter(i => i !== item);
    salvarCarrinho();
    renderCarrinho(acao === "remover" ? null : '[data-id="' + id + '"] [data-acao="' + acao + '"]');
  }));
  telas.carrinho.querySelectorAll('input[name="entrega"]').forEach(r => r.addEventListener("change", () => { checkout.entrega = r.value; renderCarrinho('input[name="entrega"]:checked'); }));
  $("btIrPagamento").addEventListener("click", renderPagamento);
  $("btContinuar").addEventListener("click", () => mostrar("lista"));
  const alvo = foco && telas.carrinho.querySelector(foco);   // mantém o foco do teclado depois de redesenhar
  if (alvo && !alvo.disabled) alvo.focus();
}

function renderPagamento() {
  const itens = itensCarrinho();
  if (!itens.length) return renderCarrinho();
  const t = totaisCarrinho(itens, checkout.entrega), emCasa = checkout.entrega === "entrega", onde = emCasa ? "na entrega" : "na retirada";
  telas.carrinho.innerHTML =
    '<button class="voltar" id="btVoltarCar">' + ic("voltar") + ' Voltar ao carrinho</button>' +
    '<h2 class="det-titulo">Pagamento</h2>' +
    '<div class="carrinho-grid"><div>' +
      (emCasa
        ? '<div class="bloco"><h3>' + ic("mapa") + ' Endereço de entrega</h3><label class="rotulo" for="pgEnd">Rua, número e bairro</label>' +
          '<input class="campo" id="pgEnd" autocomplete="street-address" value="' + esc(lerPerfil().endereco) + '"></div>'
        : '<div class="bloco"><h3>' + ic("loja") + ' Onde retirar</h3>' + t.lojas.map(l => '<p class="local"><b>' + esc(l.nome) + '</b> · ' + esc(l.endereco) + '</p>').join("") + '</div>') +
      '<div class="bloco"><h3>' + ic("cartao") + ' Forma de pagamento</h3><div class="escolhas col">' +
        opcaoEscolha("pagamento", "pix", "pix", "Pix", "Aprovação na hora") +
        opcaoEscolha("pagamento", "cartao_entrega", "cartao", "Cartão " + onde, emCasa ? "Débito ou crédito na maquininha do entregador" : "Débito ou crédito no caixa da loja") +
        opcaoEscolha("pagamento", "dinheiro", "dinheiro", "Dinheiro " + onde, emCasa ? "Se precisar de troco, avise o entregador" : "Pague no caixa da loja") + '</div>' +
        '<div class="aviso simulado">' + ic("cadeado") + '<span><b>Pagamento simulado.</b> Este é um projeto acadêmico: nenhum valor é cobrado e nenhum dado de cartão é pedido.</span></div></div>' +
    '</div><aside class="resumo">' +
      '<ul class="mini-lista">' + itens.map(i => '<li><span>' + i.qtd + '× ' + esc(i.oferta.produto.nome) + '</span><span>' + fmt(i.oferta.preco * i.qtd) + '</span></li>').join("") + '</ul>' +
      linhasTotais(t, checkout.entrega) +
      '<button class="btn-prim" id="btConfirmar">Confirmar pedido · ' + fmt(t.total) + '</button><div id="erroPag" role="alert"></div>' +
    '</aside></div>';
  telas.carrinho.querySelectorAll('input[name="pagamento"]').forEach(r => r.addEventListener("change", () => { checkout.pagamento = r.value; }));
  $("btVoltarCar").addEventListener("click", () => renderCarrinho());
  $("btConfirmar").addEventListener("click", () => confirmarPedido(itens));
  window.scrollTo(0, 0);
}

async function confirmarPedido(itens) {
  const emCasa = checkout.entrega === "entrega", endereco = emCasa ? $("pgEnd").value.trim() : "";
  const erro = msg => { $("erroPag").innerHTML = '<div class="aviso-erro">' + esc(msg) + '</div>'; };
  if (emCasa && endereco.length < 5) { erro("Informe o endereço de entrega (rua, número e bairro)."); $("pgEnd").focus(); return; }
  const bt = $("btConfirmar"); bt.disabled = true; bt.textContent = "Confirmando o pedido…";
  try {
    const r = await api("/api/pedidos", { method: "POST", body: JSON.stringify({ tutor_id: TUTOR_ID, entrega: checkout.entrega, pagamento: checkout.pagamento,
      itens: itens.map(i => ({ oferta_id: i.oferta_id, quantidade: i.qtd })) }) });
    carrinho = []; salvarCarrinho();
    renderPedidoConfirmado(r, itens, endereco);
  } catch (e) {
    erro(e.message.includes("fetch") ? "Sem conexão com o servidor. Confira se o app.py está rodando e tente de novo." : e.message);
    bt.disabled = false; bt.textContent = "Tentar de novo";
  }
}

function renderPedidoConfirmado(r, itens, endereco) {
  const emCasa = r.entrega === "entrega";
  const comoPaga = r.pagamento === "pix" ? "Pagamento via Pix aprovado (simulação)." : "Você paga com " + PAGAMENTO_NOME[r.pagamento] + (emCasa ? " na entrega." : " na retirada.");
  telas.carrinho.innerHTML =
    '<div class="pedido-ok"><div class="selo">' + ic("check") + '</div><h2 class="det-titulo">Pedido confirmado!</h2>' +
      '<p class="num-pedido">Pedido ' + esc(r.numero) + '</p>' +
      '<p class="secao">' + comoPaga + ' ' + (emCasa ? 'Entrega em ' + esc(endereco) + '.' : 'Pode retirar hoje na loja.') + '</p></div>' +
    '<div class="bloco"><ul class="mini-lista">' + itens.map(i => '<li><span>' + i.qtd + '× ' + esc(i.oferta.produto.nome) + ' <small>· ' + esc(i.oferta.loja.nome) + '</small></span><span>' + fmt(i.oferta.preco * i.qtd) + '</span></li>').join("") + '</ul>' +
      '<div class="linha"><span>Subtotal</span><span>' + fmt(r.subtotal) + '</span></div><div class="linha"><span>Frete</span><span>' + (r.frete ? fmt(r.frete) : emCasa ? 'Grátis' : 'Sem custo') + '</span></div>' +
      '<div class="linha total"><span>Total</span><span>' + fmt(r.total) + '</span></div></div>' +
    '<div class="bloco"><h3>' + ic("ia") + ' Sua compra já ensina a IA <span class="rot-db">tabela compras</span></h3>' +
      '<p class="explica" style="margin:0">Os itens entraram no seu histórico: agora são ' + r.historico.total_compras_janela + ' compras nos últimos 90 dias. A recomendação de veterinário leva isso em conta.</p>' +
      '<button class="btn-sec" id="btVerRec">' + ic("ia") + ' Ver recomendação para o meu pet</button></div>' +
    '<button class="btn-prim" id="btVoltarLoja">Voltar à loja</button><button class="btn-sec" id="btMeusPedidos">' + ic("recibo") + ' Ver meus pedidos</button>';
  $("btMeusPedidos").addEventListener("click", () => { mostrar("perfil"); renderPerfil(); $("blocoPedidos").scrollIntoView({ block: "start" }); });
  $("btVerRec").addEventListener("click", () => { mostrar("recomendacao"); renderRecomendacao("checkup"); });
  $("btVoltarLoja").addEventListener("click", () => mostrar("lista"));
  window.scrollTo(0, 0);
}

$("btCarrinhoTopo").addEventListener("click", abrirCarrinho);
salvarCarrinho();   // atualiza o contador com o que ficou salvo no navegador

document.querySelectorAll(".chip").forEach(chip => chip.addEventListener("click", () => {
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("ativo")); chip.classList.add("ativo"); ordemAtual = chip.dataset.ord; render();
}));

// Atalhos por URL para a apresentação: /#mapa, /#recomendacao, /#emergencia, /#perfil
// ?pos=lat,lon[,rótulo] define a localização sem GPS (ex.: /?pos=-22.9056,-47.0608,Campinas#mapa)
(() => {
  const q = new URLSearchParams(location.search).get("pos");
  if (!q) return;
  const [lat, lon, ...rot] = q.split(",");
  if (isFinite(+lat) && isFinite(+lon)) salvarPosicao({ lat: +lat, lon: +lon, fonte: "endereco", rotulo: rot.join(",").trim() || ("Posição definida por URL (" + lat + ", " + lon + ")") });
})();
const abrirPorHash = () => {
  if (["clinica", "anon"].includes(document.body.dataset.modo)) return;   // atalhos são da visão do cliente
  const h = location.hash.replace("#", "");
  if (h === "mapa") { mostrar("mapa"); renderMapa(); }
  else if (h.startsWith("recomendacao")) {          // /#recomendacao ou /#recomendacao/convulsao (já dispara)
    const sit = h.split("/")[1];
    mostrar("recomendacao"); renderRecomendacao(sit || "checkup");
    if (sit && NOME_SIT[sit]) pedirRecomendacao();
  }
  else if (h === "emergencia") { mostrar("emergencia"); renderEmergenciaHome(); }
  else if (h === "perfil") { mostrar("perfil"); renderPerfil(); }
  else if (h === "carrinho") abrirCarrinho();
};
window.addEventListener("hashchange", abrirPorHash);

/* ---- Início: quem está logado decide a visão ----
   cliente → app normal (loja, recomendação, perfil) com o tutor da conta
   clínica → painel de indicadores agregados (outra visão, outro cabeçalho)
   sem conta → tela de login; "continuar sem conta" (ou um atalho /#...) abre o modo demonstração */
(async () => {
  let c = null, apiNoAr = true;
  try { c = (await api("/api/sessao")).conta; } catch { apiNoAr = false; }
  aplicarConta(c, c ? c.tipo : (location.hash || !apiNoAr ? "visitante" : "anon"));
  carregarDados();
  if (c && c.tipo === "clinica") { mostrar("painel"); renderPainel(); }
  else if (document.body.dataset.modo === "anon") { mostrar("login"); renderLogin("entrar"); }
  else { mostrar("lista"); abrirPorHash(); }
})();
