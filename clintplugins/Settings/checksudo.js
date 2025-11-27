const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');
const { getSudoUsers } = require('../../Database/config');

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { m } = context;

    try {
      const sudoUsers = await getSudoUsers();

      if (!sudoUsers || sudoUsers.length === 0) {
        return await m.reply(
          `◈━━━━━━━━━━━━━━━━◈
│❒ Nenhum usuário Sudo encontrado no momento.
┗━━━━━━━━━━━━━━━┛`
        );
      }

      const list = sudoUsers.map((jid, index) => `${index + 1}. ${jid}`).join('\n');

      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ *Lista de Usuários Sudo:*
│
${list}
┗━━━━━━━━━━━━━━━┛`
      );

    } catch (error) {
      console.error('Erro ao listar Sudo Users:', error);
      await m.reply(
        `◈━━━━━━━━━━━━━━━━◈
│❒ Ocorreu um erro ao recuperar os usuários Sudo.
│❒ Tente novamente mais tarde.
┗━━━━━━━━━━━━━━━┛`
      );
    }
  });
};
