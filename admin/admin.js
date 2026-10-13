
document.addEventListener("DOMContentLoaded", () => {

    // Seleciona os itens do menu
    const itensMenu = document.querySelectorAll(".menu-item");

    // Seleciona as seções do painel
    const paginas = document.querySelectorAll(".pagina");

    // Função responsável pela navegação
    function abrirPagina(nomePagina) {

        // Remove a seleção de todos os menus
        itensMenu.forEach(item => {
            item.classList.remove("ativo");
        });

        // Esconde todas as páginas
        paginas.forEach(pagina => {
            pagina.classList.remove("ativa");
        });

        // Seleciona o menu correspondente
        const menuSelecionado = document.querySelector(
            `.menu-item[data-pagina="${nomePagina}"]`
        );

        // Seleciona a página correspondente
        const paginaSelecionada = document.getElementById(
            `pagina-${nomePagina}`
        );

        // Ativa o menu e exibe a página
        if (menuSelecionado && paginaSelecionada) {

            menuSelecionado.classList.add("ativo");

            paginaSelecionada.classList.add("ativa");
        }
    }

    // Adiciona os eventos de clique
    itensMenu.forEach(item => {

        item.addEventListener("click", (evento) => {

            // Evita o comportamento padrão do link
            evento.preventDefault();

            // Identifica qual página foi selecionada
            const nomePagina = item.dataset.pagina;

            // Abre a página correspondente
            abrirPagina(nomePagina);
        });
    });

    console.log("Painel administrativo FutScore carregado!");

    
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

    // Executa a consulta ao abrir o painel
    carregarCampeonatos();

    
    // =========================================
    // CADASTRAR NOVO CAMPEONATO
    // =========================================

    const formularioCampeonato =
        document.getElementById("form-campeonato");

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

                const novoCampeonato = {
                    nome: nome,
                    ano: ano,
                    regulamento: regulamento,
                    dataInicio: dataInicio,
                    dataFim: dataFim
                };

                botaoSalvar.disabled = true;
                botaoSalvar.textContent = "Salvando...";

                mensagemCampeonato.textContent =
                    "Cadastrando campeonato...";

                mensagemCampeonato.style.color = "#64748b";

                try {

                    const resposta = await fetch(
                        "http://localhost:8080/api/campeonatos",
                        {
                            method: "POST",
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
