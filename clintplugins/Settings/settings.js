const { getSettings, getSudoUsers, getBannedUsers } = require('../../Database/config');
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, prefix } = context;

    const settings = await getSettings();
    const botName = process.env.BOTNAME || settings.botname || 'Toxic-MD';
    const sudoUsers = await getSudoUsers();
    const bannedUsers = await getBannedUsers();
    const groupCount = Object.keys(await client.groupFetchAllParticipating()).length;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    const buttons = [
      { buttonId: `${prefix}botname`, buttonText: { displayText: 'Botname 🤖' }, type: 1 },
      { buttonId: `${prefix}prefix`, buttonText: { displayText: 'Prefix ⚙️' }, type: 1 },
      { buttonId: `${prefix}autoread`, buttonText: { displayText: 'Autoread 👀' }, type: 1 },
      { buttonId: `${prefix}autoview`, buttonText: { displayText: 'Autoview Status 📸' }, type: 1 },
      { buttonId: `${prefix}autolike`, buttonText: { displayText: 'Autolike Status ❤️' }, type: 1 },
      { buttonId: `${prefix}reaction`, buttonText: { displayText: 'Emoji de Reação 😈' }, type: 1 },
      { buttonId: `${prefix}setpackname`, buttonText: { displayText: 'Marca d’água do Sticker 🖼️' }, type: 1 },
      { buttonId: `${prefix}autobio`, buttonText: { displayText: 'Autobio 📝' }, type: 1 },
      { buttonId: `${prefix}anticall`, buttonText: { displayText: 'Anticall 📞' }, type: 1 },
      { buttonId: `${prefix}antidelete`, buttonText: { displayText: 'Antidelete 🗑️' }, type: 1 },
      { buttonId: `${prefix}presence`, buttonText: { displayText: 'Presença 🌐' }, type: 1 },
      { buttonId: `${prefix}mode`, buttonText: { displayText: 'Modo 🔒' }, type: 1 },
      { buttonId: `${prefix}chatbotpm`, buttonText: { displayText: 'Chatbot PM 💬' }, type: 1 },
    ];

    const message = formatStylishReply(
      `*Configurações do Bot* 🤖✨\n\n` +
      `Botname: ${botName}\n` +
      `Prefixo: ${settings.prefix || 'Nenhum'}\n` +
      `Antidelete: ${settings.antidelete ? '✅ ON' : '❌ OFF'}\n` +
      `Chatbot PM: ${settings.chatbotpm ? '✅ ON' : '❌ OFF'}\n` +
      `Sudo Users: ${sudoUsers.length > 0 ? sudoUsers.join(', ') : 'Nenhum'}\n` +
      `Usuários Banidos: ${bannedUsers.length}\n` +
      `Grupos Ativos: ${groupCount}\n\n` +
      `Toque em um botão para configurar!`
    );

    await client.sendMessage(
      m.chat,
      {
        text: message,
        footer: '> Powered by *9bot*',
        buttons,
        headerType: 1,
        viewOnce: true,
      },
      { quoted: m, ad: true }
    );
  });
};
