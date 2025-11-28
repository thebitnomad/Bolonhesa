const middleware = require('../../utility/botUtil/middleware');

module.exports = async (context) => {
  await middleware(context, async () => {
    const { client, m, groupMetadata } = context;

    const formatStylishReply = (message) => {
      const lines = String(message || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

      const body = lines.map((l) => `│❒ ${l}`).join('\n');
      return `◈━━━━━━━━━━━━━━━━◈\n${body}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    try {
      // Revoga o link atual do grupo
      await client.groupRevokeInvite(m.chat);

      await client.sendText(
        m.chat,
        formatStylishReply(
          `O link do grupo foi revogado com sucesso. 🔒`
        ),
        m
      );

      // Gera um novo link de convite
      const response = await client.groupInviteCode(m.chat);

      await client.sendText(
        m.sender,
        formatStylishReply(
          `Aqui está o novo link do grupo *${groupMetadata.subject}*:\n` +
          `https://chat.whatsapp.com/${response}\n\n` +
          `Compartilhe apenas com quem você realmente deseja convidar. 😉`
        ),
        m,
        { detectLink: true }
      );

      await client.sendText(
        m.chat,
        formatStylishReply(
          `Enviei o novo link do grupo em mensagem privada para você. 📩`
        ),
        m
      );
    } catch (error) {
      console.error(
        formatStylishReply(
          `Erro ao revogar ou gerar o novo link do grupo: ${error.message}`
        ),
        error
      );

      await client.sendText(
        m.chat,
        formatStylishReply(
          `Não consegui revogar o link ou gerar um novo no momento.\n` +
          `Tente novamente em alguns instantes.`
        ),
        m
      );
    }
  });
};
