module.exports = async (context) => {
    const { client, m, text } = context;

    try {
        if (!text) {
            return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Eu sou o WormGPT — sem filtros, sem medo e pronto para qualquer pergunta.
│❒ Pergunte o que tiver coragem.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        const query = encodeURIComponent(text.trim());
        const response = await fetch(`https://apiskeith.vercel.app/ai/wormgpt?q=${query}`);

        if (!response.ok) {
            throw new Error(`A API retornou ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.status || !data.result) {
            return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ WormGPT permaneceu em silêncio…
│❒ Nenhuma resposta ecoou do vazio.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        const final = data.result.trim();

        await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta do WormGPT:
◈━━━━━━━━━━━━━━━━◈

${final}

◈━━━━━━━━━━━━━━━━◈`
        );

    } catch (e) {
        console.error("WormGPT Error:", e);
        m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao invocar o WormGPT.
│❒ Detalhes: ${e.message || e}
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
