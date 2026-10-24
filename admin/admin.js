
document.addEventListener("DOMContentLoaded", () => {
    // Guarda o ID do campeonato que está sendo editado
    // null significa que o formulário está no modo de cadastro
    let campeonatoEmEdicaoId = null;
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
        item.addEventListener("click", evento => {

            // Links para outros arquivos HTML devem navegar normalmente
            if (item.getAttribute("href") !== "#") {
                return;
            }

            // Mantém a navegação antiga para seções da mesma página
            evento.preventDefault();
            abrirPagina(item.dataset.pagina);

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
                            botaoSalvar.disabled = false;

                            botaoSalvar.textContent =
                                campeonatoEmEdicaoId !== null
                                    ? "Atualizar campeonato"
                                    : "Salvar campeonato";
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
    
});
