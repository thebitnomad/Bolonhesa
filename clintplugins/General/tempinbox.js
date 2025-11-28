// tempinbox.js

const fetch = require('node-fetch');

module.exports = async (context) => {
    const { client, m, text } = context;

    const formatStylishReply = (msg) => (
        `◈━━━━━━━━━━━━━━━━◈
│❒ ${msg}
◈━━━━━━━━━━━━━━━━◈`
    );

    if (!text) {
        return m.reply(
            formatStylishReply(
                `Informe o seu *token* para consultar a caixa de entrada.
│❒ Exemplo: *.tempinbox SEU_TOKEN_AQUI*`
            )
        );
    }

    try {
        const url = `https://tempmail.apinepdev.workers.dev/api/getmessage?emaill=${encodeURIComponent(
            text
        )}`;

        const res = await fetch(url);
        const raw = await res.text();

        // API retornando HTML (provavelmente fora do ar)
        if (raw.trim().startsWith('<')) {
            return m.reply(
                formatStylishReply(
                    'A API de TempMail retornou HTML (provavelmente está fora do ar).\n│❒ Tente novamente mais tarde.'
                )
            );
        }

        const data = JSON.parse(raw);

        if (data.error) {
            return m.reply(
                formatStylishReply(`Erro da API: ${data.error}`)
            );
        }

        if (!data.messages || data.messages.length === 0) {
            return m.reply(
                formatStylishReply(
                    'Sua caixa de entrada está vazia ou o token é inválido.'
                )
            );
        }

        for (const msg of data.messages) {
            const parsed = JSON.parse(msg.message || '{}');

            const sender = msg.sender || 'Remetente desconhecido';
            const subject = msg.subject || 'Sem assunto';
            const date = parsed.date
                ? new Date(parsed.date).toLocaleString('pt-BR')
                : 'Data não informada';
            const body = parsed.body || 'Sem conteúdo na mensagem.';

            const out = formatStylishReply(
                `👥 *Remetente:* ${sender}
│❒ 📝 *Assunto:* ${subject}
│❒ 🕜 *Data:* ${date}
│❒ 📩 *Mensagem:*
│❒ ${body}`
            );

            await m.reply(out);
        }
    } catch (err) {
        console.error('TempInbox error:', err);
        return m.reply(
            formatStylishReply(
                'Não foi possível buscar sua caixa de entrada agora.\n│❒ Tente novamente em alguns instantes.'
            )
        );
    }
};
