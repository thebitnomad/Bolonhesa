const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSettings, banUser, getBannedUsers, getSudoUsers } = require('../../Database/config');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`;
    };

    let settings = await getSettings();
    if (!settings) {
      return await m.reply(
        formatStylishReply(
          'Não foi possível encontrar as configurações do bot.\n│❒ Verifique o banco de dados antes de usar este comando. 😉'
        )
      );
    }

    const sudoUsers = await getSudoUsers();

    let numberToBan;

    if (m.quoted) {
      numberToBan = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      numberToBan = m.mentionedJid[0];
    } else {
      numberToBan = args[0];
    }

    if (!numberToBan) {
      return await m.reply(
        formatStylishReply(
          'Informe um número válido ou responda a mensagem da pessoa que deseja banir.'
        )
      );
    }

    // Normaliza se vier com @s.whatsapp.net
    if (numberToBan.includes('@s.whatsapp.net')) {
      numberToBan = numberToBan.split('@')[0];
    }

    // Impede ban de sudo
    if (sudoUsers.includes(numberToBan)) {
      return await m.reply(
        formatStylishReply(
          'Este número pertence a um usuário Sudo.\n│❒ Não é possível bani-lo. 🛑'
        )
      );
    }

    const bannedUsers = await getBannedUsers();

    if (bannedUsers.includes(numberToBan)) {
      return await m.reply(
        formatStylishReply(
          'Este usuário já está banido.\n│❒ Nada para atualizar aqui. ⚠️'
        )
      );
    }

    await banUser(numberToBan);
    await m.reply(
      formatStylishReply(
        `O número *${numberToBan}* foi banido com sucesso. ✅`
      )
    );
  });
};
