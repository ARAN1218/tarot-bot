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
        
        await interaction.reply({
            content : `# タロット占いbot🔮へようこそ！\nこのbotはタロット占いをしてくれます！\n\n## [はじめに]タロット占いに対する考え方\nタロット占いは単純に吉凶を占うものではなく、自分が今まで向き合ってこなかったものについて考えるきっかけや、問題を別の角度から見た時のヒントを与えてくれるものです。極端に言ってしまえば、意思決定ツールの一つとも言えるでしょう。だからこそ、自分が何について占うのか、質問を明確にしてから占う必要があるのです。\n\n## タロット占いコマンドの種類：\n**/one_oracle** … 事前に決めた質問について、１枚のカードから占います[学業、金運、恋愛etc…]。\n**/two_oracle** … 事前に決めた質問に対する結果/対策、A択/B択等を２枚のカードから占います[仕事で失敗してしまったが、どうすれば挽回できるか etc…]。\n**/three_card** … 質問に対する過去/現在/近未来、原因/結果/アドバイス、YES/保留/NO等の「流れ」を３枚のカードから占います[今、私の運の状態はどうなっている？ etc…]。\n\n## タロット占いの質問作りのコツ🐦\n明確な答えを得るには、自分が知りたいことをはっきりさせてからカードを引くことが大切です。曖昧なまま占ってしまうと、引いたカードの解釈を自分にとって都合の良い解釈しかできません。まず「**自分はどうしたいのか**」という自分の意思を考え、「**それを実現するためにはどうしたら良いのか**」という具体策をセットにして考えると良い質問に近づくことができるでしょう。\nex.) **どうしたら**私は課題に集中できる？\n\n参考文献：https://www.amazon.co.jp/78枚のカードで占う、いちばんていねいなタロット-LUA/dp/4537215305`,
            embeds : [ref],
            // ephemeral: true
        });
    },
};