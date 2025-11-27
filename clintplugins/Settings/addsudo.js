const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSudoUsers, addSudoUser } = require('../../Database/config');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m, args } = context;

    let numberToAdd;

    if (m.quoted) {
      numberToAdd = m.quoted.sender.split('@')[0];
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      numberToAdd = m.mentionedJid[0].split('@')[0];
    } else {
      numberToAdd = args[0];
    }

    if (!numberToAdd || !/^\d+$/.test(numberToAdd)) {
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Por favor, informe um número válido.\n` +
        `│❒ Você pode citar uma mensagem, marcar um usuário ou enviar o número diretamente.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    const sudoUsers = await getSudoUsers();
    if (sudoUsers.includes(numberToAdd)) {
      return await m.reply(
        `◈━━━━━━━━━━━━━━━━◈\n` +
        `│❒ Este número já é um usuário sudo.\n` +
        `│❒ ${numberToAdd} já está na lista de permissões elevadas.\n` +
        `┗━━━━━━━━━━━━━━━┛`
      );
    }

    await addSudoUser(numberToAdd);
    await m.reply(
      `◈━━━━━━━━━━━━━━━━◈\n` +
      `│❒ Novo usuário sudo adicionado com sucesso.\n` +
      `│❒ ${numberToAdd} agora possui permissões de administrador do bot.\n` +
      `┗━━━━━━━━━━━━━━━┛`
    );
  });
};
