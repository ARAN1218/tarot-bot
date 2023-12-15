const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('タロット占いBotの説明'),
        
    async execute(interaction) {

        const ref = new EmbedBuilder()
            .setTitle('tarot bot')
            .setDescription('タロット占い🔮ができるdiscord botです🐦\nタロット占いについて概要はコチラのURLから')
            .setThumbnail('https://www.fukuunkaku.jp/wp-content/uploads/2022/09/pixta_91879445_M.jpg')
            .setURL('https://atelier365.net/blog/tarot-spread/')
        
        await interaction.reply({ content : `
            タロット占いbot🔮へようこそ！\nこのbotは一日一回タロット占いをしてくれます！\n\nタロット占いコマンドの種類：\n**/one_oracle** … 事前に決めた占い事に対し、一枚のカードから占います。[学業、金運、恋愛etc…]\n**/two_oracle** … 事前に決めた質問に対する結果と対策について、2枚のカードから占います。\n**/three_oracle** … 過去・現在・未来の流れを３枚のカードから占います。\n\n順次アップデートにより内容や演出等を発展させていく予定です🐦\n\n参考文献：https://atelier365.net/blog/tarot-spread/
        `, embeds : [ref] });
    },
};