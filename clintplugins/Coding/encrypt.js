module.exports = async (context) => {
    const { m } = context;

    const Obf = require("javascript-obfuscator");

    const formatStylishReply = (msg) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    if (m.quoted && m.quoted.text) {
        const forq = m.quoted.text;

        const obfuscationResult = Obf.obfuscate(forq, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 1
        });

        console.log("Successfully encrypted the code");

        m.reply(
`◈━━━━━━━━━━━━━━━━◈
│❒ Código ofuscado com sucesso:
◈━━━━━━━━━━━━━━━━◈

${obfuscationResult.getObfuscatedCode()}

◈━━━━━━━━━━━━━━━━◈
Powered by 9bot.com.br`
        );

    } else {
        m.reply(
            formatStylishReply('Responda uma mensagem contendo um código JavaScript válido para ofuscar.')
        );
    }
};
