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

// RODADAS DA COPA DO FEIJÃO
const rodadas = [
    // 1ª RODADA
    {
        nome: "1ª Rodada",
        jogos: [
            ["Villareal", "2 x 1", "Caldeirão"],
            ["SAJA", "1 x 1", "Real Piçarra"],
            ["Força Jovem", "3 x 0", "Estação"],
            ["Sitio Velho", "1 x 2", "Flamenguinho"],
            ["Baixa Verde", "2 x 0", "Barcelona"],
            ["Nacional", "1 x 1", "Capriza"]
        ]
    },
    // 2ª RODADA
    {
        nome: "2ª Rodada",
        jogos: [
            ["Villareal", "1 x 0", "Real Piçarra"],
            ["Caldeirão", "2 x 2", "SAJA"],
            ["Força Jovem", "2 x 1", "Flamenguinho"],
            ["Estação", "0 x 0", "Sitio Velho"],
            ["Baixa Verde", "1 x 2", "Capriza"],
            ["Barcelona", "3 x 1", "Nacional"]
        ]
    },
    // 3ª RODADA
    {
        nome: "3ª Rodada",
        jogos: [
            ["Villareal", "2 x 2", "SAJA"],
            ["Real Piçarra", "1 x 0", "Caldeirão"],
            ["Força Jovem", "1 x 1", "Sitio Velho"],
            ["Flamenguinho", "2 x 0", "Estação"],
            ["Baixa Verde", "2 x 1", "Nacional"],
            ["Capriza", "1 x 1", "Barcelona"]
        ]
    },
    // QUARTAS DE FINAL
    {
        nome: "Quartas de Final",
        jogos: [
            ["Villareal", "2 x 0", "Barcelona"],
            ["Força Jovem", "1 x 2", "SAJA"],
            ["Baixa Verde", "3 x 1", "Real Piçarra"],
            ["Flamenguinho", "2 x 1", "Capriza"]
        ]
    },
    // SEMIFINAL
    {
        nome: "Semifinal",
        jogos: [
            ["Villareal", "2 x 1", "SAJA"],
            ["Baixa Verde", "1 x 0", "Flamenguinho"]
        ]
    },
    // FINAL
    {
        nome: "Final",
        jogos: [
            ["Villareal", "2 x 1", "Baixa Verde"]
        ]
    }
];

// ELEMENTOS DA PÁGINA DE JOGOS
const tituloRodada =
    document.getElementById("titulo-rodada");
const listaJogos =
    document.getElementById("lista-jogos");
const botaoAnterior =
    document.getElementById("rodada-anterior");
const botaoProximo =
    document.getElementById("proxima-rodada");
let rodadaAtual = 0;
// SÓ EXECUTA NA PÁGINA DE JOGOS
if (
    tituloRodada &&
    listaJogos &&
    botaoAnterior &&
    botaoProximo
) {
    function mostrarRodada() {
        tituloRodada.textContent =
            rodadas[rodadaAtual].nome;
        listaJogos.innerHTML = "";
        rodadas[rodadaAtual].jogos.forEach((jogo) => {
            const divJogo =
                document.createElement("div");
            divJogo.classList.add("jogo");
            divJogo.innerHTML = `
                <span class="time">
                    ${jogo[0]}
                </span>
                <span class="placar">
                    ${jogo[1]}
                </span>
                <span class="time">
                    ${jogo[2]}
                </span>
            `;
            listaJogos.appendChild(divJogo);
        });
        // Desativa seta esquerda na 1ª rodada
        botaoAnterior.disabled =
            rodadaAtual === 0;
        // Desativa seta direita na última rodada
        botaoProximo.disabled =
            rodadaAtual === rodadas.length - 1;
    }

    // PRÓXIMA RODADA
    botaoProximo.addEventListener("click", () => {
        if (rodadaAtual < rodadas.length - 1) {
            rodadaAtual++;
            mostrarRodada();
        }
    });

    // RODADA ANTERIOR
    botaoAnterior.addEventListener("click", () => {
        if (rodadaAtual > 0) {
            rodadaAtual--;
            mostrarRodada();
        }
    });
    // Exibe a primeira rodada
    mostrarRodada();
}

