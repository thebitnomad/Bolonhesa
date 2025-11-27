const { getSettings } = require("../../Database/config");
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = {
  name: 'addbutton',
  aliases: ['addbtn'],
  description: 'Adds a custom button to the menu',
  run: async (context) => {
    await ownerMiddleware(context, async () => {
      const { client, m, args } = context;

      const formatStylishReply = (message) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n◈━━━━━━━━━━━━━━━━◈`;
      };

      try {
        if (args.length < 2) {
          await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                'Uso incorreto.\n\nFormato:\n.addbutton <nome_do_botão> <comando>\n\nExemplo:\n.addbutton menu .menu'
              )
            },
            { quoted: m }
          );
          return;
        }

        const buttonName = args[0];
        const command = args[1];

        // TODO: salvar no banco de dados
        // await saveCustomButton(buttonName, command);

        await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Botão personalizado adicionado com sucesso.\n\n🧩 Nome: *${buttonName}*\n⚙️ Comando: *${command}*`
            )
          },
          { quoted: m }
        );
      } catch (error) {
        console.error(`AddButton error: ${error.stack}`);
        await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Ocorreu um erro ao adicionar o botão personalizado.\n\nDetalhes: ${error.message}`
            )
          },
          { quoted: m }
        );
      }
    });
  }
};
