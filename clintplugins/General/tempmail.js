// tempmail.js

const fetch = require('node-fetch');

module.exports = async (context) => {
    const { client, m } = context;

    const formatStylishReply = (msg) => (
        `◈━━━━━━━━━━━━━━━━◈
│❒ ${msg}
◈━━━━━━━━━━━━━━━━◈`
    );

    try {
        const res = await fetch('https://tempmail.apinepdev.workers.dev/api/gen');
        const raw = await res.text();

        // Detecta resposta em HTML (API fora do ar / erro Cloudflare)
        if (raw.trim().startsWith('<')) {
            return m.reply(
                formatStylishReply(
                    'A API de TempMail retornou HTML (provavelmente está fora do ar).\n│❒ Tente novamente mais tarde.'
                )
            );
        }

        const data = JSON.parse(raw || '{}');

        if (!data.email || !data.token) {
            return m.reply(
                formatStylishReply(
                    'Não foi possível gerar o e-mail temporário.\n│❒ Tente novamente.'
                )
            );
        }

        const email = data.email;
        const token = data.token;

        await m.reply(
            formatStylishReply(
                `Seu e-mail temporário foi criado:\n│❒ 📧 *${email}*`
            )
        );

        // Envia o token em uma mensagem separada
        const msg = await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    `Este é o seu *TOKEN* de acesso:\n│❒ ${token}`
                )
            },
            { quoted: m }
        );

        // Explica como usar o token com o comando tempinbox
        await client.sendMessage(
            m.chat,
            {
                text: formatStylishReply(
                    `O texto citado acima é o seu *TOKEN*.\n│❒ Use assim:\n│❒ *.tempinbox ${token}*\n│❒ para buscar as mensagens da sua caixa de entrada.`
                )
            },
            { quoted: msg }
        );
    } catch (err) {
        console.error('TempMail error:', err);
        return m.reply(
            formatStylishReply(
                'Ocorreu um erro ao falar com a API de TempMail.\n│❒ Tente novamente em alguns instantes.'
            )
        );
    }
};
