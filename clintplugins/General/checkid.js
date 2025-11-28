/**
 * Checks and returns the JID of a WhatsApp group or channel from a link.
 * @module checkid
 */
module.exports = {
    name: 'checkid',
    aliases: ['cekid', 'getid', 'id'],
    description: 'Get the JID of a WhatsApp group or channel from its invite link',
    run: async (context) => {
        const { client, m, prefix, botname } = context;

        const formatStylishReply = (body) => {
            return `◈━━━━━━━━━━━━━━━━◈
${body}
◈━━━━━━━━━━━━━━━━◈`;
        };

        /**
         * Fancy font utility
         */
        const toFancyFont = (text, isUpperCase = false) => {
            const fonts = {
                A: '𝘼',
                B: '𝘽',
                C: '𝘾',
                D: '𝘿',
                E: '𝙀',
                F: '𝙁',
                G: '𝙂',
                H: '𝙃',
                I: '𝙄',
                J: '𝙅',
                K: '𝙆',
                L: '𝙇',
                M: '𝙈',
                N: '𝙉',
                O: '𝙊',
                P: '𝙋',
                Q: '𝙌',
                R: '𝙍',
                S: '𝙎',
                T: '𝙏',
                U: '𝙐',
                V: '𝙑',
                W: '𝙒',
                X: '𝙓',
                Y: '𝙔',
                Z: '𝙕',
                a: '𝙖',
                b: '𝙗',
                c: '𝙘',
                d: '𝙙',
                e: '𝙚',
                f: '𝙛',
                g: '𝙜',
                h: '𝙝',
                i: '𝙞',
                j: '𝙟',
                k: '𝙠',
                l: '𝙡',
                m: '𝙢',
                n: '𝙣',
                o: '𝙤',
                p: '𝙥',
                q: '𝙦',
                r: '𝙧',
                s: '𝙨',
                t: '𝙩',
                u: '𝙪',
                v: '𝙫',
                w: '𝙬',
                x: '𝙭',
                y: '𝙮',
                z: '𝙯'
            };
            return (isUpperCase ? text.toUpperCase() : text.toLowerCase())
                .split('')
                .map((char) => fonts[char] || char)
                .join('');
        };

        try {
            /**
             * Extrair link da mensagem
             */
            const text = (m.body || '').trim();
            const linkMatch = text.match(/https?:\/\/(chat\.whatsapp\.com|whatsapp\.com\/channel)\/[^\s]+/i);
            const link = linkMatch ? linkMatch[0] : null;

            if (!link) {
                const body = [
                    `│❒ Ei, @${m.sender.split('@')[0]}, você esqueceu de mandar o link.`,
                    `│❒ Exemplo: ${prefix}checkid https://chat.whatsapp.com/ABC123...`
                ].join('\n');

                return client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(body),
                        mentions: [m.sender]
                    },
                    { quoted: m }
                );
            }

            let url;
            try {
                url = new URL(link);
            } catch {
                const body = [
                    `│❒ Link inválido, @${m.sender.split('@')[0]} 😤`,
                    `│❒ Envie um link válido de grupo ou canal do WhatsApp.`
                ].join('\n');

                return client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(body),
                        mentions: [m.sender]
                    },
                    { quoted: m }
                );
            }

            let id;
            let type;

            /**
             * Tratar links de grupo
             */
            if (url.hostname === 'chat.whatsapp.com' && /^\/[A-Za-z0-9]{20,}$/.test(url.pathname)) {
                const code = url.pathname.replace(/^\/+/, '');
                const res = await client.groupGetInviteInfo(code);
                id = res.id;
                type = 'Grupo';
            }
            /**
             * Tratar links de canal
             */
            else if (url.hostname === 'whatsapp.com' && url.pathname.startsWith('/channel/')) {
                const code = url.pathname.split('/channel/')[1]?.split('/')[0];
                if (!code) throw new Error('Formato de link de canal inválido.');
                const res = await client.newsletterMetadata('invite', code, 'GUEST');
                id = res.id;
                type = 'Canal';
            }
            /**
             * Link não suportado
             */
            else {
                const body = [
                    `│❒ Link não suportado, @${m.sender.split('@')[0]} 😕`,
                    `│❒ Só são aceitos links de grupo ou canal do WhatsApp.`
                ].join('\n');

                return client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(body),
                        mentions: [m.sender]
                    },
                    { quoted: m }
                );
            }

            /**
             * Sucesso: enviar JID
             */
            const successBody = [
                `│❒ *${toFancyFont(type + ' ID encontrada!')}*`,
                `│❒`,
                `│❒ 🔗 *Link*: ${link}`,
                `│❒ 🆔 *JID*: \`${id}\``,
                `│❒ 📌 *Tipo*: ${type}`,
                `│❒`,
                `│❒ Copie o JID acima para usar onde precisar.`,
                `│❒ Powered by *${botname}*`
            ].join('\n');

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(successBody)
                },
                { quoted: m }
            );
        } catch (error) {
            console.error('CheckID command error:', error);

            const body = [
                `│❒ Ocorreu um erro, @${m.sender.split('@')[0]} 😤`,
                `│❒ Detalhes: ${error.message || 'Erro desconhecido.'}`
            ].join('\n');

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(body),
                    mentions: [m.sender]
                },
                { quoted: m }
            );
        }
    }
};
