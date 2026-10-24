document.addEventListener("DOMContentLoaded", () => {

    console.log("Módulo de Partidas FutScore carregado!");

    // =========================================
    // CARREGAR CAMPEONATOS NO FORMULÁRIO
    // =========================================

    async function carregarCampeonatos() {

        const selectCampeonato = document.getElementById(
            "campeonato-partida"
        );

        if (!selectCampeonato) return;

        selectCampeonato.innerHTML =
            '<option value="">Carregando campeonatos...</option>';

        try {

            const resposta = await fetch(
                "http://localhost:8080/api/campeonatos"
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const campeonatos = await resposta.json();

            selectCampeonato.innerHTML =
                '<option value="">Selecione um campeonato</option>';

            campeonatos.forEach(campeonato => {

                const opcao = document.createElement("option");

                opcao.value = campeonato.id;
                opcao.textContent = campeonato.nome;

                selectCampeonato.appendChild(opcao);

            });

        } catch (erro) {

            console.error("Erro ao carregar campeonatos:", erro);

            selectCampeonato.innerHTML =
                '<option value="">Erro ao carregar campeonatos</option>';

        }

    }

    // Executa o carregamento ao abrir a página
    carregarCampeonatos();

    // =========================================
    // CARREGAR EQUIPES NO FORMULÁRIO
    // =========================================

    async function carregarEquipes() {

        const selectMandante = document.getElementById(
            "mandante-partida"
        );

        const selectVisitante = document.getElementById(
            "visitante-partida"
        );

        if (!selectMandante || !selectVisitante) return;

        selectMandante.innerHTML =
            '<option value="">Carregando equipes...</option>';

        selectVisitante.innerHTML =
            '<option value="">Carregando equipes...</option>';

        try {

            const resposta = await fetch(
                "http://localhost:8080/api/equipes"
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const equipes = await resposta.json();

            selectMandante.innerHTML =
                '<option value="">Selecione a equipe mandante</option>';

            selectVisitante.innerHTML =
                '<option value="">Selecione a equipe visitante</option>';

            equipes.forEach(equipe => {

                // Opção para equipe mandante
                const opcaoMandante = document.createElement("option");

                opcaoMandante.value = equipe.id;
                opcaoMandante.textContent = equipe.nome;

                selectMandante.appendChild(opcaoMandante);

                // Opção para equipe visitante
                const opcaoVisitante = document.createElement("option");

                opcaoVisitante.value = equipe.id;
                opcaoVisitante.textContent = equipe.nome;

                selectVisitante.appendChild(opcaoVisitante);

            });

        } catch (erro) {

            console.error("Erro ao carregar equipes:", erro);

            selectMandante.innerHTML =
                '<option value="">Erro ao carregar equipes</option>';

            selectVisitante.innerHTML =
                '<option value="">Erro ao carregar equipes</option>';

        }

    }

    // Carrega as equipes ao abrir a página
    carregarEquipes();

    // =========================================
    // VALIDAR EQUIPES DA PARTIDA
    // =========================================

    const selectMandante = document.getElementById(
        "mandante-partida"
    );

    const selectVisitante = document.getElementById(
        "visitante-partida"
    );

    function validarEquipesDiferentes() {

        const mandanteId = selectMandante.value;
        const visitanteId = selectVisitante.value;

        // Remove mensagens anteriores de validação
        selectVisitante.setCustomValidity("");

        // Impede que uma equipe enfrente ela mesma
        if (
            mandanteId &&
            visitanteId &&
            mandanteId === visitanteId
        ) {

            selectVisitante.setCustomValidity(
                "A equipe mandante e a visitante devem ser diferentes."
            );

        }

    }

    // Verifica quando a equipe mandante é alterada
    selectMandante.addEventListener(
        "change",
        validarEquipesDiferentes
    );

    // Verifica quando a equipe visitante é alterada
    selectVisitante.addEventListener(
        "change",
        validarEquipesDiferentes
    );

    // =========================================
    // CARREGAR GRUPOS DO CAMPEONATO SELECIONADO
    // =========================================

    const selectCampeonato = document.getElementById(
        "campeonato-partida"
    );

    const selectGrupo = document.getElementById(
        "grupo-partida"
    );

    async function carregarGrupos(campeonatoId) {

        if (!selectGrupo) return;

        // Limpa os grupos anteriores
        selectGrupo.innerHTML =
            '<option value="">Selecione um grupo</option>';

        if (!campeonatoId) return;

        selectGrupo.innerHTML =
            '<option value="">Carregando grupos...</option>';

        try {

            const resposta = await fetch(
                `http://localhost:8080/api/grupos/campeonato/${campeonatoId}`
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const grupos = await resposta.json();

            selectGrupo.innerHTML =
                '<option value="">Selecione um grupo</option>';

            grupos.forEach(grupo => {

                const opcao = document.createElement("option");

                opcao.value = grupo.id;
                opcao.textContent = grupo.nome;

                selectGrupo.appendChild(opcao);

            });

        } catch (erro) {

            console.error("Erro ao carregar grupos:", erro);

            selectGrupo.innerHTML =
                '<option value="">Erro ao carregar grupos</option>';

        }

    }

    // Atualiza os grupos quando o campeonato muda
    if (selectCampeonato && selectGrupo) {

        selectCampeonato.addEventListener("change", () => {

            carregarGrupos(selectCampeonato.value);

        });

    }

    // =========================================
    // EXIBIR GRUPO SOMENTE NA FASE DE GRUPOS
    // =========================================

    const selectFase = document.getElementById("fase-partida");

    const campoGrupo = document.getElementById(
        "campo-grupo-partida"
    );

    function atualizarVisibilidadeGrupo() {

        if (!selectFase || !campoGrupo || !selectGrupo) return;

        const faseDeGrupos = selectFase.value === "GRUPOS";

        // Exibe ou oculta o campo Grupo
        campoGrupo.style.display = faseDeGrupos ? "" : "none";

        // Grupo é obrigatório apenas na fase de grupos
        selectGrupo.required = faseDeGrupos;

        // Limpa o grupo quando a fase é eliminatória
        if (!faseDeGrupos) {
            selectGrupo.value = "";
        }

    }

    // Atualiza quando o usuário altera a fase
    if (selectFase) {

        selectFase.addEventListener(
            "change",
            atualizarVisibilidadeGrupo
        );

    }

    // Define a visibilidade inicial
    atualizarVisibilidadeGrupo();

    // =========================================
    // FORMATAR DATA PARA O PADRÃO BRASILEIRO
    // =========================================

    function formatarData(data) {

        if (!data) {
            return "-";
        }

        const partes = data.split("-");

        if (partes.length !== 3) {
            return data;
        }

        const [ano, mes, dia] = partes;

        return `${dia}/${mes}/${ano}`;
    }

    // =========================================
    // CARREGAR PARTIDAS CADASTRADAS
    // =========================================

    async function carregarPartidas() {

        const lista = document.getElementById(
            "lista-partidas-admin"
        );

        if (!lista) return;

        lista.innerHTML = `
            <tr>
                <td colspan="9">Carregando partidas...</td>
            </tr>
        `;

        try {

            const resposta = await fetch(
                "http://localhost:8080/api/partidas"
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const partidas = await resposta.json();

            lista.innerHTML = "";

            if (partidas.length === 0) {

                lista.innerHTML = `
                    <tr>
                        <td colspan="9">
                            Nenhuma partida cadastrada.
                        </td>
                    </tr>
                `;

                return;
            }

            partidas.forEach(partida => {

                const linha = document.createElement("tr");

                const statusFormatado = {
                    NAO_INICIADA: "Não iniciada",
                    EM_ANDAMENTO: "Em andamento",
                    FINALIZADA: "Finalizada"
                };

                // Formata o placar da partida
                const placar = (
                    partida.placarMandante != null &&
                    partida.placarVisitante != null
                )
                    ? `${partida.placarMandante} x ${partida.placarVisitante}`
                    : "-";

                const dados = [
                    partida.id,
                    partida.campeonato?.nome ?? "-",
                    partida.mandante?.nome ?? "-",
                    partida.visitante?.nome ?? "-",
                    placar,
                    formatarData(partida.data),
                    partida.hora?.substring(0, 5) ?? "-",
                    statusFormatado[partida.status] ?? partida.status ?? "-"
                ];

                dados.forEach(dado => {

                    const coluna = document.createElement("td");

                    coluna.textContent = dado;

                    linha.appendChild(coluna);

                });

                // Coluna Ações
                // =========================================
                // BOTÕES DE AÇÕES DAS PARTIDAS
                // =========================================

                const colunaAcoes = document.createElement("td");

                // Botão Editar
                const botaoEditar = document.createElement("button");

                botaoEditar.type = "button";
                botaoEditar.textContent = "Editar";
                botaoEditar.className = "btn-editar-partida";
                botaoEditar.dataset.id = partida.id;

                // =========================================
                // PREENCHER FORMULÁRIO PARA EDIÇÃO
                // =========================================

                botaoEditar.addEventListener("click", async () => {

                    // Identifica a partida selecionada
                    partidaEmEdicaoId = partida.id;

                    // Preenche os campos do formulário
                    document.getElementById("campeonato-partida").value =
                        partida.campeonato?.id ?? "";

                    document.getElementById("mandante-partida").value =
                        partida.mandante?.id ?? "";

                    document.getElementById("visitante-partida").value =
                        partida.visitante?.id ?? "";

                    document.getElementById("data-partida").value =
                        partida.data ?? "";

                    document.getElementById("hora-partida").value =
                        partida.hora?.substring(0, 5) ?? "";

                    document.getElementById("rodada-partida").value =
                        partida.rodada ?? "";

                    document.getElementById("fase-partida").value =
                        partida.fase ?? "";

                    // Atualiza a visibilidade do campo Grupo
                    atualizarVisibilidadeGrupo();

                    // Carrega os grupos do campeonato selecionado
                    await carregarGrupos(partida.campeonato?.id);

                    // Seleciona o grupo da partida
                    document.getElementById("grupo-partida").value =
                        partida.grupo?.id ?? "";

                    // Altera o título e o botão do formulário
                    const tituloFormulario = document.querySelector(
                        "#form-partida"
                    )?.previousElementSibling;

                    if (tituloFormulario && tituloFormulario.tagName === "H3") {
                        tituloFormulario.textContent = "Editar partida";
                    }

                    document.getElementById("btn-salvar-partida").textContent =
                        "Salvar alterações";
                    
                    // Mostra o botão Cancelar edição
                    botaoCancelarEdicao.style.display = "inline-block";

                    // Limpa mensagens anteriores
                    mensagemPartida.textContent = "";

                    // Leva o administrador até o formulário
                    formPartida.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                });

                // Botão Excluir
                const botaoExcluir = document.createElement("button");

                botaoExcluir.type = "button";
                botaoExcluir.textContent = "Excluir";
                botaoExcluir.className = "btn-excluir-partida";
                botaoExcluir.dataset.id = partida.id;

                // =========================================
                // EXCLUIR PARTIDA
                // =========================================

                botaoExcluir.addEventListener("click", async () => {

                    const confirmar = confirm(
                        `Deseja realmente excluir a partida ${partida.id}?\n\n` +
                        `${partida.mandante?.nome ?? "Mandante"} x ` +
                        `${partida.visitante?.nome ?? "Visitante"}\n\n` +
                        "Esta ação não poderá ser desfeita."
                    );

                    if (!confirmar) {
                        return;
                    }

                    botaoExcluir.disabled = true;
                    botaoExcluir.textContent = "Excluindo...";

                    try {

                        const resposta = await fetch(
                            `http://localhost:8080/api/partidas/${partida.id}`,
                            {
                                method: "DELETE"
                            }
                        );

                        if (!resposta.ok) {
                            throw new Error(`Erro HTTP: ${resposta.status}`);
                        }

                        alert("Partida excluída com sucesso!");

                        // Atualiza a tabela após a exclusão
                        await carregarPartidas();

                    } catch (erro) {

                        console.error("Erro ao excluir partida:", erro);

                        alert(
                            "Não foi possível excluir a partida. " +
                            "Verifique o console para mais detalhes."
                        );

                    } finally {

                        botaoExcluir.disabled = false;
                        botaoExcluir.textContent = "Excluir";

                    }

                });

                // =========================================
                // BOTÃO REGISTRAR RESULTADO
                // =========================================

                const botaoResultado = document.createElement("button");

                botaoResultado.type = "button";
                botaoResultado.textContent = "Registrar resultado";
                botaoResultado.className = "btn-resultado-partida";
                botaoResultado.dataset.id = partida.id;

                // =========================================
                // ABRIR FORMULÁRIO DE RESULTADO
                // =========================================

                botaoResultado.addEventListener("click", () => {

                    // Localiza os elementos do formulário
                    const cardResultado = document.getElementById(
                        "card-resultado-partida"
                    );

                    const identificacaoPartida = document.getElementById(
                        "identificacao-partida-resultado"
                    );

                    const placarMandante = document.getElementById(
                        "placar-mandante"
                    );

                    const placarVisitante = document.getElementById(
                        "placar-visitante"
                    );

                    const statusResultado = document.getElementById(
                        "status-resultado"
                    );

                    const mensagemResultado = document.getElementById(
                        "mensagem-resultado"
                    );

                    // Guarda o ID da partida selecionada no formulário
                    cardResultado.dataset.partidaId = partida.id;

                    // Identifica as equipes da partida
                    identificacaoPartida.textContent =
                        `${partida.mandante?.nome ?? "Mandante"} x ` +
                        `${partida.visitante?.nome ?? "Visitante"}`;

                    // Preenche os placares atuais
                    placarMandante.value = partida.placarMandante ?? 0;
                    placarVisitante.value = partida.placarVisitante ?? 0;

                    // Seleciona o status atual
                    statusResultado.value = partida.status ?? "";

                    // Limpa mensagens anteriores
                    mensagemResultado.textContent = "";

                    // Exibe o formulário
                    cardResultado.style.display = "block";

                    // Rola a página até o formulário
                    cardResultado.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                });
                
                // Adiciona os botões à coluna
                // Adiciona os botões à coluna
                colunaAcoes.appendChild(botaoEditar);
                colunaAcoes.appendChild(botaoResultado);
                colunaAcoes.appendChild(botaoExcluir);

                // Adiciona a coluna à linha
                linha.appendChild(colunaAcoes);

                lista.appendChild(linha);

            });

        } catch (erro) {

            console.error("Erro ao carregar partidas:", erro);

            lista.innerHTML = `
                <tr>
                    <td colspan="9">
                        Não foi possível carregar as partidas.
                    </td>
                </tr>
            `;

        }

    }

    // =========================================
    // PREPARAR CADASTRO DE PARTIDA
    // =========================================

    const formPartida = document.getElementById("form-partida");
    const mensagemPartida = document.getElementById("mensagem-partida");

    // =========================================
    // CONTROLE DE EDIÇÃO DE PARTIDAS
    // =========================================

    // null = cadastrando uma nova partida
    // número = ID da partida que está sendo editada
    let partidaEmEdicaoId = null;

    // =========================================
    // CANCELAR EDIÇÃO DE PARTIDA
    // =========================================

    const botaoCancelarEdicao = document.getElementById(
        "btn-cancelar-edicao-partida"
    );

    botaoCancelarEdicao.addEventListener("click", () => {

        // Encerra o modo de edição
        partidaEmEdicaoId = null;

        // Limpa o formulário
        formPartida.reset();

        // Limpa a lista de grupos
        selectGrupo.innerHTML =
            '<option value="">Selecione um grupo</option>';

        // Atualiza a visibilidade do campo Grupo
        atualizarVisibilidadeGrupo();

        // Remove possíveis mensagens de validação
        document.getElementById("visitante-partida")
            .setCustomValidity("");

        // Restaura o título do formulário
        const tituloFormulario = formPartida.previousElementSibling;

        if (tituloFormulario && tituloFormulario.tagName === "H3") {
            tituloFormulario.textContent = "Cadastrar nova partida";
        }

        // Restaura o botão principal
        document.getElementById("btn-salvar-partida").textContent =
            "Salvar partida";

        // Oculta o botão Cancelar edição
        botaoCancelarEdicao.style.display = "none";

        // Limpa mensagens anteriores
        mensagemPartida.textContent = "";

    });

    if (formPartida) {

        formPartida.addEventListener("submit", async (event) => {

            // Impede o envio tradicional do formulário
            event.preventDefault();

            // Verifica se mandante e visitante são diferentes
            validarEquipesDiferentes();

            if (!formPartida.reportValidity()) {
                return;
            }

            // Captura os dados preenchidos
            const campeonatoId = Number(
                document.getElementById("campeonato-partida").value
            );

            const mandanteId = Number(
                document.getElementById("mandante-partida").value
            );

            const visitanteId = Number(
                document.getElementById("visitante-partida").value
            );

            const data = document.getElementById("data-partida").value;

            const hora = document.getElementById("hora-partida").value;

            const rodada = Number(
                document.getElementById("rodada-partida").value
            );

            const fase = document.getElementById("fase-partida").value;

            const grupoId = fase === "GRUPOS"
                ? Number(document.getElementById("grupo-partida").value)
                : null;

            // Prepara o objeto que será enviado ao backend
            const novaPartida = {
                campeonatoId,
                mandanteId,
                visitanteId,
                data,
                hora,
                rodada,
                fase,
                grupoId
            };

            // =========================================
            // ENVIAR PARTIDA PARA O BACKEND
            // =========================================

            const botaoSalvar = document.getElementById(
                "btn-salvar-partida"
            );

            botaoSalvar.disabled = true;
            botaoSalvar.textContent = "Salvando...";

            mensagemPartida.textContent = "Enviando partida...";
            mensagemPartida.style.color = "#555";

            try {

                // Verifica se estamos cadastrando ou editando
                const editando = partidaEmEdicaoId !== null;

                // Define o endereço da requisição
                const url = editando
                    ? `http://localhost:8080/api/partidas/${partidaEmEdicaoId}`
                    : "http://localhost:8080/api/partidas";

                // Define o método HTTP
                const metodo = editando ? "PUT" : "POST";

                // Envia os dados ao backend
                const resposta = await fetch(url, {
                    method: metodo,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(novaPartida)
                });

                if (!resposta.ok) {
                    const erro = await resposta.text();
                    throw new Error(
                        `Erro HTTP ${resposta.status}: ${erro}`
                    );
                }

                mensagemPartida.textContent = editando
                    ? "Partida atualizada com sucesso!"
                    : "Partida cadastrada com sucesso!";

                mensagemPartida.style.color = "#198754";

                formPartida.reset();

                // Encerra o modo de edição
                partidaEmEdicaoId = null;

                // Oculta o botão Cancelar edição
                botaoCancelarEdicao.style.display = "none";

                // Restaura o botão
                document.getElementById("btn-salvar-partida").textContent =
                    "Salvar partida";

                // Restaura o título do formulário
                const tituloFormulario = formPartida.previousElementSibling;

                if (tituloFormulario && tituloFormulario.tagName === "H3") {
                    tituloFormulario.textContent = "Cadastrar nova partida";
                }

                // Limpa a lista de grupos após o cadastro
                selectGrupo.innerHTML =
                    '<option value="">Selecione um grupo</option>';

                // Atualiza a visibilidade do campo Grupo
                atualizarVisibilidadeGrupo();

                // Atualiza a tabela de partidas
                await carregarPartidas();

            } catch (erro) {

                console.error("Erro ao cadastrar partida:", erro);

                mensagemPartida.textContent =
                    "Não foi possível cadastrar a partida. Verifique os dados e tente novamente.";

                mensagemPartida.style.color = "#dc3545";

            } finally {

                botaoSalvar.disabled = false;
                botaoSalvar.textContent = "Salvar partida";

            }

        });

    }

    // =========================================
    // CANCELAR REGISTRO DE RESULTADO
    // =========================================

    const botaoCancelarResultado = document.getElementById(
        "btn-cancelar-resultado"
    );

    const cardResultadoPartida = document.getElementById(
        "card-resultado-partida"
    );

    const formResultadoPartida = document.getElementById(
        "form-resultado-partida"
    );

    botaoCancelarResultado.addEventListener("click", () => {

        // Limpa os campos do formulário
        formResultadoPartida.reset();

        // Remove a identificação da partida selecionada
        delete cardResultadoPartida.dataset.partidaId;

        // Limpa o nome das equipes
        document.getElementById(
            "identificacao-partida-resultado"
        ).textContent = "";

        // Limpa mensagens anteriores
        document.getElementById(
            "mensagem-resultado"
        ).textContent = "";

        // Oculta o formulário de resultados
        cardResultadoPartida.style.display = "none";

    });

    // =========================================
    // CAPTURAR E VALIDAR RESULTADO DA PARTIDA
    // =========================================

    formResultadoPartida.addEventListener("submit", async (event) => {

        // Impede o recarregamento da página
        event.preventDefault();

        // Identifica a partida selecionada
        const partidaId = cardResultadoPartida.dataset.partidaId;

        // Captura os dados preenchidos
        const placarMandante = Number(
            document.getElementById("placar-mandante").value
        );

        const placarVisitante = Number(
            document.getElementById("placar-visitante").value
        );

        const status = document.getElementById(
            "status-resultado"
        ).value;

        const mensagem = document.getElementById(
            "mensagem-resultado"
        );

        // Verifica se existe uma partida selecionada
        if (!partidaId) {
            mensagem.textContent = "Nenhuma partida selecionada.";
            return;
        }

        // Valida os placares
        if (
            !Number.isInteger(placarMandante) ||
            !Number.isInteger(placarVisitante) ||
            placarMandante < 0 ||
            placarVisitante < 0
        ) {
            mensagem.textContent = "Informe placares válidos.";
            return;
        }

        // Verifica se o status foi selecionado
        if (!status) {
            mensagem.textContent = "Selecione o status da partida.";
            return;
        }

        // Organiza os dados conforme o ResultadoPartidaDTO
        const resultado = {
            placarMandante: placarMandante,
            placarVisitante: placarVisitante,
            status: status
        };

        // =========================================
        // SALVAR RESULTADO NA API
        // =========================================

        const botaoSalvar = document.getElementById(
            "btn-salvar-resultado"
        );

        botaoSalvar.disabled = true;
        mensagem.textContent = "Salvando resultado...";

        try {

            const resposta = await fetch(
                `http://localhost:8080/api/partidas/${partidaId}/resultado`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(resultado)
                }
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            alert("Resultado registrado com sucesso!");

            // Atualiza a tabela de partidas
            await carregarPartidas();

            // Limpa o formulário
            formResultadoPartida.reset();

            // Remove a partida selecionada
            delete cardResultadoPartida.dataset.partidaId;

            // Fecha o formulário
            cardResultadoPartida.style.display = "none";

            mensagem.textContent = "";

        } catch (erro) {

            console.error("Erro ao registrar resultado:", erro);

            mensagem.textContent =
                "Não foi possível registrar o resultado.";

        } finally {

            botaoSalvar.disabled = false;

        }

    });

    carregarPartidas();

});