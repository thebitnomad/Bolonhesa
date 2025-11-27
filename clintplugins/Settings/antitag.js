const { getSettings, getGroupSetting, updateGroupSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, args } = context;
        const value = args[0]?.toLowerCase();
        const jid = m.chat;

        if (!jid.endsWith('@g.us')) {
            return await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Este comando só pode ser usado em *grupos*.
│❒ Tente de novo em um grupo. 😄
┗━━━━━━━━━━━━━━━┛`
            );
        }

        const settings = await getSettings();
        const prefix = settings.prefix;

        let groupSettings = await getGroupSetting(jid);
        let isEnabled = groupSettings?.antitag === true;

        const Myself = await client.decodeJid(client.user.id);
        const groupMetadata = await client.groupMetadata(m.chat);
        const userAdmins = groupMetadata.participants.filter(p => p.admin !== null).map(p => p.id);
        const isBotAdmin = userAdmins.includes(Myself);

        if (value === 'on' && !isBotAdmin) {
            return await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Não consigo ativar o *Antitag* ainda.
│❒ Me coloque como *admin do grupo* primeiro. 😉
┗━━━━━━━━━━━━━━━┛`
            );
        }

        if (value === 'on' || value === 'off') {
            const action = value === 'on';

            if (isEnabled === action) {
                return await m.reply(
                    `◈━━━━━━━━━━━━━━━━◈
│❒ O Antitag já está em modo *${value.toUpperCase()}* neste grupo.
│❒ Nada foi alterado. ✅
┗━━━━━━━━━━━━━━━┛`
                );
            }

            await updateGroupSetting(jid, 'antitag', action ? 'true' : 'false');
            await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Antitag foi definido para *${value.toUpperCase()}* neste grupo. ✅
│❒ Menções em massa agora estão sob controle. 😼
┗━━━━━━━━━━━━━━━┛`
            );
        } else {
            await m.reply(
                `◈━━━━━━━━━━━━━━━━◈
│❒ Status atual do Antitag neste grupo: *${isEnabled ? 'ON 🟢' : 'OFF ⚪'}*
│❒ Para alterar, use:
│   • ${prefix}antitag on
│   • ${prefix}antitag off
┗━━━━━━━━━━━━━━━┛`
            );
        }
    });
};
