const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {

        const { client, m, text } = context;

        const formatReply = (msg) => 
            `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;

        try {

            if (!text) {
                return m.reply(
                    formatReply("Nenhum comando informado. Por favor, forneça um comando de terminal válido.")
                );
            }

            const { exec } = require("child_process");

            exec(text, (err, stdout, stderr) => {

                if (err) {
                    return m.reply(
                        formatReply(`Erro ao executar o comando:\n${err.message}`)
                    );
                }

                if (stderr) {
                    return m.reply(
                        formatReply(`Stderr:\n${stderr}`)
                    );
                }

                if (stdout) {
                    return m.reply(
                        formatReply(`Resultado:\n${stdout}`)
                    );
                }
            });

        } catch (error) {
            await m.reply(
                formatReply(`Ocorreu um erro ao executar o comando:\n${error}`)
            );
        }

    });
};
