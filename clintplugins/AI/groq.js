module.exports = async (context) => {
    const { client, m, text } = context;

    const formatStylishReply = (msg) => {
        return `◈━━━━━━━━━━━━━━━━◈\n│❒ ${msg}\n◈━━━━━━━━━━━━━━━━◈`;
    };

    if (!text) {
        return m.reply(
            formatStylishReply("Por favor, informe uma consulta para a IA.")
        );
    }

    try {
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY 
                || "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"
        });

        const model = process.env.GROQ_MODEL || "llama3-8b-8192";
        const systemMessage =
            process.env.GROQ_SYSTEM_MSG 
            || "Certifique-se de que a resposta seja simples e fácil de entender.";

        async function getGroqChatCompletion(query) {
            return groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: systemMessage,
                    },
                    {
                        role: "user",
                        content: query,
                    },
                ],
                model: model,
            });
        }

        const chatCompletion = await getGroqChatCompletion(text);
        const content =
            chatCompletion.choices[0]?.message?.content
            || "Nenhuma resposta recebida.";

        await client.sendMessage(
            m.chat,
            { 
                text:
`◈━━━━━━━━━━━━━━━━◈
│❒ Resposta da IA:
◈━━━━━━━━━━━━━━━━◈

${content}

◈━━━━━━━━━━━━━━━━◈`
            },
            { quoted: m }
        );

    } catch (error) {
        console.error("Error:", error);
        m.reply(
            formatStylishReply(`Ocorreu um erro ao processar sua solicitação.\n${error}`)
        );
    }
};
