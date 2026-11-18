// ANO DO RODAPÉ
const elementoAno = document.getElementById("ano");
if (elementoAno) {
    elementoAno.textContent = new Date().getFullYear();
}

// TELA DE AVALIAÇÃO
const estrelas = document.querySelectorAll(".estrela");
const nota = document.getElementById("nota");
const botaoAvaliar = document.getElementById("btn-avaliar");
let avaliacao = 0;

// Só executa se houver estrelas na página
if (estrelas.length > 0 && nota) {
    estrelas.forEach((estrela) => {
        estrela.addEventListener("click", () => {
            avaliacao = Number(estrela.dataset.valor);
            estrelas.forEach((item) => {
                if (Number(item.dataset.valor) <= avaliacao) {
                    item.classList.add("ativa");
                } else {
                    item.classList.remove("ativa");
                }
            });
            nota.textContent = `Sua nota: ${avaliacao} de 5`;
        });
    });
}
// Só executa se o botão de avaliar existir
if (botaoAvaliar) {
    botaoAvaliar.addEventListener("click", () => {
        const campoComentario =
            document.getElementById("comentario");
        const comentario =
            campoComentario ? campoComentario.value : "";
        if (avaliacao === 0) {
            alert("Selecione uma quantidade de estrelas.");
            return;
        }
        alert(
            `Avaliação enviada!\nNota: ${avaliacao} estrelas\nComentário: ${comentario}`
        );
    });
}

// CLASSIFICAÇÃO DOS GRUPOS

 // CLASSIFICAÇÃO DOS GRUPOS - INTEGRAÇÃO COM A API

const tituloGrupo = document.getElementById("titulo-grupo");
const listaClassificacao = document.getElementById("lista-classificacao");
const botaoGrupoAnterior = document.getElementById("grupo-anterior");
const botaoProximoGrupo = document.getElementById("proximo-grupo");

