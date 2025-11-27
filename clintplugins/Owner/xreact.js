const fetch = require('node-fetch');

module.exports = {
    name: 'xreact',
    aliases: ['engagement', 'autoreact', 'whatsappreact'],
    description: 'Reage automaticamente a posts de canais do WhatsApp',
    run: async (context) => {
        const { client, m, prefix } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
        };

        // Extrair argumentos
        const args = m.body.replace(new RegExp(`^${prefix}(xreact|engagement|autoreact|whatsappreact)\\s*`, 'i'), '').trim();
        
        if (!args) {
            return client.sendMessage(m.chat, {
                text: formatStylishReply(
                    `Informe o link e os emojis!\n\n` +
                    `Uso:\n${prefix}xreact https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19/1731 ❤️,😘,👍\n\n` +
                    `Formato: ${prefix}xreact <link_com_id_da_mensagem> <emojis>`
                )
            }, { quoted: m });
        }

        // Separar link dos emojis
        const firstSpaceIndex = args.indexOf(' ');
        if (firstSpaceIndex === -1) {
            return client.sendMessage(m.chat, {
                text: formatStylishReply(
                    `Formato inválido! Forneça o link + emojis.\n\nExemplo:\n${prefix}xreact https://whatsapp.com/channel/0029VagJlnG6xCSU2tS1Vz19/1731 ❤️,😘,👍`
                )
            }, { quoted: m });
        }

        let link = args.substring(0, firstSpaceIndex).trim();
        const emojis = args.substring(firstSpaceIndex + 1).trim();

        // Corrigir protocolo
        if (!link.startsWith('http')) {
            link = 'https://' + link;
        }

        // Validar link de canal com ID de mensagem
        if (!link.includes('whatsapp.com/channel/') || !link.match(/\/\d+$/)) {
            return client.sendMessage(m.chat, {
                text: formatStylishReply(
                    `Link inválido!\n\nO link deve terminar com o ID da mensagem.\nExemplo:\n${prefix}xreact https://whatsapp.com/channel/xxxx/1234 ❤️,🔥,👍`
                )
            }, { quoted: m });
        }

        if (!emojis) {
            return client.sendMessage(m.chat, {
                text: formatStylishReply(`Faltaram os emojis!\n\nExemplo:\n${prefix}xreact ${link} 😂,🔥,❤️`)
            }, { quoted: m });
        }

        try {
            // Mensagem de carregamento
            const loadingMsg = await client.sendMessage(m.chat, {
                text: formatStylishReply(
                    `Enviando reações... ⚡\n` +
                    `Link: ${link}\n` +
                    `Emojis: ${emojis}\n` +
                    `Aguarde um momento...`
                )
            }, { quoted: m });

            const apiUrl = `https://obito-mr-apis.vercel.app/api/tools/like_whatssap?link=${encodeURIComponent(link)}&emoji=${encodeURIComponent(emojis)}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                throw new Error(`API retornou status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Falha na resposta da API');
            }

            // Apagar mensagem de carregamento
            await client.sendMessage(m.chat, { delete: loadingMsg.key });

            await client.sendMessage(m.chat, {
                text: formatStylishReply(
                    `✅ Reações enviadas com sucesso!\n\n` +
                    `📌 *Canal*: ${data.channel_link}\n` +
                    `🎭 *Emojis usados*: ${data.emoji}\n` +
                    `⚡ *Engajamento gerado*: +1.1k\n\n` +
                    `> Powered by Toxic-MD`
                )
            }, { quoted: m });

        } catch (error) {
            console.error('XReact error:', error);

            // Tentar apagar loading
            try {
                await client.sendMessage(m.chat, { delete: loadingMsg.key });
            } catch {}

            let errorMessage = 'Erro inesperado.';

            if (error.message.includes('status')) {
                errorMessage = 'A API de engajamento não respondeu.';
            } else if (error.message.includes('Network')) {
                errorMessage = 'Falha de rede. Verifique sua conexão.';
            } else if (error.message.includes('API')) {
                errorMessage = 'A API de engajamento falhou.';
            } else {
                errorMessage = error.message;
            }

            await client.sendMessage(m.chat, {
                text: formatStylishReply(
                    `❌ Falha ao enviar reações!\n\n` +
                    `📎 Erro: ${errorMessage}\n\n` +
                    `💡 Dicas:\n` +
                    `• Certifique-se de que o link contém o ID da mensagem (/12345)\n` +
                    `• Separe os emojis com vírgulas\n` +
                    `• O canal deve ser público\n` +
                    `• O limite da API pode ter sido atingido (200/dia)`
                )
            }, { quoted: m });
        }
    }
};
