const { getSettings, updateSetting } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    try {
      const settings = await getSettings();
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply("Não encontrei nenhuma configuração no banco de dados. Dê uma olhada nisso depois. 😉") },
          { quoted: m, ad: true }
        );
      }

      const validPresenceValues = ['online', 'offline', 'recording', 'typing'];
      const value = args.join(" ").toLowerCase();

      if (validPresenceValues.includes(value)) {
        if (settings.presence === value) {
          return await client.sendMessage(
            m.chat,
            { text: formatStylishReply(`A presença já está definida como ${value.toUpperCase()}. Nada para mudar por aqui. 😄`) },
            { quoted: m, ad: true }
          );
        }

        await updateSetting('presence', value);
        return await client.sendMessage(
          m.chat,
          { text: formatStylishReply(`Presença atualizada para ${value.toUpperCase()}! Bot ajustado com sucesso. 🔧`) },
          { quoted: m, ad: true }
        );
      }

      const buttons = [
        { buttonId: `${prefix}presence online`,     buttonText: { displayText: "ONLINE 🟢" },    type: 1 },
        { buttonId: `${prefix}presence offline`,    buttonText: { displayText: "OFFLINE ⚫" },   type: 1 },
        { buttonId: `${prefix}presence recording`,  buttonText: { displayText: "RECORDING 🎙️" }, type: 1 },
        { buttonId: `${prefix}presence typing`,     buttonText: { displayText: "TYPING ⌨️" },    type: 1 },
      ];

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Presença atual: ${settings.presence ? settings.presence.toUpperCase() : 'NENHUMA DEFINIDA'}.\nEscolha um modo que combine com o momento. 🔥`
          ),
          footer: "> Powered by Toxic-MD",
          buttons,
          headerType: 1,
          viewOnce: true,
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      await client.sendMessage(
        m.chat,
        { text: formatStylishReply("Tive um problema ao atualizar a presença. Tente novamente mais tarde, por favor. 🙏") },
        { quoted: m, ad: true }
      );
    }
  });
};
