const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
  await middleware(context, async () => {
    const { client, m, botNumber } = context;

    const formatStylishReply = (message) => {
      const lines = String(message || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const body = lines.map((l) => `│❒ ${l}`).join('\n');
      return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    // Log de contexto para depuração
    console.log(
      formatStylishReply(
        `Contexto do comando de remoção:\n` +
        `isGroup=${m.isGroup}, mentionedJid=${JSON.stringify(
          m.mentionedJid
        )}, quotedSender=${m.quoted?.sender || 'none'}`
      )
    );

    // Garante que o comando esteja sendo usado em grupo
    if (!m.isGroup) {
      return m.reply(
        formatStylishReply(
          `Este comando só pode ser usado em grupos.\n` +
          `Use-o em um grupo para remover um participante.`
        )
      );
    }

    // Verifica se um usuário foi marcado ou citado
    if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
      return m.reply(
        formatStylishReply(
          `Você não indicou nenhum usuário.\n` +
          `Marque alguém ou responda a uma mensagem para remover a pessoa do grupo.`
        )
      );
    }

    // Define o alvo (mencionado ou citado)
    const users = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

    if (!users) {
      console.error(
        formatStylishReply(
          `Nenhum usuário válido encontrado.\n` +
          `mentionedJid=${JSON.stringify(m.mentionedJid)}, quotedSender=${
            m.quoted?.sender || 'none'
          }`
        )
      );
      return m.reply(
        formatStylishReply(
          `Não consegui identificar o usuário.\n` +
          `Tente novamente marcando ou respondendo corretamente à pessoa.`
        )
      );
    }

    // Valida o formato do JID
    if (
      typeof users !== 'string' ||
      (!users.includes('@s.whatsapp.net') && !users.includes('@lid'))
    ) {
      console.error(
        formatStylishReply(
          `Formato de JID inválido recebido: ${users}`
        )
      );
      return m.reply(
        formatStylishReply(
          `O usuário informado não parece ser válido.\n` +
          `Marque um usuário real do grupo para concluir a ação.`
        )
      );
    }

    // Extrai o número do JID
    const parts = users.split('@')[0];
    if (!parts) {
      console.error(
        formatStylishReply(
          `Não foi possível extrair o número do JID: ${users}`
        )
      );
      return m.reply(
        formatStylishReply(
          `Houve um problema ao identificar o usuário.\n` +
          `Tente novamente em alguns instantes.`
        )
      );
    }

    // Impede que o bot seja removido
    if (users === botNumber) {
      return m.reply(
        formatStylishReply(
          `Não posso remover a mim mesmo do grupo. 😉\n` +
          `Se precisar de ajuda com configurações, é só chamar um administrador.`
        )
      );
    }

    try {
      // Tenta remover o usuário do grupo
      await client.groupParticipantsUpdate(m.chat, [users], 'remove');

      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ O usuário @${parts} foi removido do grupo. 🚫
│❒ Lembre-se: use este comando com responsabilidade.
◈━━━━━━━━━━━━━━━━◈`,
        { mentions: [users] }
      );
    } catch (error) {
      console.error(
        formatStylishReply(
          `Erro ao executar o comando de remoção: ${error.message}`
        ),
        error
      );

      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ Não foi possível remover @${parts} do grupo.
│❒ Verifique se o bot possui permissões de administrador ou tente novamente depois.
◈━━━━━━━━━━━━━━━━◈`,
        { mentions: [users] }
      );
    }
  });
};