if (
    tituloGrupo &&
    listaClassificacao &&
    botaoGrupoAnterior &&
    botaoProximoGrupo
) {
    const API_URL = "http://localhost:8080/api";

    const parametros = new URLSearchParams(window.location.search);
    const campeonatoId = parametros.get("id") || "1";

    let gruposClassificacao = [];
    let grupoAtual = 0;
    let numeroRequisicao = 0;

    // A quantidade de classificados depende do regulamento.
    // Por isso, não destacamos posições automaticamente.
    const legenda = document.querySelector(".legenda-classificacao");

    if (legenda) {
        legenda.style.display = "none";
    }

    function atualizarBotoes() {
        botaoGrupoAnterior.disabled = grupoAtual === 0;

        botaoProximoGrupo.disabled =
            grupoAtual >= gruposClassificacao.length - 1;
    }

    function mostrarMensagem(mensagem) {
        listaClassificacao.innerHTML = "";

        const paragrafo = document.createElement("p");
        paragrafo.textContent = mensagem;
        paragrafo.style.textAlign = "center";
        paragrafo.style.padding = "20px";

        listaClassificacao.appendChild(paragrafo);
    }

    async function mostrarGrupo() {
        if (gruposClassificacao.length === 0) {
            tituloGrupo.textContent = "Classificação";
            mostrarMensagem("Nenhum grupo cadastrado.");
            atualizarBotoes();
            return;
        }

        const grupo = gruposClassificacao[grupoAtual];
        const requisicaoAtual = ++numeroRequisicao;

        tituloGrupo.textContent = grupo.nome;
        mostrarMensagem("Carregando classificação...");
        atualizarBotoes();

        try {
            const resposta = await fetch(
                `${API_URL}/classificacao/campeonato/${campeonatoId}/grupo/${grupo.id}`
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const classificacao = await resposta.json();

            // Impede uma resposta antiga de sobrescrever
            // a classificação de outro grupo.
            if (requisicaoAtual !== numeroRequisicao) {
                return;
            }

            listaClassificacao.innerHTML = "";

            if (classificacao.length === 0) {
                mostrarMensagem("Nenhuma equipe inscrita neste grupo.");
                return;
            }

            classificacao.forEach((time, indice) => {
                const linha = document.createElement("div");
                linha.classList.add("linha");

                const saldo = time.saldoGols > 0
                    ? `+${time.saldoGols}`
                    : String(time.saldoGols);

                const valores = [
                    indice + 1,
                    time.equipe.nome,
                    time.pontos,
                    time.jogos,
                    time.vitorias,
                    time.empates,
                    time.derrotas,
                    saldo
                ];

                valores.forEach((valor, coluna) => {
                    const span = document.createElement("span");

                    if (coluna === 1) {
                        span.classList.add("equipe");
                    }

                    span.textContent = valor;
                    linha.appendChild(span);
                });

                listaClassificacao.appendChild(linha);
            });

        } catch (erro) {
            if (requisicaoAtual !== numeroRequisicao) {
                return;
            }

            console.error("Erro ao carregar classificação:", erro);

            mostrarMensagem(
                "Não foi possível carregar a classificação."
            );
        }
    }

    async function carregarGrupos() {
        tituloGrupo.textContent = "Carregando grupos...";
        mostrarMensagem("Aguarde...");

        botaoGrupoAnterior.disabled = true;
        botaoProximoGrupo.disabled = true;

        try {
            const resposta = await fetch(
                `${API_URL}/grupos/campeonato/${campeonatoId}`
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            gruposClassificacao = await resposta.json();

            grupoAtual = 0;
            mostrarGrupo();

        } catch (erro) {
            console.error("Erro ao carregar grupos:", erro);

            tituloGrupo.textContent = "Classificação";

            mostrarMensagem(
                "Não foi possível carregar os grupos."
            );
        }
    }

    botaoGrupoAnterior.addEventListener("click", () => {
        if (grupoAtual > 0) {
            grupoAtual--;
            mostrarGrupo();
        }
    });

    botaoProximoGrupo.addEventListener("click", () => {
        if (grupoAtual < gruposClassificacao.length - 1) {
            grupoAtual++;
            mostrarGrupo();
        }
    });

    carregarGrupos();
}


    
    // ESTATÍSTICAS - ARTILHARIA E ASSISTÊNCIAS REAIS

    const dadosEstatisticas = [
        {
            titulo: "Artilharia",
            coluna: "Gols",
            jogadores: [],
            carregando: true,
            erro: false
        },
        {
            titulo: "Assistências",
            coluna: "Assist.",
            jogadores: [],
            carregando: true,
            erro: false
        }
    ];

    let estatisticaAtual = 0;

    const tituloEstatistica =
        document.getElementById("titulo-estatistica");

    const tituloValor =
        document.getElementById("titulo-valor");

    const listaEstatisticas =
        document.getElementById("lista-estatisticas");

    const botaoEstatisticaAnterior =
        document.getElementById("estatistica-anterior");

    const botaoProximaEstatistica =
        document.getElementById("proxima-estatistica");

    // Executa somente na página de estatísticas
    if (
        tituloEstatistica &&
        tituloValor &&
        listaEstatisticas &&
        botaoEstatisticaAnterior &&
        botaoProximaEstatistica
    ) {

        const parametrosEstatisticas =
            new URLSearchParams(window.location.search);

        const campeonatoIdEstatisticas =
            parametrosEstatisticas.get("id");

        function mostrarEstatistica() {

            const estatistica =
                dadosEstatisticas[estatisticaAtual];

            tituloEstatistica.textContent =
                estatistica.titulo;

            tituloValor.textContent =
                estatistica.coluna;

            listaEstatisticas.innerHTML = "";

            if (estatistica.carregando) {

                listaEstatisticas.textContent =
                    "Carregando " +
                    estatistica.titulo.toLowerCase() + "...";

            } else if (estatistica.erro) {

                listaEstatisticas.textContent =
                    "Não foi possível carregar " +
                    estatistica.titulo.toLowerCase() + ".";

            } else if (estatistica.jogadores.length === 0) {

                listaEstatisticas.textContent =
                    "Nenhum registro encontrado.";

            } else {

                estatistica.jogadores.forEach(
                    (jogador, indice) => {

                        const linha =
                            document.createElement("div");

                        linha.classList.add("linha-estatistica");

                        let posicao = indice + 1;

                        if (indice === 0) {
                            posicao = "🥇";
                        } else if (indice === 1) {
                            posicao = "🥈";
                        } else if (indice === 2) {
                            posicao = "🥉";
                        }

                        const spanPosicao =
                            document.createElement("span");

                        spanPosicao.className =
                            "posicao-estatistica";

                        spanPosicao.textContent = posicao;

                        const spanNome =
                            document.createElement("span");

                        spanNome.className =
                            "nome-jogador";

                        spanNome.textContent = jogador.nome;

                        const spanTime =
                            document.createElement("span");

                        spanTime.className =
                            "time-jogador";

                        spanTime.textContent = jogador.time;

                        const spanValor =
                            document.createElement("span");

                        spanValor.className =
                            "valor-estatistica";

                        spanValor.textContent = jogador.valor;

                        linha.appendChild(spanPosicao);
                        linha.appendChild(spanNome);
                        linha.appendChild(spanTime);
                        linha.appendChild(spanValor);

                        listaEstatisticas.appendChild(linha);
                    }
                );
            }

            botaoEstatisticaAnterior.disabled =
                estatisticaAtual === 0;

            botaoProximaEstatistica.disabled =
                estatisticaAtual === dadosEstatisticas.length - 1;
        }

        // Consulta a artilharia real
        async function carregarArtilharia() {

            const estatistica = dadosEstatisticas[0];

            try {

                if (!campeonatoIdEstatisticas) {
                    throw new Error("Campeonato não selecionado");
                }

                const resposta = await fetch(
                    "http://localhost:8080/api/artilharia/campeonato/" +
                    encodeURIComponent(campeonatoIdEstatisticas)
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Erro HTTP: " + resposta.status
                    );
                }

                const artilheiros = await resposta.json();

                estatistica.jogadores =
                    artilheiros.map(atleta => ({
                        nome: atleta.atletaNome,
                        time: atleta.equipeNome,
                        valor: atleta.gols
                    }));

                estatistica.erro = false;

            } catch (erro) {

                console.error(
                    "Erro ao carregar artilharia:",
                    erro
                );

                estatistica.erro = true;

            } finally {

                estatistica.carregando = false;

                if (estatisticaAtual === 0) {
                    mostrarEstatistica();
                }
            }
        }

        // Consulta as assistências reais
        async function carregarAssistencias() {

            const estatistica = dadosEstatisticas[1];

            try {

                if (!campeonatoIdEstatisticas) {
                    throw new Error("Campeonato não selecionado");
                }

                const resposta = await fetch(
                    "http://localhost:8080/api/assistencias/campeonato/" +
                    encodeURIComponent(campeonatoIdEstatisticas)
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Erro HTTP: " + resposta.status
                    );
                }

                const assistentes = await resposta.json();

                estatistica.jogadores =
                    assistentes.map(atleta => ({
                        nome: atleta.atletaNome,
                        time: atleta.equipeNome,
                        valor: atleta.assistencias
                    }));

                estatistica.erro = false;

            } catch (erro) {

                console.error(
                    "Erro ao carregar assistências:",
                    erro
                );

                estatistica.erro = true;

            } finally {

                estatistica.carregando = false;

                if (estatisticaAtual === 1) {
                    mostrarEstatistica();
                }
            }
        }

        // Navegação para a próxima estatística
        botaoProximaEstatistica.addEventListener(
            "click",
            () => {

                if (
                    estatisticaAtual <
                    dadosEstatisticas.length - 1
                ) {

                    estatisticaAtual++;
                    mostrarEstatistica();
                }
            }
        );

        // Navegação para a estatística anterior
        botaoEstatisticaAnterior.addEventListener(
            "click",
            () => {

                if (estatisticaAtual > 0) {

                    estatisticaAtual--;
                    mostrarEstatistica();
                }
            }
        );

        // Exibe a artilharia inicialmente
        mostrarEstatistica();

        // Carrega os dados reais das duas estatísticas
        carregarArtilharia();
        carregarAssistencias();
    }


