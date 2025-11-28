const fs = require('fs');
const path = require('path');

module.exports = async (context) => {
    const { client, m, prefix } = context;

    const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
    };

    const toFancyFont = (text, isUpperCase = false) => {
        const fonts = {
            A: '𝘼', B: '𝘽', C: '𝘾', D: '𝘿', E: '𝙀', F: '𝙁', G: '𝙂', H: '𝙃', I: '𝙄', J: '𝙅', K: '𝙆', L: '𝙇', M: '𝙈',
            N: '𝙉', O: '𝙊', P: '𝙋', Q: '𝙌', R: '𝙍', S: '𝙎', T: '𝙏', U: '𝙐', V: '𝙑', W: '𝙒', X: '𝙓', Y: '𝙔', Z: '𝙕',
            a: '𝙖', b: '𝙗', c: '𝙘', d: '𝙙', e: '𝙚', f: '𝙛', g: '𝙜', h: '𝙝', i: '𝙞', j: '𝙟', k: '𝙠', l: '𝙡', m: '𝙢',
            n: '𝙣', o: '𝙤', p: '𝙥', q: '𝙦', r: '𝙧', s: '𝙨', t: '𝙩', u: '𝙪', v: '𝙫', w: '𝙬', x: '𝙭', y: '𝙮', z: '𝙯'
        };

        const base = isUpperCase ? text.toUpperCase() : text.toLowerCase();
        return base
            .split('')
            .map((char) => fonts[char] || char)
            .join('');
    };

    try {
        const possibleAudioPaths = [
            path.join(__dirname, 'xh_clinton', 'bot.mp3'),
            path.join(process.cwd(), 'xh_clinton', 'bot.mp3'),
            path.join(__dirname, '..', 'xh_clinton', 'bot.mp3')
        ];

        let audioPath = null;

        for (const possiblePath of possibleAudioPaths) {
            if (fs.existsSync(possiblePath)) {
                audioPath = possiblePath;
                break;
            }
        }

        if (!audioPath) {
            console.error(
                formatStylishReply(
                    'Arquivo de áudio bot.mp3 não foi encontrado em nenhum dos caminhos configurados.'
                )
            );

            return client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Ei, ${m.pushName}, não consegui localizar o arquivo *bot.mp3*.\n│❒ Verifique se o arquivo existe na pasta xh_clinton e tente novamente.`
                    )
                },
                { quoted: m }
            );
        }

        console.log(
            formatStylishReply(
                `Arquivo de áudio encontrado em: ${audioPath}`
            )
        );

        // Enviar áudio como nota de voz (PTT)
        await client.sendMessage(
            m.chat,
            {
                audio: { url: audioPath },
                ptt: true,
                mimetype: 'audio/mpeg',
                fileName: 'bot.mp3'
            },
            { quoted: m }
        );

        // Mensagem com botão para .repo
        const repoText = formatStylishReply(
            `Toque no botão abaixo para visualizar o repositório, ${m.pushName}. 😄`
        );

        await client.sendMessage(
            m.chat,
            {
                text: repoText,
                footer: 'Powered by 9bot.com.br',
                buttons: [
                    {
                        buttonId: `${prefix}repo`,
                        buttonText: { displayText: `📖 ${toFancyFont('REPO', true)}` },
                        type: 1
                    }
                ],
                headerType: 1,
                viewOnce: true
            },
            { quoted: m }
        );
    } catch (error) {
        console.error(
            formatStylishReply(
                `Erro ao executar o comando de áudio do bot: ${error.message}`
            )
        );

        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    `Opa, algo deu errado ao tentar enviar o áudio, ${m.pushName}.\n│❒ Tente novamente em alguns instantes.`
                )
            },
            { quoted: m }
        );
    }
};
