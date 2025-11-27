const { getSettings, updateSetting } = require('../../Database/config')
const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware')

module.exports = async (context) => {
  await ownerMiddleware(context, async () => {
    const { client, m, args, prefix } = context

    const formatStylishReply = (message) => {
      return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${message}\n┗━━━━━━━━━━━━━━━┛`
    }

    try {
      const settings = await getSettings()
      if (!settings || Object.keys(settings).length === 0) {
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              'Não foi possível encontrar as configurações no banco de dados.\n│❒ Verifique as definições do bot antes de tentar novamente.'
            )
          },
          { quoted: m, ad: true }
        )
      }

      const value = args.join(' ').toLowerCase()

      if (value === 'on' || value === 'off') {
        const action = value === 'on'

        if (settings.autoread === action) {
          return await client.sendMessage(
            m.chat,
            {
              text: formatStylishReply(
                `O Autoread já está definido como ${value.toUpperCase()}. 😉`
              )
            },
            { quoted: m, ad: true }
          )
        }

        await updateSetting('autoread', action)
        return await client.sendMessage(
          m.chat,
          {
            text: formatStylishReply(
              `Autoread definido para ${value.toUpperCase()} com sucesso! 🔥\n` +
              (action
                ? 'As mensagens serão marcadas como lidas automaticamente. 👀'
                : 'A marcação automática de mensagens como lidas foi desativada. 😴')
            )
          },
          { quoted: m, ad: true }
        )
      }

      const buttons = [
        { buttonId: `${prefix}autoread on`, buttonText: { displayText: 'ON 🥶' }, type: 1 },
        { buttonId: `${prefix}autoread off`, buttonText: { displayText: 'OFF 😴' }, type: 1 }
      ]

      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            `Status do Autoread: ${settings.autoread ? 'ON 🥶' : 'OFF 😴'}\n` +
            '│❒ Escolha uma opção abaixo para ativar ou desativar a leitura automática de mensagens.'
          ),
          footer: '> Powered by *9bot*',
          buttons,
          headerType: 1,
          viewOnce: true
        },
        { quoted: m, ad: true }
      )
    } catch (error) {
      await client.sendMessage(
        m.chat,
        {
          text: formatStylishReply(
            'Ocorreu um erro ao atualizar o Autoread.\n│❒ Verifique o banco de dados ou tente novamente em alguns instantes.'
          )
        },
        { quoted: m, ad: true }
      )
    }
  })
}