// CLASSIFICAÇÃO DOS GRUPOS
const gruposClassificacao = [
    // GRUPO A
    {
        nome: "Grupo A",
        times: [
            {
                nome: "Villareal",
                pontos: 7,
                jogos: 3,
                vitorias: 2,
                empates: 1,
                derrotas: 0,
                saldo: 2
            },
            {
                nome: "Real Piçarra",
                pontos: 4,
                jogos: 3,
                vitorias: 1,
                empates: 1,
                derrotas: 1,
                saldo: 0
            },
            {
                nome: "SAJA",
                pontos: 3,
                jogos: 3,
                vitorias: 0,
                empates: 3,
                derrotas: 0,
                saldo: 0
            },
            {
                nome: "Caldeirão",
                pontos: 1,
                jogos: 3,
                vitorias: 0,
                empates: 1,
                derrotas: 2,
                saldo: -2
            }
        ]
    },
    // GRUPO B
    {
        nome: "Grupo B",
        times: [
            {
                nome: "Força Jovem",
                pontos: 7,
                jogos: 3,
                vitorias: 2,
                empates: 1,
                derrotas: 0,
                saldo: 4
            },
            {
                nome: "Flamenguinho",
                pontos: 6,
                jogos: 3,
                vitorias: 2,
                empates: 0,
                derrotas: 1,
                saldo: 2
            },
            {
                nome: "Sitio Velho",
                pontos: 2,
                jogos: 3,
                vitorias: 0,
                empates: 2,
                derrotas: 1,
                saldo: -1
            },
            {
                nome: "Estação",
                pontos: 1,
                jogos: 3,
                vitorias: 0,
                empates: 1,
                derrotas: 2,
                saldo: -5
            }
        ]
    },
    // GRUPO C
    {
        nome: "Grupo C",
        times: [
            {
                nome: "Baixa Verde",
                pontos: 6,
                jogos: 3,
                vitorias: 2,
                empates: 0,
                derrotas: 1,
                saldo: 2
            },
            {
                nome: "Capriza",
                pontos: 5,
                jogos: 3,
                vitorias: 1,
                empates: 2,
                derrotas: 0,
                saldo: 1
            },
            {
                nome: "Barcelona",
                pontos: 4,
                jogos: 3,
                vitorias: 1,
                empates: 1,
                derrotas: 1,
                saldo: 0
            },
            {
                nome: "Nacional",
                pontos: 1,
                jogos: 3,
                vitorias: 0,
                empates: 1,
                derrotas: 2,
                saldo: -3
            }
        ]
    }
];
// Grupo inicial
let grupoAtual = 0;

// Elementos da página
const tituloGrupo =
    document.getElementById("titulo-grupo");
const listaClassificacao =
    document.getElementById("lista-classificacao");
const botaoGrupoAnterior =
    document.getElementById("grupo-anterior");
const botaoProximoGrupo =
    document.getElementById("proximo-grupo");
