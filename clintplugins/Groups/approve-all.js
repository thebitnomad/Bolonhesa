module.exports = async (context) => {
  const { client, m, chatUpdate, store, isBotAdmin, isAdmin } = context;

  const formatStylishReply = (message) => {
    return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
  };

  if (!m.isGroup) {
    return m.reply(
      formatStylishReply(
        `Este comando só pode ser utilizado em grupos.`
      )
    );
  }

  if (!isAdmin) {
    return m.reply(
      formatStylishReply(
        `Você precisa ser administrador do grupo para usar este comando.`
      )
    );
  }

  if (!isBotAdmin) {
    return m.reply(
      formatStylishReply(
        `Não tenho permissão de administrador neste grupo.\n` +
        `Defina o bot como administrador e tente novamente.`
      )
    );
  }

  try {
    const responseList = await client.groupRequestParticipantsList(m.chat);

    if (!responseList || responseList.length === 0) {
      return m.reply(
        formatStylishReply(
          `Não há nenhuma solicitação pendente de entrada neste grupo no momento.`
        )
      );
    }

    for (const participant of responseList) {
      try {
        const response = await client.groupRequestParticipantsUpdate(
          m.chat,
          [participant.jid],
          'approve'
        );

        console.log(
          formatStylishReply(
            `Solicitação aprovada para: ${participant.jid}`
          ),
          response
        );
      } catch (error) {
        console.error(
          formatStylishReply(
            `Erro ao aprovar o participante: ${participant.jid}`
          ),
          error
        );

        return m.reply(
          formatStylishReply(
            `Não foi possível aprovar @${participant.jid.split('@')[0]}.\n` +
            `Verifique as configurações do grupo e tente novamente.`
          ),
          { mentions: [participant.jid] }
        );
      }
    }

    await m.reply(
      formatStylishReply(
        `Todas as solicitações pendentes de participação foram aprovadas com sucesso.`
      )
    );
  } catch (error) {
    console.error(
      formatStylishReply(
        `Ocorreu um erro ao tentar listar ou aprovar as solicitações de entrada.`
      ),
      error
    );

    await m.reply(
      formatStylishReply(
        `Não foi possível processar as solicitações de entrada no momento.\n` +
        `Tente novamente em alguns instantes.`
      )
    );
  }
};
