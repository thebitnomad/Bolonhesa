module.exports = async (context) => {
    const { client, m, text, botname, fetchJson, prefix } = context;
    const num = m.sender; 

    if (!text) {
        return m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Você precisa informar uma linguagem e um prompt.
│❒ Uso correto: *${prefix}aicode <linguagem> <prompt>*
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    const [language, ...promptArr] = text.split(' ');
    const prompt = promptArr.join(' ');

    if (!language || !prompt) {
        return m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Informe a *linguagem* e o *prompt*.
│❒ Exemplo: *${prefix}aicode python "Crie um programa Hello World"*
◈━━━━━━━━━━━━━━━━◈`
        );
    }

    try {
        const response = await fetchJson(
            `https://api.dreaded.site/api/aicode?prompt=${encodeURIComponent(prompt)}&language=${language.toLowerCase()}`
        );

        if (response.success) {
            const { code, language } = response.result;

            m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Aqui está seu código em *${language}*:
◈━━━━━━━━━━━━━━━━◈

${code}

◈━━━━━━━━━━━━━━━━◈
Powered by *${botname}*`
            );

        } else {
            m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Não consegui gerar o código.
│❒ Verifique o prompt e a linguagem informada.
◈━━━━━━━━━━━━━━━━◈`
            );
        }
    } catch (error) {
        console.error(error);
        m.reply(
            `◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao buscar o código.
│❒ Tente novamente em instantes.
◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