// Só executa na página classificação
if (
    tituloGrupo &&
    listaClassificacao &&
    botaoGrupoAnterior &&
    botaoProximoGrupo
) {
    function mostrarGrupo() {
        // Nome do grupo
        tituloGrupo.textContent =
            gruposClassificacao[grupoAtual].nome;
        // Limpa a classificação anterior
        listaClassificacao.innerHTML = "";
        // Percorre os times
        gruposClassificacao[grupoAtual].times.forEach(
            (time, indice) => {
                const linha =
                    document.createElement("div");
                linha.classList.add("linha");
                // Os dois primeiros ficam marcados
                if (indice < 2) {
                    linha.classList.add("classificado");
                }
                // Mostra + para saldo positivo
                let saldoFormatado = time.saldo;
                if (time.saldo > 0) {
                    saldoFormatado = "+" + time.saldo;
                }
                linha.innerHTML = `
                    <span>${indice + 1}</span>
                    <span class="equipe">
                        ${time.nome}
                    </span>
                    <span>${time.pontos}</span>
                    <span>${time.jogos}</span>
                    <span>${time.vitorias}</span>
                    <span>${time.empates}</span>
                    <span>${time.derrotas}</span>
                    <span>${saldoFormatado}</span>
                `;
                listaClassificacao.appendChild(linha);
            }
        );
        // Desativa esquerda no Grupo A
        botaoGrupoAnterior.disabled =
            grupoAtual === 0;
        // Desativa direita no Grupo C
        botaoProximoGrupo.disabled =
            grupoAtual === gruposClassificacao.length - 1;
    }
    // Próximo grupo
    botaoProximoGrupo.addEventListener("click", () => {
        if (
            grupoAtual <
            gruposClassificacao.length - 1
        ) {
            grupoAtual++;
            mostrarGrupo();
        }
    });
    // Grupo anterior
    botaoGrupoAnterior.addEventListener("click", () => {
        if (grupoAtual > 0) {
            grupoAtual--;
            mostrarGrupo();
        }
    });
    // Abre mostrando Grupo A
    mostrarGrupo();
}
// ESTATÍSTICAS
const dadosEstatisticas = [
    // ARTILHARIA
    {
        titulo: "Artilharia",
        coluna: "Gols",
        jogadores: [
            {
                nome: "Zé do Gol",
                time: "Villareal",
                valor: 7
            },
            {
                nome: "Juninho Canela",
                time: "Força Jovem",
                valor: 6
            },
            {
                nome: "Tonho Chuteira",
                time: "Baixa Verde",
                valor: 5
            },
            {
                nome: "Pedrinho Foguete",
                time: "SAJA",
                valor: 5
            },
            {
                nome: "Chico Boleiro",
                time: "Flamenguinho",
                valor: 4
            },
            {
                nome: "Nego Bomba",
                time: "Real Piçarra",
                valor: 4
            },
            {
                nome: "Raimundinho Messi",
                time: "Capriza",
                valor: 3
            },
            {
                nome: "Dudu Sem Freio",
                time: "Barcelona",
                valor: 3
            }
        ]
    },
    // ASSISTÊNCIAS
    {
        titulo: "Assistências",
        coluna: "Assist.",
        jogadores: [
            {
                nome: "Dudu Sem Freio",
                time: "Barcelona",
                valor: 6
            },
            {
                nome: "Chiquinho GPS",
                time: "Villareal",
                valor: 5
            },
            {
                nome: "Zé Passe Certo",
                time: "Força Jovem",
                valor: 5
            },
            {
                nome: "Tião Garçom",
                time: "Baixa Verde",
                valor: 4
            },
            {
                nome: "Beto Pé de Vento",
                time: "Capriza",
                valor: 4
            },
            {
                nome: "Carlinhos Wi-Fi",
                time: "Flamenguinho",
                valor: 3
            },
            {
                nome: "João Sem Pressa",
                time: "Real Piçarra",
                valor: 3
            },
            {
                nome: "Naldinho 220V",
                time: "SAJA",
                valor: 2
            }
        ]
    }
];
// Estatística inicial
let estatisticaAtual = 0;
// Elementos da página
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
// Só executa na página estatísticas
if (
    tituloEstatistica &&
    tituloValor &&
    listaEstatisticas &&
    botaoEstatisticaAnterior &&
    botaoProximaEstatistica
) {
    function mostrarEstatistica() {
        // Título
        tituloEstatistica.textContent =
            dadosEstatisticas[estatisticaAtual].titulo;
        // Nome da última coluna
        tituloValor.textContent =
            dadosEstatisticas[estatisticaAtual].coluna;
        // Limpa a lista anterior
        listaEstatisticas.innerHTML = "";
        // Insere os jogadores
        dadosEstatisticas[estatisticaAtual].jogadores.forEach(
            (jogador, indice) => {
                const linha =
                    document.createElement("div");
                linha.classList.add("linha-estatistica");
                let posicao = indice + 1;
                // Medalha para os três primeiros
                if (indice === 0) {
                    posicao = "🥇";
                }
                if (indice === 1) {
                    posicao = "🥈";
                }
                if (indice === 2) {
                    posicao = "🥉";
                }
                linha.innerHTML = `
                    <span class="posicao-estatistica">
                        ${posicao}
                    </span>
                    <span class="nome-jogador">
                        ${jogador.nome}
                    </span>
                    <span class="time-jogador">
                        ${jogador.time}
                    </span>
                    <span class="valor-estatistica">
                        ${jogador.valor}
                    </span>
                `;
                listaEstatisticas.appendChild(linha);
            }
        );
        // Desativa seta esquerda na Artilharia
        botaoEstatisticaAnterior.disabled =
            estatisticaAtual === 0;
        // Desativa seta direita nas Assistências
        botaoProximaEstatistica.disabled =
            estatisticaAtual === dadosEstatisticas.length - 1;
    }
    // Próxima estatística
    botaoProximaEstatistica.addEventListener("click", () => {
        if (
            estatisticaAtual <
            dadosEstatisticas.length - 1
        ) {
            estatisticaAtual++;
            mostrarEstatistica();
        }
    });
    // Estatística anterior
    botaoEstatisticaAnterior.addEventListener("click", () => {
        if (estatisticaAtual > 0) {
            estatisticaAtual--;
            mostrarEstatistica();
        }
    });
    // Abre mostrando Artilharia
    mostrarEstatistica();
}