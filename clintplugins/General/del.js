module.exports = {
    name: 'del',
    aliases: ['delete', 'd'],
    description: 'Apaga a mensagem respondida ou citada.',
    run: async (context) => {
        const { client, m, botname } = context;

        const formatStylishReply = (message) => {
            return `◈━━━━━━━━━━━━━━━━◈
│❒ ${message}
◈━━━━━━━━━━━━━━━━◈`;
        };

        if (!botname) {
            console.error(
                formatStylishReply(
                    'Configuração ausente: o nome do bot (botname) não foi definido no contexto.'
                )
            );
            return m.reply(
                formatStylishReply(
                    'Houve um problema na configuração do bot. O nome do bot não está definido no contexto. Peça ao desenvolvedor para corrigir isso.'
                )
            );
        }

        try {
            // Validar m.sender
            if (!m.sender || typeof m.sender !== 'string' || !m.sender.includes('@s.whatsapp.net')) {
                console.error(
                    formatStylishReply(
                        `Remetente inválido em m.sender: ${JSON.stringify(m.sender)}`
                    )
                );
                return m.reply(
                    formatStylishReply(
                        'Não consegui identificar corretamente o seu número. Tente novamente ou verifique a configuração do bot.\n│❒ Ajuda: https://9bot.com.br'
                    )
                );
            }

            const userNumber = m.sender.split('@')[0];
            const botJid = client.user.id.split(':')[0] + '@s.whatsapp.net';
            const isGroup = m.key.remoteJid.endsWith('@g.us');

            // Verificar mensagem respondida ou citada
            let deleteKey = null;
            let quotedSender = null;

            // Tentar via contextInfo (mensagem respondida)
            if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                const contextInfo = m.message.extendedTextMessage.contextInfo;
                if (contextInfo.stanzaId && contextInfo.participant) {
                    deleteKey = {
                        remoteJid: contextInfo.remoteJid || m.key.remoteJid,
                        fromMe: contextInfo.participant === botJid,
                        id: contextInfo.stanzaId,
                        participant: contextInfo.participant
                    };
                    quotedSender = contextInfo.participant;
                }
            }

            // Fallback para m.quoted
            if (!deleteKey && m.quoted && m.quoted.message) {
                deleteKey = {
                    remoteJid: m.quoted.key.remoteJid,
                    fromMe: m.quoted.fromMe,
                    id: m.quoted.key.id,
                    participant: m.quoted.key.participant || m.quoted.sender
                };
                quotedSender = m.quoted.sender;
            }

            // Sem mensagem citada ou respondida
            if (!deleteKey) {
                return m.reply(
                    formatStylishReply(
                        'Para apagar, responda ou cite a mensagem que deseja excluir.'
                    )
                );
            }

            // Em grupos, checar se o bot é admin para apagar mensagens que não são dele
            if (isGroup && !deleteKey.fromMe) {
                const groupMetadata = await client.groupMetadata(m.key.remoteJid);
                const groupAdmins = groupMetadata.participants
                    .filter((p) => p.admin != null)
                    .map((p) => p.id);

                const isBotAdmin = groupAdmins.includes(botJid);

                if (!isBotAdmin) {
                    return m.reply(
                        `◈━━━━━━━━━━━━━━━━◈
│❒ Não tenho permissão de administrador para apagar mensagens nesse grupo.
│❒ Para apagar a mensagem de @${quotedSender.split('@')[0]}, o bot precisa ser administrador.
│❒ @${userNumber}, considere promover o bot a administrador para usar esse comando.
◈━━━━━━━━━━━━━━━━◈`,
                        {
                            mentions: [quotedSender, m.sender]
                        }
                    );
                }
            }

            // Apagar a mensagem
            await client.sendMessage(m.key.remoteJid, { delete: deleteKey });

            await m.reply(
                formatStylishReply(
                    `Mensagem apagada com sucesso, @${userNumber}. 🗑️\n│❒ Comando executado por *${botname}*.`
                ),
                {
                    mentions: [m.sender]
                }
            );
        } catch (error) {
            console.error(
                formatStylishReply(
                    `Erro ao executar o comando del: ${error.stack || error.message}`
                )
            );

            await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um problema ao tentar apagar a mensagem.
│❒ Detalhes: ${error.message || 'Erro desconhecido.'}
│❒ Você pode consultar a documentação em:
│❒ https://9bot.com.br
◈━━━━━━━━━━━━━━━━◈`,
                {
                    mentions: [m.sender]
                }
            );
        }
    }
};
