document.addEventListener("DOMContentLoaded", () => {    
    // Controla os campos conforme o formato de disputa
    const campoTipoDisputa =
        document.getElementById("tipo-disputa");

    const camposGrupos = [
        "quantidade-grupos",
        "classificados-por-grupo",
        "vagas-adicionais"
    ];

    const campoPrimeiraFase =
        document.getElementById("primeira-fase-eliminatoria");

    function atualizarCamposDisputa() {

        const tipo = campoTipoDisputa.value;

        const possuiGrupos =
            tipo === "GRUPOS_ELIMINATORIAS";

        const possuiEliminatorias =
            tipo === "GRUPOS_ELIMINATORIAS" ||
            tipo === "ELIMINATORIAS";

        camposGrupos.forEach(id => {

            const campo = document.getElementById(id);

            campo.closest(".campo-formulario").style.display =
                possuiGrupos ? "" : "none";

            campo.disabled = !possuiGrupos;
        });

        campoPrimeiraFase.closest(".campo-formulario").style.display =
            possuiEliminatorias ? "" : "none";

        campoPrimeiraFase.disabled = !possuiEliminatorias;
    }

    campoTipoDisputa.addEventListener(
        "change",
        atualizarCamposDisputa
    );

    atualizarCamposDisputa();

    // Guarda o ID do campeonato em edição.
    // null significa que estamos cadastrando um novo campeonato.
    let campeonatoEmEdicaoId = null;

     // =========================================
    // CARREGAR CAMPEONATOS DA API
    // =========================================

    async function carregarCampeonatos() {

        const lista = document.getElementById(
            "lista-campeonatos-admin"
        );

        if (!lista) {
            return;
        }

        lista.innerHTML = `
            <tr>
                <td colspan="6">
                    Carregando campeonatos...
                </td>
            </tr>
        `;

        try {

            const resposta = await fetch(
                "http://localhost:8080/api/campeonatos"
            );

            if (!resposta.ok) {
                throw new Error(
                    "Erro HTTP: " + resposta.status
                );
            }

            const campeonatos = await resposta.json();

            lista.innerHTML = "";

            if (campeonatos.length === 0) {

                lista.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Nenhum campeonato cadastrado.
                        </td>
                    </tr>
                `;

                return;
            }

            campeonatos.forEach(campeonato => {

                const linha = document.createElement("tr");

                const valores = [
                    campeonato.id,
                    campeonato.nome,
                    campeonato.ano,
                    campeonato.dataInicio,
                    campeonato.dataFim
                ];
                
                valores.forEach(valor => {

                    const coluna = document.createElement("td");

                    coluna.textContent = valor ?? "-";

                    coluna.style.padding = "12px";

                    coluna.style.borderBottom =
                        "1px solid #e2e8f0";

                    linha.appendChild(coluna);
                });

                // Coluna de ações
                const colunaAcoes =
                    document.createElement("td");

                colunaAcoes.style.padding = "12px";

                colunaAcoes.style.borderBottom =
                    "1px solid #e2e8f0";

                // Botão Editar
                const botaoEditar = document.createElement("button");

                botaoEditar.type = "button";
                botaoEditar.textContent = "Editar";
                botaoEditar.classList.add("btn-editar");
                // Identifica o campeonato selecionado para edição                
                botaoEditar.addEventListener("click", () => {
                    // Ativa o modo de edição
                    campeonatoEmEdicaoId = campeonato.id;
                    const botaoCancelar = document.getElementById(
                        "btn-cancelar-edicao-campeonato"
                    );

                    if (botaoCancelar) {
                        botaoCancelar.style.display = "inline-block";
                    }
                    // Altera o texto do botão para o modo de edição
                    document.querySelector("#form-campeonato .btn-salvar").textContent =
                        "Atualizar campeonato";
                    // Preenche o formulário com os dados do campeonato
                    document.getElementById("nome-campeonato").value =
                        campeonato.nome ?? "";

                    document.getElementById("ano-campeonato").value =
                        campeonato.ano ?? "";

                    document.getElementById("inicio-campeonato").value =
                        campeonato.dataInicio ?? "";

                    document.getElementById("fim-campeonato").value =
                        campeonato.dataFim ?? "";

                    document.getElementById("regulamento-campeonato").value =
                        campeonato.regulamento ?? "";
                    
                    // Preenche as regras de pontuação do campeonato
                    document.getElementById("pontos-vitoria").value =
                        campeonato.pontosVitoria ?? 3;

                    document.getElementById("pontos-empate").value =
                        campeonato.pontosEmpate ?? 1;

                    document.getElementById("pontos-derrota").value =
                        campeonato.pontosDerrota ?? 0;
                    
                    // Preenche o formato de disputa do campeonato
                    document.getElementById("tipo-disputa").value =
                        campeonato.tipoDisputa ?? "GRUPOS_ELIMINATORIAS";

                    document.getElementById("quantidade-grupos").value =
                        campeonato.quantidadeGrupos ?? "";

                    document.getElementById("classificados-por-grupo").value =
                        campeonato.classificadosPorGrupo ?? "";

                    document.getElementById("vagas-adicionais").value =
                        campeonato.vagasAdicionais ?? 0;

                    document.getElementById("primeira-fase-eliminatoria").value =
                        campeonato.primeiraFaseEliminatoria ?? "";
                    
                    // Atualiza a visibilidade dos campos no modo de edição
                    atualizarCamposDisputa();

                    // Leva o usuário até o formulário
                    document.getElementById("form-campeonato")
                        .scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                });

                // Botão Excluir
                const botaoExcluir =
                    document.createElement("button");

                botaoExcluir.type = "button";

                botaoExcluir.textContent = "Excluir";

                botaoExcluir.classList.add("btn-excluir");

                botaoExcluir.addEventListener("click", async () => {

                    const confirmou = confirm(
                        `Deseja realmente excluir o campeonato "${campeonato.nome}" (ID ${campeonato.id})?`
                    );

                    if (!confirmou) {
                        return;
                    }

                    botaoExcluir.disabled = true;
                    botaoExcluir.textContent = "Excluindo...";

                    try {

                        const resposta = await fetch(
                            `http://localhost:8080/api/campeonatos/${campeonato.id}`,
                            {
                                method: "DELETE"
                            }
                        );

                        if (resposta.status === 409) {
                            alert(
                                "Não é possível excluir este campeonato, " +
                                "pois ele possui registros vinculados."
                            );
                            return;
                        }

                        if (!resposta.ok) {
                            throw new Error(
                                "Erro HTTP: " + resposta.status
                            );
                        }

                        alert("Campeonato excluído com sucesso!");

                        await carregarCampeonatos();

                    } catch (erro) {

                        console.error(
                            "Erro ao excluir campeonato:",
                            erro
                        );

                        alert(
                            "Não foi possível excluir o campeonato. " +
                            "Verifique a conexão com a API."
                        );

                    } finally {
                        botaoExcluir.disabled = false;
                        botaoExcluir.textContent = "Excluir";
                    }

                    });

                    // Coloca o botão Editar na coluna de ações
                    colunaAcoes.appendChild(botaoEditar);

                    // Coloca o botão Excluir na coluna de ações
                    colunaAcoes.appendChild(botaoExcluir);

                    // Coloca a coluna de ações na linha
                    linha.appendChild(colunaAcoes);

                    // Adiciona a linha à tabela
                    lista.appendChild(linha);

                });

        } catch (erro) {

            console.error(
                "Erro ao carregar campeonatos:",
                erro
            );

            lista.innerHTML = `
                <tr>
                    <td colspan="6">
                        Não foi possível carregar os campeonatos.
                    </td>
                </tr>
            `;
        }
    }

    carregarCampeonatos();

    const formularioCampeonato =
        document.getElementById("form-campeonato");
    const botaoCancelarEdicaoCampeonato =
        document.getElementById("btn-cancelar-edicao-campeonato");

    if (botaoCancelarEdicaoCampeonato && formularioCampeonato) {

        botaoCancelarEdicaoCampeonato.addEventListener("click", () => {

            // Encerra o modo de edição
            campeonatoEmEdicaoId = null;

            // Limpa os campos do formulário
            formularioCampeonato.reset();
            
            // Restaura os campos conforme o tipo de disputa padrão
            atualizarCamposDisputa();

            // Restaura o botão de salvar
            const botaoSalvar = formularioCampeonato.querySelector(
                'button[type="submit"]'
            );

            if (botaoSalvar) {
                botaoSalvar.textContent = "Salvar campeonato";
            }

            // Oculta o botão Cancelar edição
            botaoCancelarEdicaoCampeonato.style.display = "none";

            // Limpa a mensagem do formulário
            const mensagem = document.getElementById("mensagem-campeonato");

            if (mensagem) {
                mensagem.textContent = "";
            }

        });

    }

    const mensagemCampeonato =
        document.getElementById("mensagem-campeonato");

    if (formularioCampeonato && mensagemCampeonato) {

        formularioCampeonato.addEventListener(
            "submit",
            async (evento) => {

                evento.preventDefault();

                const botaoSalvar =
                    formularioCampeonato.querySelector(
                        'button[type="submit"]'
                    );

                const nome = document.getElementById(
                    "nome-campeonato"
                ).value.trim();

                const ano = Number(
                    document.getElementById(
                        "ano-campeonato"
                    ).value
                );

                const dataInicio =
                    document.getElementById(
                        "inicio-campeonato"
                    ).value;

                const dataFim =
                    document.getElementById(
                        "fim-campeonato"
                    ).value;

                const regulamento =
                    document.getElementById(
                        "regulamento-campeonato"
                    ).value.trim();

                // Regras de pontuação do campeonato
                const pontosVitoria = Number(
                    document.getElementById("pontos-vitoria").value
                );

                const pontosEmpate = Number(
                    document.getElementById("pontos-empate").value
                );

                const pontosDerrota = Number(
                    document.getElementById("pontos-derrota").value
                );
                
                // Configurações do formato de disputa
                const tipoDisputa =
                    document.getElementById("tipo-disputa").value;

                const quantidadeGruposValor =
                    document.getElementById("quantidade-grupos").value;

                const classificadosPorGrupoValor =
                    document.getElementById("classificados-por-grupo").value;

                const vagasAdicionaisValor =
                    document.getElementById("vagas-adicionais").value;

                const primeiraFaseEliminatoria =
                    document.getElementById("primeira-fase-eliminatoria").value;

                const quantidadeGrupos = quantidadeGruposValor === ""
                    ? null : Number(quantidadeGruposValor);

                const classificadosPorGrupo = classificadosPorGrupoValor === ""
                    ? null : Number(classificadosPorGrupoValor);

                const vagasAdicionais = vagasAdicionaisValor === ""
                    ? 0 : Number(vagasAdicionaisValor);

                // Validações antes de enviar à API
                if (nome.length < 3 || nome.length > 100) {
                    mensagemCampeonato.textContent =
                        "O nome deve ter entre 3 e 100 caracteres.";
                    mensagemCampeonato.style.color = "#dc2626";
                    return;
                }

                if (!Number.isInteger(ano) || ano < 2000 || ano > 2100) {
                    mensagemCampeonato.textContent =
                        "Informe um ano válido entre 2000 e 2100.";
                    mensagemCampeonato.style.color = "#dc2626";
                    return;
                }

                if (!dataInicio || !dataFim) {
                    mensagemCampeonato.textContent =
                        "Informe as datas de início e término.";
                    mensagemCampeonato.style.color = "#dc2626";
                    return;
                }

                if (dataFim < dataInicio) {
                    mensagemCampeonato.textContent =
                        "A data de término não pode ser anterior à data de início.";
                    mensagemCampeonato.style.color = "#dc2626";
                    return;
                }
                
                // Validação do formato de disputa
                if (tipoDisputa === "GRUPOS_ELIMINATORIAS") {

                    if (
                        !Number.isInteger(quantidadeGrupos) ||
                        quantidadeGrupos < 1 ||
                        !Number.isInteger(classificadosPorGrupo) ||
                        classificadosPorGrupo < 1 ||
                        !Number.isInteger(vagasAdicionais) ||
                        vagasAdicionais < 0
                    ) {
                        mensagemCampeonato.textContent =
                            "Informe quantidades válidas de grupos, classificados e vagas adicionais.";
                        mensagemCampeonato.style.color = "#dc2626";
                        return;
                    }

                    const totalClassificados =
                        quantidadeGrupos * classificadosPorGrupo +
                        vagasAdicionais;

                    const equipesPorFase = {
                        OITAVAS: 16,
                        QUARTAS: 8,
                        SEMIFINAIS: 4,
                        FINAL: 2
                    };

                    const equipesNecessarias =
                        equipesPorFase[primeiraFaseEliminatoria];

                    if (!equipesNecessarias) {
                        mensagemCampeonato.textContent =
                            "Selecione a primeira fase eliminatória.";
                        mensagemCampeonato.style.color = "#dc2626";
                        return;
                    }

                    if (totalClassificados !== equipesNecessarias) {
                        mensagemCampeonato.textContent =
                            `A fase selecionada exige ${equipesNecessarias} equipes, ` +
                            `mas a configuração possui ${totalClassificados} classificados.`;
                        mensagemCampeonato.style.color = "#dc2626";
                        return;
                    }
                }
                
                // Validação das eliminatórias diretas
                if (tipoDisputa === "ELIMINATORIAS") {

                    const fasesPermitidas = [
                        "OITAVAS",
                        "QUARTAS",
                        "SEMIFINAIS",
                        "FINAL"
                    ];

                    if (!fasesPermitidas.includes(primeiraFaseEliminatoria)) {
                        mensagemCampeonato.textContent =
                            "Selecione a primeira fase das eliminatórias.";
                        mensagemCampeonato.style.color = "#dc2626";
                        return;
                    }
                }
                    
                const possuiGrupos =
                    tipoDisputa === "GRUPOS_ELIMINATORIAS";

                const possuiEliminatorias =
                    tipoDisputa === "GRUPOS_ELIMINATORIAS" ||
                    tipoDisputa === "ELIMINATORIAS";

                const novoCampeonato = {
                    nome: nome,
                    ano: ano,
                    regulamento: regulamento,
                    dataInicio: dataInicio,
                    dataFim: dataFim,

                    pontosVitoria: pontosVitoria,
                    pontosEmpate: pontosEmpate,
                    pontosDerrota: pontosDerrota,

                    tipoDisputa: tipoDisputa,

                    quantidadeGrupos: possuiGrupos
                        ? quantidadeGrupos : null,

                    classificadosPorGrupo: possuiGrupos
                        ? classificadosPorGrupo : null,

                    vagasAdicionais: possuiGrupos
                        ? vagasAdicionais : 0,

                    primeiraFaseEliminatoria: possuiEliminatorias
                        ? (primeiraFaseEliminatoria || null)
                        : null
                };

                botaoSalvar.disabled = true;
                botaoSalvar.textContent = "Salvando...";

                mensagemCampeonato.textContent =
                    "Cadastrando campeonato...";

                mensagemCampeonato.style.color = "#64748b";
                // Verifica se estamos cadastrando ou editando
                const modoEdicao = campeonatoEmEdicaoId !== null;

                const urlCampeonato = modoEdicao
                    ? `http://localhost:8080/api/campeonatos/${campeonatoEmEdicaoId}`
                    : "http://localhost:8080/api/campeonatos";

                const metodoHttp = modoEdicao ? "PUT" : "POST";
                try {
                    const resposta = await fetch(
                    urlCampeonato,
                    {
                        method: metodoHttp,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(novoCampeonato)
                    }
                );

                    if (!resposta.ok) {
                        throw new Error(
                            "Erro HTTP: " + resposta.status
                        );
                    }

                    const campeonatoSalvo =
                        await resposta.json();

                    console.log(
                        "Campeonato cadastrado:",
                        campeonatoSalvo
                    );

                    mensagemCampeonato.textContent =
                        "Campeonato cadastrado com sucesso!";

                    mensagemCampeonato.style.color = "#16a34a";

                    formularioCampeonato.reset();

                    // Retorna ao modo de cadastro após salvar
                    campeonatoEmEdicaoId = null;

                    // Oculta o botão Cancelar edição
                    const botaoCancelar = document.getElementById(
                        "btn-cancelar-edicao-campeonato"
                    );

                    if (botaoCancelar) {
                        botaoCancelar.style.display = "none";
                    }

                    // Restaura o texto do botão após salvar
                    document.querySelector("#form-campeonato .btn-salvar").textContent =
                        "Salvar campeonato";

                    // Atualiza a tabela automaticamente
                    await carregarCampeonatos();

                } catch (erro) {

                    console.error(
                        "Erro ao cadastrar campeonato:",
                        erro
                    );

                    mensagemCampeonato.textContent =
                        "Não foi possível cadastrar o campeonato. " +
                        "Verifique os dados e a conexão com a API.";

                    mensagemCampeonato.style.color = "#dc2626";

                } finally {

                    botaoSalvar.disabled = false;
                    botaoSalvar.textContent = "Salvar campeonato";
                }
            }
        );
    }

});