// INTEGRAÇÃO COM A API - LISTA DE CAMPEONATOS

const listaCampeonatos = document.getElementById("lista-campeonatos");

async function carregarCampeonatos() {

    if (!listaCampeonatos) {
        return;
    }

    listaCampeonatos.innerHTML = "<li>Carregando campeonatos...</li>";

    try {
        const resposta = await fetch(
            "http://localhost:8080/api/campeonatos"
        );

        if (!resposta.ok) {
            throw new Error("Erro HTTP: " + resposta.status);
        }

        const campeonatos = await resposta.json();

        listaCampeonatos.innerHTML = "";

        if (campeonatos.length === 0) {
            listaCampeonatos.innerHTML =
                "<li>Nenhum campeonato cadastrado.</li>";
            return;
        }

        campeonatos.forEach((campeonato) => {

            const item = document.createElement("li");
            const link = document.createElement("a");
            const imagem = document.createElement("img");
            const titulo = document.createElement("h3");

            link.href = "det-camp.html?id=" + campeonato.id;

            imagem.src = "imagens/cf2027.png";
            imagem.alt = "Imagem do campeonato";
            imagem.style.width = "100px";

            titulo.textContent =
                campeonato.nome + " " + campeonato.ano;

            link.appendChild(imagem);
            link.appendChild(titulo);
            item.appendChild(link);
            listaCampeonatos.appendChild(item);
        });

    } catch (erro) {

        console.error("Erro ao carregar campeonatos:", erro);

        listaCampeonatos.innerHTML =
            "<li>Não foi possível carregar os campeonatos.</li>";
    }
}

