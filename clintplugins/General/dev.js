const { getSettings } = require('../../Database/config');

module.exports = {
  name: 'dev',
  aliases: ['developer', 'contact'],
  description: 'Sends the developer\'s contact as a vCard',
  run: async (context) => {
    const { client, m } = context;

    try {
      const settings = await getSettings();
      if (!settings) {
        await client.sendMessage(m.chat, { text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Não foi possível carregar as configurações.\n│❒ Tente novamente em instantes.\n◈━━━━━━━━━━━━━━━━◈` }, { quoted: m });
        return;
      }

      const devContact = {
        phoneNumber: '254735342808',
        fullName: 'Toxic Dev'
      };

      const vcard = 'BEGIN:VCARD\n' 
                  + 'VERSION:3.0\n' 
                  + 'FN:' + devContact.fullName + '\n' 
                  + 'ORG:Toxic-MD;\n' 
                  + 'TEL;type=CELL;type=VOICE;waid=' + devContact.phoneNumber + ':+' + devContact.phoneNumber + '\n' 
                  + 'END:VCARD';

      await client.sendMessage(m.chat, {
        contacts: {
          displayName: 'Toxic Dev',
          contacts: [{ vcard }]
        }
      }, { quoted: m });

    } catch (error) {
      console.error('Error sending developer contact:', error);
      await client.sendMessage(m.chat, {
        text: `◈━━━━━━━━━━━━━━━━◈\n│❒ Opa! Algo deu errado ao enviar o contato.\n│❒ Tente novamente daqui a pouco.\n◈━━━━━━━━━━━━━━━━◈`
      }, { quoted: m });
    }
  }
};