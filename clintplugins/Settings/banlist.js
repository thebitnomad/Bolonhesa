const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getBannedUsers } = require('../../Database/config');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m } = context;

    const bannedUsers = await getBannedUsers();

    if (!bannedUsers || bannedUsers.length === 0) {
      return await m.reply('◈━━━━━━━━━━━━━━━━◈\n│❒ Nenhum usuário banido no momento. Ambiente limpo! 😇\n┗━━━━━━━━━━━━━━━┛');
    }

    const list = bannedUsers
      .map((num, index) => `${index + 1}. ${num}`)
      .join('\n');

    await m.reply(
      `◈━━━━━━━━━━━━━━━━◈
│❒ *Lista de usuários banidos:* 🚫
│
${list}
┗━━━━━━━━━━━━━━━┛`
    );
  });
};
