module.exports = async (context) => {
    const { m } = context;

    const { c, cpp, node, python, java } = require('compile-run');

    const formatStylishReply = (msg) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    if (m.quoted && m.quoted.text) {
        const code = m.quoted.text;

        async function runCode() {
            try {
                let result = await python.runSource(code);
                console.log(result);

                if (result.stdout) {
                    m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Saída do programa (Python):
◈━━━━━━━━━━━━━━━━◈

${result.stdout}`
                    );
                }

                if (result.stderr) {
                    m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Erros durante a execução:
◈━━━━━━━━━━━━━━━━◈

${result.stderr}`
                    );
                }

            } catch (err) {
                console.log(err);
                m.reply(
                    formatStylishReply(
                        err.stderr || 'Ocorreu um erro ao executar o código Python.'
                    )
                );
            }
        }

        runCode();

    } else {

        m.reply(
            formatStylishReply(
                'Responda uma mensagem contendo um código Python curto e válido para executar.'
            )
        );

    }
};