carregarCampeonatos();


// INTEGRAÇÃO COM A API - TABELA DE JOGOS
async function carregarJogosDaAPI() {
    const titulo = document.getElementById("titulo-rodada");
    const lista = document.getElementById("lista-jogos");
    const anterior = document.getElementById("rodada-anterior");
    const proximo = document.getElementById("proxima-rodada");
    if (!titulo || !lista || !anterior || !proximo) return;

    const fases = {
        OITAVAS: { nome: "Oitavas de Final", ordem: 1 },
        QUARTAS: { nome: "Quartas de Final", ordem: 2 },
        SEMIFINAL: { nome: "Semifinal", ordem: 3 },
        FINAL: { nome: "Final", ordem: 4 }
    };
    anterior.disabled = proximo.disabled = true;
    titulo.textContent = "Tabela de Jogos";
    lista.textContent = "Carregando jogos...";

    try {
        const resposta = await fetch("http://localhost:8080/api/partidas");
        if (!resposta.ok) throw new Error("Erro HTTP: " + resposta.status);
        const partidas = await resposta.json();
        const campeonatoId = new URLSearchParams(window.location.search).get("id");
        if (!campeonatoId) {
            lista.textContent = "Campeonato não selecionado.";
            return;
        }
        const grupos = new Map();
        for (const partida of partidas) {
            if (String(partida.campeonato?.id) !== campeonatoId) continue;
            const fase = String(partida.fase ?? "").trim().toUpperCase();
            const eliminatoria = Object.prototype.hasOwnProperty.call(fases, fase) ? fases[fase] : null;
            const rodada = Number(partida.rodada);
            const temRodada = partida.rodada != null && Number.isInteger(rodada) && rodada > 0;
            const chave = eliminatoria ? fase : temRodada ? `RODADA-${rodada}` : "SEM_FASE";
            if (!grupos.has(chave)) {
                grupos.set(chave, {
                    nome: eliminatoria ? eliminatoria.nome : temRodada ? `${rodada}ª Rodada` : "Partidas sem fase definida",
                    ordem: eliminatoria ? eliminatoria.ordem : temRodada ? 0 : 5,
                    rodada: temRodada ? rodada : 0,
                    jogos: []
                });
            }
            grupos.get(chave).jogos.push(partida);
        }
        const etapas = [...grupos.values()].sort((a, b) => a.ordem - b.ordem || a.rodada - b.rodada);
        let indice = 0;
        function mostrarJogos() {
            lista.innerHTML = "";
            if (!etapas.length) {
                titulo.textContent = "Tabela de Jogos";
                lista.textContent = "Nenhuma partida cadastrada.";
                return;
            }
            const etapa = etapas[indice];
            titulo.textContent = etapa.nome;
            for (const partida of etapa.jogos) {
                const div = document.createElement("div");
                div.className = "jogo";
                const mandante = document.createElement("span");
                mandante.className = "time";
                mandante.textContent = partida.mandante.nome;
                const placar = document.createElement("span");
                placar.className = "placar";
                const finalizada = partida.status === "FINALIZADA";
                placar.textContent = finalizada ? `${partida.placarMandante} x ${partida.placarVisitante}` : "×";
                const visitante = document.createElement("span");
                visitante.className = "time";
                visitante.textContent = partida.visitante.nome;
                // Exibe os pênaltis dentro do placar principal
                if (
                    finalizada &&
                    partida.penaltisMandante != null &&
                    partida.penaltisVisitante != null
                ) {
                    placar.classList.add("placar-com-penaltis");

                    const placarPenaltis = document.createElement("span");

                    placarPenaltis.className = "placar-penaltis";

                    placarPenaltis.textContent =
                        `[${partida.penaltisMandante} x ${partida.penaltisVisitante}]`;

                    placar.appendChild(placarPenaltis);
                }

                div.append(mandante, placar, visitante);
                lista.appendChild(div);
            }
            anterior.disabled = indice === 0;
            proximo.disabled = indice === etapas.length - 1;
        }
        anterior.addEventListener("click", () => {
            if (indice > 0) { indice--; mostrarJogos(); }
        });
        proximo.addEventListener("click", () => {
            if (indice < etapas.length - 1) { indice++; mostrarJogos(); }
        });
        mostrarJogos();
    } catch (erro) {
        console.error("Erro ao carregar jogos da API:", erro);
        titulo.textContent = "Tabela de Jogos";
        lista.textContent = "Não foi possível carregar os jogos.";
        anterior.disabled = proximo.disabled = true;
    }
}
carregarJogosDaAPI();

// NAVEGAÇÃO INFERIOR - PRESERVAR O CAMPEONATO SELECIONADO

function configurarNavegacaoCampeonato() {

    const parametros = new URLSearchParams(window.location.search);
    const campeonatoId = parametros.get("id");

    // Se não houver campeonato selecionado, mantém os links originais.
    if (!campeonatoId) {
        return;
    }

    const linksNavegacao = document.querySelectorAll(
        ".bottom-nav a"
    );

    linksNavegacao.forEach(link => {

        const endereco = link.getAttribute("href");

        if (!endereco) {
            return;
        }

        const pagina = endereco.split("?")[0];

        const paginasCampeonato = [
            "det-camp.html",
            "tab-jogos.html",
            "classificacao.html",
            "estatisticas.html"
        ];

        if (paginasCampeonato.includes(pagina)) {

            link.href =
                pagina + "?id=" + encodeURIComponent(campeonatoId);
        }
    });
}

configurarNavegacaoCampeonato();

