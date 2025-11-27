module.exports = async (context) => {
    const { client, m, text, botname, fetchJson } = context;

    if (!text) {
        return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Você precisa informar um texto ou uma consulta.
│❒ Esta IA irá pesquisar no Google e gerar um resumo.
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    try {
        const data = await fetchJson(`https://api.dreaded.site/api/aisearch?query=${text}`);

        if (data && data.result) {
            const res = data.result;
            await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Resultado da sua pesquisa:
◈━━━━━━━━━━━━━━━━◈

${res}

◈━━━━━━━━━━━━━━━━◈
Powered by *${botname}*`
            );
        } else {
            m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ A resposta da API não é válida.
│❒ Tente novamente em instantes.
◈━━━━━━━━━━━━━━━━◈`
            );
        }
    } catch (error) {
        m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao conectar com a API.
│❒ Tente novamente mais tarde.
│❒ Detalhes: ${error}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
