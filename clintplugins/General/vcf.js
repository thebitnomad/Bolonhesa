const fs = require('fs');

module.exports = async (context) => {
    const { client, m } = context;

    if (!m.isGroup) {
        return m.reply(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Este comando só pode ser utilizado em grupos.\n` +
            `◈━━━━━━━━━━━━━━━━◈`
        );
    }

    try {
        const gcdata = await client.groupMetadata(m.chat);
        const contactCount = gcdata.participants.length;

        const vcard = gcdata.participants
            .map((participant, index) => {
                const number = participant.id.split('@')[0];
                return (
                    `BEGIN:VCARD\n` +
                    `VERSION:3.0\n` +
                    `FN:[${index}] +${number}\n` +
                    `TEL;type=CELL;type=VOICE;waid=${number}:+${number}\n` +
                    `END:VCARD`
                );
            })
            .join('\n');

        const cont = './contacts.vcf';

        await m.reply(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Aguarde um momento, estou compilando *${contactCount}* contatos do grupo em um arquivo *VCF*...\n` +
            `◈━━━━━━━━━━━━━━━━◈`
        );

        await fs.promises.writeFile(cont, vcard);

        await m.reply(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Arquivo *VCF* gerado com sucesso.\n` +
            `│❒ Recomendo importar este VCF em uma conta de e-mail separada\n` +
            `│❒ para evitar misturar com seus contatos principais.\n` +
            `◈━━━━━━━━━━━━━━━━◈`
        );

        await client.sendMessage(
            m.chat,
            {
                document: fs.readFileSync(cont),
                mimetype: 'text/vcard',
                fileName: 'Group contacts.vcf',
                caption:
                    `◈━━━━━━━━━━━━━━━━◈\n` +
                    `│❒ Arquivo *VCF* do grupo: *${gcdata.subject}*\n` +
                    `│❒ Total de contatos: *${contactCount}*\n` +
                    `◈━━━━━━━━━━━━━━━━◈`
            },
            { ephemeralExpiration: 86400, quoted: m }
        );

        await fs.promises.unlink(cont);
    } catch (error) {
        console.error(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Ocorreu um erro ao gerar o arquivo VCF.\n` +
            `│❒ Detalhes técnicos foram registrados no console.\n` +
            `◈━━━━━━━━━━━━━━━━◈\n`,
            error
        );

        await m.reply(
            `◈━━━━━━━━━━━━━━━━◈\n` +
            `│❒ Não foi possível gerar o arquivo *VCF* no momento.\n` +
            `│❒ Tente novamente em alguns instantes.\n` +
            `◈━━━━━━━━━━━━━━━━◈`
        );
    }
};
