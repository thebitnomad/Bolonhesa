const fetch = require('node-fetch');
const axios = require('axios');

module.exports = {
    name: 'fetch',
    aliases: ['get', 'url', 'web'],
    description: 'Busca e exibe informações de uma URL',
    run: async (context) => {
        const { client, m, prefix, botname } = context;

        const formatStylishReply = (body) => {
            return `◈━━━━━━━━━━━━━━━━◈
${body}
◈━━━━━━━━━━━━━━━━◈`;
        };

        /**
         * Extrair URL da mensagem
         */
        const url = (m.body || '').replace(
            new RegExp(`^${prefix}(fetch|get|url|web)\\s*`, 'i'),
            ''
        ).trim();

        if (!url) {
            return client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ URL não informada.
│❒ Use o formato: ${prefix}fetch https://exemplo.com

📃 *Resposta JSON:*
${JSON.stringify(
    {
        success: false,
        message: 'Parâmetro obrigatório "url" não foi informado.',
        required: ['url'],
        missing: ['url'],
        usage: `${prefix}fetch https://example.com`,
        timestamp: new Date().toISOString()
    },
    null,
    2
)}`
                    )
                },
                { quoted: m }
            );
        }

        // Validação básica de URL
        let targetUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            targetUrl = 'https://' + url;
        }

        try {
            /**
             * Buscar dados da URL
             */
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 30000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type') || '';

            /**
             * Tratar diferentes content-types
             */
            if (contentType.includes('application/json')) {
                // Resposta JSON
                const data = await response.json();

                const responseData = {
                    success: true,
                    message: 'Dados JSON obtidos com sucesso.',
                    url: targetUrl,
                    status: response.status,
                    contentType: contentType,
                    data: data,
                    timestamp: new Date().toISOString()
                };

                // Se JSON for muito grande, enviar parte em mensagem e o resto em arquivo
                if (JSON.stringify(responseData).length > 1500) {
                    responseData.data = '[Conteúdo muito grande - enviado em arquivo separado]';

                    await client.sendMessage(
                        m.chat,
                        {
                            text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ Conteúdo JSON obtido com sucesso.

📃 *Resumo da Resposta JSON:*
${JSON.stringify(responseData, null, 2)}`
                            )
                        },
                        { quoted: m }
                    );

                    await client.sendMessage(
                        m.chat,
                        {
                            document: Buffer.from(
                                JSON.stringify(
                                    {
                                        success: true,
                                        message: 'Dados JSON completos.',
                                        url: targetUrl,
                                        status: response.status,
                                        contentType: contentType,
                                        data: data,
                                        timestamp: new Date().toISOString()
                                    },
                                    null,
                                    2
                                )
                            ),
                            mimetype: 'application/json',
                            fileName: `fetch_result_${Date.now()}.json`
                        },
                        { quoted: m }
                    );
                } else {
                    await client.sendMessage(
                        m.chat,
                        {
                            text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ Conteúdo JSON obtido com sucesso.

📃 *Resposta JSON:*
${JSON.stringify(responseData, null, 2)}`
                            )
                        },
                        { quoted: m }
                    );
                }
            } else if (contentType.includes('text/html')) {
                // Resposta HTML
                const html = await response.text();

                const titleMatch = html.match(/<title>(.*?)<\/title>/i);
                const title = titleMatch ? titleMatch[1] : 'Sem título na página';

                const responseData = {
                    success: true,
                    message: 'Conteúdo HTML obtido com sucesso.',
                    url: targetUrl,
                    status: response.status,
                    contentType: contentType,
                    title: title,
                    contentLength: html.length,
                    preview: html.replace(/<[^>]*>/g, '').substring(0, 200).trim(),
                    timestamp: new Date().toISOString()
                };

                await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ Conteúdo HTML obtido com sucesso.

📃 *Resumo da Resposta JSON:*
${JSON.stringify(responseData, null, 2)}`
                        )
                    },
                    { quoted: m }
                );
            } else if (contentType.includes('text/plain')) {
                // Resposta texto puro
                const text = await response.text();

                const responseData = {
                    success: true,
                    message: 'Conteúdo de texto obtido com sucesso.',
                    url: targetUrl,
                    status: response.status,
                    contentType: contentType,
                    contentLength: text.length,
                    content:
                        text.length > 500 ? text.substring(0, 500) + '...' : text,
                    timestamp: new Date().toISOString()
                };

                if (text.length > 1500) {
                    responseData.content =
                        '[Conteúdo muito grande - enviado em arquivo separado]';

                    await client.sendMessage(
                        m.chat,
                        {
                            text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ Conteúdo de texto obtido com sucesso.

📃 *Resumo da Resposta JSON:*
${JSON.stringify(responseData, null, 2)}`
                            )
                        },
                        { quoted: m }
                    );

                    await client.sendMessage(
                        m.chat,
                        {
                            document: Buffer.from(text),
                            mimetype: 'text/plain',
                            fileName: `fetch_result_${Date.now()}.txt`
                        },
                        { quoted: m }
                    );
                } else {
                    await client.sendMessage(
                        m.chat,
                        {
                            text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ Conteúdo de texto obtido com sucesso.

📃 *Resposta JSON:*
${JSON.stringify(responseData, null, 2)}`
                            )
                        },
                        { quoted: m }
                    );
                }
            } else if (contentType.includes('image/')) {
                // Resposta imagem
                const imageBuffer = await response.buffer();

                const responseData = {
                    success: true,
                    message: 'Imagem obtida com sucesso.',
                    url: targetUrl,
                    status: response.status,
                    contentType: contentType,
                    size: `${(imageBuffer.length / 1024).toFixed(2)} KB`,
                    timestamp: new Date().toISOString()
                };

                await client.sendMessage(
                    m.chat,
                    {
                        image: imageBuffer,
                        caption: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ Imagem obtida com sucesso.

📃 *Detalhes:*
${JSON.stringify(responseData, null, 2)}`
                        )
                    },
                    { quoted: m }
                );
            } else {
                // Outros tipos de conteúdo
                const data = await response.text();

                const responseData = {
                    success: true,
                    message: 'Conteúdo obtido com sucesso.',
                    url: targetUrl,
                    status: response.status,
                    contentType: contentType,
                    contentLength: data.length,
                    preview:
                        data.length > 500 ? data.substring(0, 500) + '...' : data,
                    timestamp: new Date().toISOString()
                };

                await client.sendMessage(
                    m.chat,
                    {
                        text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ Conteúdo recebido com sucesso.

📃 *Resumo da Resposta JSON:*
${JSON.stringify(responseData, null, 2)}`
                        )
                    },
                    { quoted: m }
                );
            }
        } catch (error) {
            console.error('Fetch command error:', error);

            let errorMessage = error.message;
            if (error.name === 'TimeoutError') {
                errorMessage =
                    'Tempo de espera excedido. A requisição demorou mais de 30 segundos.';
            } else if (error.code === 'ENOTFOUND') {
                errorMessage =
                    'Não foi possível resolver o endereço da URL. Verifique se o domínio existe.';
            } else if (error.code === 'ECONNREFUSED') {
                errorMessage =
                    'Conexão recusada. O servidor pode estar offline ou bloqueando requisições.';
            }

            await client.sendMessage(
                m.chat,
                {
                    text: formatStylishReply(
`│❒ 🛜 *Requisição GET*
│❒ A requisição falhou.

📃 *Resposta JSON:*
${JSON.stringify(
    {
        success: false,
        message: 'Falha ao executar a requisição GET.',
        url: targetUrl,
        error: errorMessage,
        timestamp: new Date().toISOString()
    },
    null,
    2
)}`
                    )
                },
                { quoted: m }
            );
        }
    }
};
