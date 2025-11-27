const axios = require("axios");

module.exports = async (context) => {
    const { client, m, text, botname } = context;

    if (!text) {
        return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Uso incorreto.
│❒ Exemplo:
│❒ .codegen Função para calcular área de um triângulo | Python
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    let [prompt, language] = text.split("|").map(v => v.trim());

    if (!prompt || !language) {
        return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Formato inválido!
│❒ Use:
│❒ .codegen <prompt> | <linguagem>
│❒ Exemplo:
│❒ .codegen Verificar número primo | JavaScript
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    try {
        const payload = {
            customInstructions: prompt,
            outputLang: language
        };

        const { data } = await axios.post(
            "https://www.codeconvert.ai/api/generate-code",
            payload
        );

        if (!data || typeof data !== "string") {
            return m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível obter o código da API.
◈━━━━━━━━━━━━━━━━◈`
            );
        }

        await m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Código gerado em *${language}*:
◈━━━━━━━━━━━━━━━━◈

\`\`\`${language.toLowerCase()}
${data.trim()}
\`\`\`

◈━━━━━━━━━━━━━━━━◈
Powered by *${botname}*`
        );

    } catch (error) {
        console.error(error);
        m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao processar sua solicitação.
│❒ Tente novamente em instantes.
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
