const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
  await middleware(context, async () => {
    const { client, m, isBotAdmin, isAdmin } = context;

    const formatStylishReply = (message) => {
      const lines = String(message || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const body = lines.map((l) => `│❒ ${l}`).join('\n');
      return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    if (!m.isGroup) {
      return m.reply(
        formatStylishReply(
          `Este comando só pode ser usado em grupos.\n` +
          `Use-o em um grupo para gerenciar as solicitações de entrada.`
        )
      );
    }

    if (!isAdmin) {
      return m.reply(
        formatStylishReply(
          `Apenas administradores podem gerenciar as solicitações de entrada do grupo.`
        )
      );
    }

    if (!isBotAdmin) {
      return m.reply(
        formatStylishReply(
          `Não tenho permissões de administrador neste grupo.\n` +
          `Defina o bot como administrador e tente novamente.`
        )
      );
    }

    try {
      const responseList = await client.groupRequestParticipantsList(m.chat);

      if (!responseList || responseList.length === 0) {
        return m.reply(
          formatStylishReply(
            `Não há solicitações pendentes de participação neste grupo no momento.`
          )
        );
      }

      for (const participant of responseList) {
        try {
          const response = await client.groupRequestParticipantsUpdate(
            m.chat,
            [participant.jid],
            'reject'
          );

          console.log(
            formatStylishReply(
              `Solicitação de entrada rejeitada para: ${participant.jid}`
            ),
            response
          );
        } catch (error) {
          console.error(
            formatStylishReply(
              `Erro ao rejeitar a solicitação de: ${participant.jid}`
            ),
            error
          );

          return m.reply(
            formatStylishReply(
              `Não foi possível rejeitar a solicitação de @${participant.jid.split('@')[0]}.\n` +
              `Verifique as configurações do grupo e tente novamente.`
            ),
            { mentions: [participant.jid] }
          );
        }
      }

      m.reply(
        formatStylishReply(
          `Todas as solicitações pendentes de entrada foram rejeitadas com sucesso.\n` +
          `Se precisar, você pode ajustar as configurações de privacidade do grupo para reduzir novas solicitações.`
        )
      );
    } catch (error) {
      console.error(
        formatStylishReply(
          `Erro ao listar ou rejeitar as solicitações de entrada do grupo.`
        ),
        error
      );

      m.reply(
        formatStylishReply(
          `Não foi possível processar as solicitações de entrada neste momento.\n` +
          `Tente novamente em alguns instantes.`
        )
      );
    }
  });
};
