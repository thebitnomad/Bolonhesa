const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;
    const value = args[0]?.toLowerCase();
    const jid = m.chat;

    if (!jid.endsWith('@g.us')) {
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Este comando só pode ser usado em grupos.\n` +
        `│❒ Use-o dentro de um grupo para funcionar corretamente.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    try {
      const settings = await getSettings();
      if (!settings) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Não foi possível carregar as configurações gerais do bot.\n` +
          `│❒ Verifique o banco de dados antes de tentar novamente.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      let groupSettings = await getGroupSetting(jid);
      if (!groupSettings) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Não há configurações salvas para este grupo.\n` +
          `│❒ Tente novamente mais tarde ou revise o banco de dados.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }

      let isEnabled = groupSettings?.antiforeign === true;

      const Myself = await client.decodeJid(client.user.id);
      const groupMetadata = await client.groupMetadata(m.chat);
      const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
      const isBotAdmin = userAdmins.includes(Myself);

      if (value === 'on' || value === 'off') {
        if (!isBotAdmin) {
          return await m.reply(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Eu preciso ser administrador do grupo para alterar o antiforeign.\n` +
            `│❒ Dê permissão de admin para o bot e tente novamente.\n` +
            `┗━━━━━━━━━━━━━━━┛`
          );
        }

        const action = value === 'on';

        if (isEnabled === action) {
          return await m.reply(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ O antiforeign já está definido como ${value.toUpperCase()} neste grupo.\n` +
            `│❒ Nenhuma alteração foi necessária.\n` +
            `┗━━━━━━━━━━━━━━━┛`
          );
        }

        await updateGroupSetting(jid, 'antiforeign', action);
        await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Antiforeign definido para ${value.toUpperCase()} com sucesso.\n` +
          `│❒ Novos participantes estrangeiros serão filtrados conforme a regra atual.\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      } else {
        await m.reply(
          `◈━━━━━━━━━━━━━━━━◈\n` +
          `│❒ Status do antiforeign neste grupo: ${isEnabled ? 'ON' : 'OFF'}.\n` +
          `│❒ Para alterar, use:\n` +
          `│   • ${prefix}antiforeign on\n` +
          `│   • ${prefix}antiforeign off\n` +
          `┗━━━━━━━━━━━━━━━┛`
        );
      }
    } catch (error) {
      console.error('[Antiforeign] Error in command:', error);
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Ocorreu um erro ao tentar atualizar o antiforeign.\n` +
        `│❒ Verifique o banco de dados ou tente novamente mais tarde.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};
