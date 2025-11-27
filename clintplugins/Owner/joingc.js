const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, args, Owner, botname } = context;

        // Verificações básicas de contexto
        if (!botname) {
            console.error(`Join-Error: botname missing in context.`);
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│❒ Bot sem identificação. (botname ausente no contexto)\n` +
                `│❒ Por favor, revise as configurações.\n` +
                `◈━━━━━━━━━━━━━━━━◈`
            );
        }

        if (!Owner) {
            console.error(`Join-Error: Owner missing in context.`);
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│❒ Informação do proprietário ausente.\n` +
                `│❒ Verifique a configuração do dono do bot.\n` +
                `◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // Aceita link do texto, mensagem respondida ou comando
        let raw =
            (text && text.trim()) ||
            (m.quoted && (m.quoted.text || m.quoted.caption)) ||
            "";
        raw = String(raw || "").trim();

        if (!raw) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│❒ Envie um link de convite válido ou responda a um.\n` +
                `│❒ Exemplo: *${args && args[0] ? args[0] : '.join https://chat.whatsapp.com/abcdef...'}*\n` +
                `◈━━━━━━━━━━━━━━━━◈`
            );
        }

        // Extrai o código do convite
        const urlRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i;
        const match = raw.match(urlRegex);
        let inviteCode = match ? match[1] : null;

        // Caso o usuário envie apenas o código
        if (!inviteCode) {
            const token = raw.split(/\s+/)[0];
            if (/^[A-Za-z0-9_-]{8,}$/.test(token)) {
                inviteCode = token;
            }
        }

        if (!inviteCode) {
            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│❒ Não foi possível identificar um link ou código válido.\n` +
                `◈━━━━━━━━━━━━━━━━◈`
            );
        }

        inviteCode = inviteCode.replace(/\?.*$/, '').trim(); // Remove query params

        try {
            // Obtém informações do grupo
            const info = await client.groupGetInviteInfo(inviteCode);
            const subject = info?.subject || info?.groupMetadata?.subject || "Grupo desconhecido";

            // Aceitar convite
            await client.groupAcceptInvite(inviteCode);

            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│❒ ✅ Entrei no grupo: *${subject}*\n` +
                `│❒ ${botname} agora está ativo no grupo.\n` +
                `◈━━━━━━━━━━━━━━━━◈`
            );

        } catch (error) {
            console.error(`[JOIN-ERROR] invite=${inviteCode}`, error && (error.stack || error));

            const status =
                (error && error.output && error.output.statusCode) ||
                error?.statusCode ||
                error?.status ||
                (error?.data && (error.data.status || error.data)) ||
                (error?.response && error.response.status) ||
                null;

            // Tratamento por status
            if (status === 400 || status === 404) {
                return m.reply(
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ ❌ O grupo não existe ou o link é inválido.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
                );
            }

            if (status === 401) {
                return m.reply(
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ 🚫 Já fui removido desse grupo anteriormente.\n` +
                    `│❒ Não posso entrar novamente com esse link.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
                );
            }

            if (status === 409) {
                return m.reply(
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ 🤨 Eu já estou neste grupo.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
                );
            }

            if (status === 410) {
                return m.reply(
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ 🔄 Este convite foi redefinido ou expirou.\n` +
                    `│❒ Solicite um novo link de convite.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
                );
            }

            if (status === 403) {
                return m.reply(
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ 🔒 Não tenho permissão para entrar neste grupo.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
                );
            }

            if (status === 500) {
                return m.reply(
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ 📛 O grupo está cheio ou ocorreu um erro no servidor.\n` +
                    `│❒ Tente novamente mais tarde.\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
                );
            }

            // Erro genérico
            const shortMsg =
                (error &&
                    (error.message ||
                        (typeof error === "string" ? error : "Erro desconhecido"))) ||
                "Erro desconhecido";

            return m.reply(
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│❒ 💀 Não foi possível entrar no grupo.\n` +
                `│❒ Detalhes: ${shortMsg}\n` +
                `◈━━━━━━━━━━━━━━━━◈`
            );
        }
    });
};
