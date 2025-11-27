const ownerMiddleware = require('../../utility/botUtil/Ownermiddleware');

module.exports = async (context) => {
    await ownerMiddleware(context, async () => {
        const { client, m, text, participants, pushname } = context;

        if (!text) {
            return m.reply(
                "◈━━━━━━━━━━━━━━━━◈\n" +
                "│❒ Por favor, informe a mensagem que deseja enviar no broadcast.\n" +
                "◈━━━━━━━━━━━━━━━━◈"
            );
        }

        if (!m.isGroup) {
            return m.reply(
                "◈━━━━━━━━━━━━━━━━◈\n" +
                "│❒ Este comando só pode ser utilizado em grupos.\n" +
                "◈━━━━━━━━━━━━━━━━◈"
            );
        }

        let allGroups = await client.groupFetchAllParticipating();
        let groups = Object.entries(allGroups).map(entry => entry[1]);
        let groupIds = groups.map(v => v.id);

        await m.reply(
            "◈━━━━━━━━━━━━━━━━◈\n" +
            "│❒ Enviando mensagem de broadcast para todos os grupos...\n" +
            "◈━━━━━━━━━━━━━━━━◈"
        );

        for (let group of groupIds) {

            const formattedMessage =
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│❒ *BROADCAST MESSAGE*\n` +
                `◈━━━━━━━━━━━━━━━━◈\n` +
                `│🀄 *Mensagem:* ${text}\n` +
                `│✒️ *Enviado por:* ${pushname}\n` +
                `◈━━━━━━━━━━━━━━━━◈`;

            await client.sendMessage(
                group,
                {
                    image: { url: "https://qu.ax/XxQwp.jpg" },
                    mentions: participants.map(a => a.id),
                    caption: formattedMessage
                }
            );
        }

        await m.reply(
            "◈━━━━━━━━━━━━━━━━◈\n" +
            "│❒ Mensagem enviada com sucesso em todos os grupos!\n" +
            "◈━━━━━━━━━━━━━━━━◈"
        );
    });
};
