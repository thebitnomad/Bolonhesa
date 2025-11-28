const middleware = require('../../utility/botUtil/middleware');
const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'demote',
  aliases: ['unadmin', 'removeadmin'],
  description: 'Remove as permissões de administrador de um usuário no grupo.',
  run: async (context) => {
    await middleware(context, async () => {
      const { client, m, botname, prefix } = context;

      const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
      };

      if (!botname) {
        console.error(
          formatStylishReply(
            'Configuração incompleta: o nome do bot (botname) não está definido no contexto.'
          )
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, o bot não está configurado corretamente.\n` +
            `O identificador interno (*botname*) não foi definido.\n` +
            `Peça para o responsável pelo bot revisar as configurações.`
          )
        );
      }

      if (!m.isGroup) {
        console.log(
          formatStylishReply(
            `Comando de *demote* utilizado fora de um grupo por: ${m.sender}.`
          )
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, este comando só pode ser usado em grupos.\n` +
            `Use *${prefix}demote @usuario* dentro de um grupo.`
          )
        );
      }

      // Buscar metadados do grupo
      let groupMetadata;
      try {
        groupMetadata = await client.groupMetadata(m.chat);
      } catch (e) {
        console.error(
          formatStylishReply(
            `Erro ao obter os dados do grupo: ${e.message}`
          ),
          e
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, não foi possível obter as informações do grupo.\n` +
            `Tente novamente em alguns instantes.`
          )
        );
      }

      const members = groupMetadata.participants;
      const admins = members
        .filter((p) => p.admin != null)
        .map((p) => p.id.split(':')[0]); // Normaliza JIDs

      const botId = client.user.id.split(':')[0]; // Normaliza ID do bot
      console.log(
        formatStylishReply(
          `Verificação de privilégios: Bot ID: ${botId} | Admins atuais: ${JSON.stringify(admins)}`
        )
      );

      if (!admins.includes(botId)) {
        console.log(
          formatStylishReply(
            `O bot (${botId}) não é administrador no grupo: ${m.chat}.`
          )
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, não posso alterar administradores porque o bot não é admin neste grupo.\n` +
            `Defina o bot como administrador e tente novamente.`
          )
        );
      }

      // Verifica se há usuário mencionado ou citado
      if (!m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        console.log(
          formatStylishReply(
            `Nenhum usuário mencionado ou citado para remoção de admin por: ${m.pushName}.`
          )
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, você precisa mencionar ou responder a um usuário para remover o cargo de administrador.\n` +
            `Exemplo: ${prefix}demote @usuario`
          )
        );
      }

      const user = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null);
      if (!user) {
        console.log(
          formatStylishReply(
            `Usuário inválido para remoção de admin no grupo: ${m.chat}.`
          )
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, não foi possível identificar um usuário válido para remover o cargo de administrador.\n` +
            `Tente novamente mencionando ou respondendo corretamente ao usuário.`
          )
        );
      }

      const userNumber = user.split('@')[0];
      const userName =
        m.mentionedJid && m.mentionedJid[0]
          ? members.find((p) => p.id.split(':')[0] === user.split(':')[0])?.name || userNumber
          : m.quoted?.pushName || userNumber;

      // Protege o dono
      const settings = await getSettings();
      const ownerNumber = settings.owner || '254735342808@s.whatsapp.net';
      if (user.split(':')[0] === ownerNumber.split(':')[0]) {
        console.log(
          formatStylishReply(
            `Tentativa de remover privilégios do proprietário (${user}) por: ${m.pushName}.`
          )
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, não é possível remover o cargo de administrador do proprietário do bot.\n` +
            `Apenas o dono pode alterar suas próprias permissões.`
          )
        );
      }

      // Verifica se o usuário é admin
      if (!admins.includes(user.split(':')[0])) {
        console.log(
          formatStylishReply(
            `O usuário ${userName} (${user}) não é administrador no grupo: ${m.chat}.`
          )
        );
        return m.reply(
          formatStylishReply(
            `${m.pushName}, o usuário *${userName}* não é administrador neste grupo.\n` +
            `Não há privilégios de admin para serem removidos.`
          )
        );
      }

      try {
        await client.groupParticipantsUpdate(m.chat, [user], 'demote');
        console.log(
          formatStylishReply(
            `Remoção de privilégios de administrador concluída com sucesso para ${userName} (${user}) no grupo ${m.chat}.`
          )
        );
        await m.reply(
          formatStylishReply(
            `O usuário *${userName}* teve as permissões de administrador removidas com sucesso.\n` +
            `A ação foi executada por *${botname}*.`
          ),
          { mentions: [user] }
        );
      } catch (error) {
        console.error(
          formatStylishReply(
            `Erro ao executar o comando de remoção de admin para ${userName}: ${error.message}`
          ),
          error
        );
        await m.reply(
          formatStylishReply(
            `${m.pushName}, não foi possível remover as permissões de administrador de *${userName}*.\n` +
            `Detalhes técnicos: ${error.message}\n` +
            `Tente novamente em alguns instantes.`
          )
        );
      }
    });
  },
};
