const OWNER_NUMBER = "254735342808";
const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;

// Normaliza número (mantido)
const normalizeNumber = (number) => {
  return number.replace(/[^0-9]/g, '').replace(/^0+/, '').replace(/^\+254/, '254') || number;
};

// Função de retry (mantida)
const retryPromote = async (client, groupId, participant, maxRetries = 5, baseDelay = 1500) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await client.groupParticipantsUpdate(groupId, [participant], "promote");
      return true;
    } catch (e) {
      if (attempt === maxRetries) throw e;
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

const formatReply = (msg) =>
  `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;

// Comando powner
module.exports = {
  name: 'powner',
  aliases: ['promoteowner', 'makeowneradmin'],
  description: 'Promove o número do owner a admin no grupo',
  run: async (context) => {
    const { client, m, isBotAdmin } = context;

    // Verifica se é grupo
    if (!m.isGroup) {
      return m.reply(formatReply("Este comando só pode ser usado em grupos."));
    }

    // Verifica se quem chamou é o owner
    const normalizedAuteur = normalizeNumber(m.sender.split('@')[0]);
    const normalizedOwner = normalizeNumber(OWNER_NUMBER);
    const isOwner = m.sender === OWNER_JID || normalizedAuteur === normalizedOwner;

    if (!isOwner) {
      return m.reply(formatReply("Apenas o proprietário (owner) do bot pode usar este comando."));
    }

    // Verifica se o bot é admin (usa flag do contexto)
    if (!isBotAdmin) {
      await client.sendMessage(m.chat, {
        text: formatReply("Eu preciso ser administrador no grupo para fazer essa alteração.")
      });
      return;
    }

    try {
      const groupMetadata = await client.groupMetadata(m.chat);

      const ownerInGroup = groupMetadata.participants.some(
        member =>
          member.id === OWNER_JID ||
          normalizeNumber(member.id.split('@')[0]) === normalizedOwner
      );

      if (!ownerInGroup) {
        return m.reply(formatReply("O número do owner não foi encontrado neste grupo."));
      }

      const ownerMember = groupMetadata.participants.find(
        member =>
          member.id === OWNER_JID ||
          normalizeNumber(member.id.split('@')[0]) === normalizedOwner
      );

      if (ownerMember?.admin) {
        return m.reply(formatReply("O owner já é administrador neste grupo."));
      }

      await retryPromote(client, m.chat, OWNER_JID);
      return m.reply(formatReply("✅ O owner foi promovido a administrador com sucesso."));

    } catch (error) {
      console.error('Promotion error:', error);
      return m.reply(
        formatReply(`Não foi possível concluir a promoção.\nDetalhes: ${error.message}`)
      );
    }
  }
};
