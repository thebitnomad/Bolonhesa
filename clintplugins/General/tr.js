const { translate } = require('@vitalets/google-translate-api');

module.exports = {
    name: 'translate',
    aliases: ['tr', 'trans'],
    description: 'Traduz textos para diferentes idiomas.',
    run: async (context) => {
        const { client, m, prefix } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        const fullText = m.body
            .replace(new RegExp(`^${prefix}(translate|tr|trans)\\s*`, 'i'), '')
            .trim();

        if (!fullText && !m.quoted?.text) {
            return client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Como usar o comando de tradução:\n` +
                        `• ${prefix}tr id hello world\n` +
                        `• ${prefix}tr ja Hello how are you?\n` +
                        `• Responda uma mensagem com: ${prefix}tr en`
                    )
                },
                { quoted: m }
            );
        }

        let lang, text;

        if (m.quoted?.text) {
            lang = fullText || 'en';
            text = m.quoted.text;
        } else {
            const parts = fullText.split(' ');
            if (parts.length >= 2 && parts[0].length === 2) {
                lang = parts[0];
                text = parts.slice(1).join(' ');
            } else {
                lang = 'en';
                text = fullText;
            }
        }

        try {
            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `Traduzindo para ${lang.toUpperCase()}... 🔄`
                    )
                },
                { quoted: m }
            );

            const result = await translate(text, { to: lang });

            const languageNames = {
                id: 'Indonésio',
                en: 'Inglês',
                ja: 'Japonês',
                fr: 'Francês',
                es: 'Espanhol',
                de: 'Alemão',
                it: 'Italiano',
                pt: 'Português',
                ru: 'Russo',
                zh: 'Chinês',
                ko: 'Coreano',
                ar: 'Árabe',
                hi: 'Hindi',
                tr: 'Turco',
                nl: 'Holandês',
                sv: 'Sueco',
                pl: 'Polonês',
                th: 'Tailandês',
                vi: 'Vietnamita'
            };

            let fromLang = 'Detecção automática';
            if (result.from && result.from.language && result.from.language.iso) {
                fromLang =
                    languageNames[result.from.language.iso] ||
                    result.from.language.iso.toUpperCase();
            } else if (result.raw && result.raw.src) {
                fromLang =
                    languageNames[result.raw.src] ||
                    result.raw.src.toUpperCase();
            }

            const toLang = languageNames[lang] || lang.toUpperCase();

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `🌐 Resultado da tradução\n\n` +
                        `📥 De: ${fromLang}\n` +
                        `📤 Para: ${toLang}\n\n` +
                        `📝 Texto original:\n${text}\n\n` +
                        `✅ Texto traduzido:\n${result.text}`
                    )
                },
                { quoted: m }
            );
        } catch (error) {
            console.error(
                formatStylishReply(
                    `Ocorreu um erro ao processar a tradução.`
                ),
                error
            );

            let errorMessage = 'A tradução falhou.';
            if (error.message && error.message.includes('Invalid target language')) {
                errorMessage =
                    'O código de idioma é inválido. Use exemplos como: en, id, ja, fr, es, de, pt, etc.';
            } else if (error.message && error.message.includes('Network')) {
                errorMessage =
                    'Houve um problema de conexão com a rede. Tente novamente em alguns instantes.';
            } else if (error.message && error.message.includes('undefined')) {
                errorMessage =
                    'Houve um problema na resposta da API. Tente novamente.';
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
                        `❌ ${errorMessage}\n\n` +
                        `💡 Exemplo de uso:\n` +
                        `${prefix}tr id Hello world\n` +
                        `${prefix}tr ja How are you?\n` +
                        `Responder uma mensagem com: ${prefix}tr en`
                    )
                },
                { quoted: m }
            );
        }
    }
};
