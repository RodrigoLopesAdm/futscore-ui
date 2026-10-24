document.addEventListener("DOMContentLoaded", () => {

    // Guarda o ID do atleta que está sendo editado.
    // null significa que estamos cadastrando um novo atleta.
    let atletaEmEdicaoId = null;

    console.log("Módulo de Atletas FutScore carregado!");

        // =========================================
        // CARREGAR EQUIPES NO FORMULÁRIO DE ATLETAS
        // =========================================

        async function carregarEquipes() {

            const selectEquipe = document.getElementById("equipe-atleta");

            if (!selectEquipe) {
                return;
            }

            selectEquipe.innerHTML =
                '<option value="">Carregando equipes...</option>';

            try {

                const resposta = await fetch(
                    "http://localhost:8080/api/equipes"
                );

                if (!resposta.ok) {
                    throw new Error("Erro HTTP: " + resposta.status);
                }

                const equipes = await resposta.json();

                selectEquipe.innerHTML =
                    '<option value="">Selecione uma equipe</option>';

                equipes.forEach(equipe => {

                    const opcao = document.createElement("option");

                    opcao.value = equipe.id;
                    opcao.textContent = equipe.nome;

                    selectEquipe.appendChild(opcao);

                });

            } catch (erro) {

                console.error("Erro ao carregar equipes:", erro);

                selectEquipe.innerHTML =
                    '<option value="">Erro ao carregar equipes</option>';

            }
        }

    // Carrega as equipes ao abrir a página
    carregarEquipes();

    // =========================================
    // CARREGAR ATLETAS DA API
    // =========================================

    async function carregarAtletas() {

        const lista = document.getElementById(
            "lista-atletas-admin"
        );

        if (!lista) {
            return;
        }

        lista.innerHTML = `
            <tr>
                <td colspan="7">Carregando atletas...</td>
            </tr>
        `;

        try {

            const resposta = await fetch(
                "http://localhost:8080/api/atletas"
            );

            if (!resposta.ok) {
                throw new Error("Erro HTTP: " + resposta.status);
            }

            const atletas = await resposta.json();

            lista.innerHTML = "";

            if (atletas.length === 0) {
                lista.innerHTML = `
                    <tr>
                        <td colspan="7">
                            Nenhum atleta cadastrado.
                        </td>
                    </tr>
                `;
                return;
            }

            atletas.forEach(atleta => {

                const linha = document.createElement("tr");

                const dados = [
                    atleta.id,
                    atleta.nome,
                    atleta.posicao,
                    atleta.numero,
                    atleta.dataNascimento,
                    atleta.equipe?.nome ?? "-"
                ];

                dados.forEach(dado => {

                    const coluna = document.createElement("td");
                    coluna.textContent = dado ?? "-";
                    linha.appendChild(coluna);

                });

                    // =========================================
                    // BOTÃO EDITAR ATLETA
                    // =========================================

                    const colunaAcoes = document.createElement("td");

                    const botaoEditar = document.createElement("button");

                    botaoEditar.type = "button";
                    botaoEditar.textContent = "Editar";
                    botaoEditar.classList.add("btn-editar");

                    botaoEditar.addEventListener("click", () => {

                        // Guarda o ID do atleta selecionado
                        atletaEmEdicaoId = atleta.id;

                        // Preenche os campos do formulário
                        document.getElementById("nome-atleta").value =
                            atleta.nome ?? "";

                        document.getElementById("posicao-atleta").value =
                            atleta.posicao ?? "";

                        document.getElementById("numero-atleta").value =
                            atleta.numero ?? "";

                        document.getElementById("nascimento-atleta").value =
                            atleta.dataNascimento ?? "";

                        document.getElementById("equipe-atleta").value =
                            atleta.equipe?.id ?? "";

                        // Altera o texto do botão principal
                        document.querySelector(
                            "#form-atleta .btn-salvar"
                        ).textContent = "Atualizar atleta";

                        // Exibe o botão Cancelar edição
                        document.getElementById(
                            "btn-cancelar-edicao-atleta"
                        ).style.display = "inline-block";

                        // Leva o usuário até o formulário
                        document.getElementById("form-atleta").scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    });

                    // Adiciona o botão Editar à coluna Ações
                    colunaAcoes.appendChild(botaoEditar);

                    // =========================================
                    // BOTÃO EXCLUIR ATLETA
                    // =========================================

                    const botaoExcluir = document.createElement("button");

                    botaoExcluir.type = "button";
                    botaoExcluir.textContent = "Excluir";
                    botaoExcluir.classList.add("btn-excluir");

                    botaoExcluir.style.marginLeft = "8px";

                    botaoExcluir.addEventListener("click", async () => {

                        const confirmarExclusao = confirm(
                            `Deseja realmente excluir o atleta ${atleta.nome}?`
                        );

                        if (!confirmarExclusao) {
                            return;
                        }

                        // Evita vários cliques durante a exclusão
                        botaoExcluir.disabled = true;
                        botaoExcluir.textContent = "Excluindo...";

                        try {

                            const resposta = await fetch(
                                `http://localhost:8080/api/atletas/${atleta.id}`,
                                {
                                    method: "DELETE"
                                }
                            );

                            if (!resposta.ok) {
                                throw new Error("Erro HTTP: " + resposta.status);
                            }

                            alert("Atleta excluído com sucesso!");

                            // Atualiza a tabela após a exclusão
                            await carregarAtletas();

                        } catch (erro) {

                            console.error("Erro ao excluir atleta:", erro);

                            alert(
                                "Não foi possível excluir o atleta. Verifique se a API está funcionando."
                            );

                        } finally {

                            botaoExcluir.disabled = false;
                            botaoExcluir.textContent = "Excluir";

                        }

                    });

                    colunaAcoes.appendChild(botaoExcluir);

                    // Adiciona a coluna à linha da tabela
                    linha.appendChild(colunaAcoes);

                    // Adiciona a linha à tabela
                    lista.appendChild(linha);

            });

        } catch (erro) {

            console.error("Erro ao carregar atletas:", erro);

            lista.innerHTML = `
                <tr>
                    <td colspan="7">
                        Não foi possível carregar os atletas.
                    </td>
                </tr>
            `;
        }
    }

    // Carrega os atletas ao abrir a página
    carregarAtletas();

    // =========================================
    // FORMULÁRIO DE CADASTRO DE ATLETAS
    // =========================================

    const formularioAtleta = document.getElementById("form-atleta");

    const mensagemAtleta = document.getElementById("mensagem-atleta");

    if (formularioAtleta && mensagemAtleta) {

        formularioAtleta.addEventListener("submit", async (evento) => {

            evento.preventDefault();

            const nome = document.getElementById("nome-atleta").value.trim();

            const posicao = document.getElementById("posicao-atleta").value;

            const numero = Number(
                document.getElementById("numero-atleta").value
            );

            const dataNascimento = document.getElementById(
                "nascimento-atleta"
            ).value;

            const equipeId = Number(
                document.getElementById("equipe-atleta").value
            );

            const novoAtleta = {
                nome: nome,
                posicao: posicao,
                numero: numero,
                dataNascimento: dataNascimento,
                equipeId: equipeId
            };

            const botaoSalvar = formularioAtleta.querySelector(
                'button[type="submit"]'
            );

            botaoSalvar.disabled = true;
            botaoSalvar.textContent = "Salvando...";

            try {

                // Verifica se estamos cadastrando ou editando
                const modoEdicao = atletaEmEdicaoId !== null;

                // Define a URL conforme a operação
                const urlAtleta = modoEdicao
                    ? `http://localhost:8080/api/atletas/${atletaEmEdicaoId}`
                    : "http://localhost:8080/api/atletas";

                // Define o método HTTP
                const metodoHttp = modoEdicao ? "PUT" : "POST";

                const resposta = await fetch(
                    urlAtleta,
                    {
                        method: metodoHttp,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(novoAtleta)
                    }
                );

                if (!resposta.ok) {
                    throw new Error("Erro HTTP: " + resposta.status);
                }

                // Exibe a mensagem conforme a operação realizada
                mensagemAtleta.textContent = modoEdicao
                    ? "Atleta atualizado com sucesso!"
                    : "Atleta cadastrado com sucesso!";

                mensagemAtleta.style.color = "#16a34a";

                // Limpa os campos do formulário
                formularioAtleta.reset();

                // Encerra o modo de edição
                atletaEmEdicaoId = null;

                // Oculta o botão Cancelar edição
                const botaoCancelar = document.getElementById(
                    "btn-cancelar-edicao-atleta"
                );

                if (botaoCancelar) {
                    botaoCancelar.style.display = "none";
                }

                // Atualiza a tabela de atletas
                await carregarAtletas();

            } catch (erro) {

                console.error("Erro ao cadastrar atleta:", erro);

                mensagemAtleta.textContent =
                    "Não foi possível cadastrar o atleta.";

                mensagemAtleta.style.color = "#dc2626";

            } finally {

                botaoSalvar.disabled = false;
                botaoSalvar.textContent = "Salvar atleta";

            }

        });

    }

    // =========================================
    // CANCELAR EDIÇÃO DE ATLETA
    // =========================================

    const botaoCancelarEdicao = document.getElementById(
        "btn-cancelar-edicao-atleta"
    );

    if (botaoCancelarEdicao) {

        botaoCancelarEdicao.addEventListener("click", () => {

            // Encerra o modo de edição
            atletaEmEdicaoId = null;

            // Limpa os campos do formulário
            formularioAtleta.reset();

            // Restaura o botão principal
            formularioAtleta.querySelector(
                'button[type="submit"]'
            ).textContent = "Salvar atleta";

            // Oculta o botão Cancelar edição
            botaoCancelarEdicao.style.display = "none";

            // Limpa mensagens anteriores
            mensagemAtleta.textContent = "";

        });

    }

});