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
          {
            text: formatStylishReply(
              'Não foi possível encontrar as configurações no banco de dados.\n│❒ Verifique as definições do bot antes de tentar novamente.'
            )
          },
          { quoted: m, ad: true }
        );
      }

      const value = args.join(' ').toLowerCase();
      const validValues = ['on', 'off'];

      // Se o usuário não passou um valor válido, mostramos botões
      if (!validValues.includes(value)) {
        const buttons = [
          {
            buttonId: `${prefix}chatbotpm on`,
            buttonText: { displayText: 'ATIVAR CHATBOT 🤖' },
            type: 1
          },
          {
            buttonId: `${prefix}chatbotpm off`,
            buttonText: { displayText: 'DESATIVAR CHATBOT 🔴' },
            type: 1
          }
        ];

        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Chatbot PM está atualmente ${settings.chatbotpm ? 'ATIVADO ✅' : 'DESATIVADO ❌'}.\n│❒ Use ${prefix}chatbotpm on / off para alterar.`
            ),
            footer: '> Pσɯҽɾԃ Ⴆყ Tσxιƈ-ɱԃȥ',
            buttons,
            headerType: 1,
            viewOnce: true
          },
          { quoted: m, ad: true }
        );
      }

      const newState = value === 'on';

      if (settings.chatbotpm === newState) {
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `O Chatbot PM já está ${newState ? 'ATIVADO ✅' : 'DESATIVADO ❌'}.\n│❒ Nada para atualizar por aqui. 😉`
            )
          },
          { quoted: m, ad: true }
        );
      }

      await updateSetting('chatbotpm', newState);

      return await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Chatbot PM ${newState ? 'ATIVADO ✅' : 'DESATIVADO ❌'}!\n` +
            (newState
              ? 'Agora vou responder mensagens privadas automaticamente como um bom assistente. 🤖'
              : 'Respostas automáticas em privado desativadas. Voltamos ao modo normal. 😴')
          )
        },
        { quoted: m, ad: true }
      );
    } catch (error) {
      console.error('Error toggling chatbotpm:', error);
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            'Ocorreu um erro ao atualizar o Chatbot PM.\n│❒ Tente novamente em alguns instantes.'
          )
        },
        { quoted: m, ad: true }
      );
    }
  });
};
