const fs = require('fs');
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const TAROT_JSON = fs.readFileSync('tarot.json'); // jsonデータを読み込み
const TAROT_JSON_STRING = TAROT_JSON.toString(); // データを文字列に変換
const TAROT = JSON.parse(TAROT_JSON_STRING); //JSONのデータをJavascriptのオブジェクトに変換
const GEMINI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // GEMINIのAPIキー
const USER_LAST_FT_DATE_LIST = new Map(); // ユーザー毎の最後の占い日を記録
const USER_FT_CONTENT_LIST = new Map(); // ユーザー毎の当日の占い内容を記録

// シャッフル関数を作成(Fisher-Yates シャッフルアルゴリズム)
function ft_shuffle(min, max) {
    // 整数の配列を生成
    const array = Array.from({ length: max - min + 1 }, (_, index) => min + index);
  
    // Fisher-Yates シャッフルアルゴリズムを使用して配列をシャッフル
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  
    return array;
}
  

module.exports = {
    data: new SlashCommandBuilder()
        .setName('three_card')
        .setDescription('スリーカードのタロット占いを実行する')
        .addStringOption((option) => option
            .setName('question')
            .setDescription('占いする事柄を事前に設定します')
            .setRequired(false) //trueで必須、falseで任意
        ),

    async execute(interaction) {
        const user_id = interaction.user.id;
        const user_name = interaction.member.displayName;
        const question = interaction.options.getString("question") ?? '運勢の流れ(過去/現在/近未来)';
        const model = GEMINI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
        // ユーザーの最後のおみくじ引き日を取得
        const last_ft_date = USER_LAST_FT_DATE_LIST.get(user_id);
        // 現在の日付を取得
        const current_date = new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }));
    
        if (last_ft_date) {
            if (last_ft_date.getDay() >= current_date.getDay()) { // 本日占っていた場合
                if (USER_FT_CONTENT_LIST.get(user_id).includes(question)) { // 同じ占いをしていた場合
                    await interaction.reply("同じ事柄に関する占いは1日に1回しか出来ません😌");
                    return;   
                }
            } else { // 本日占っていなかった場合
                // ユーザーの当日の占い内容を記録するメモリを確保
                USER_FT_CONTENT_LIST.set(user_id, new Array());
            }
        } else { // 本日占っていなかった場合
            // ユーザーの当日の占い内容を記録するメモリを確保
            USER_FT_CONTENT_LIST.set(user_id, new Array());
        }

        // 占いの実行
        let initial_message = await interaction.channel.send({
            content : `# [スリーカード]\n質問：${question}\n${user_name}の占い結果🔮は...\n\n`
        });
        await interaction.deferReply({ content : "占い中🔮..." });
        setTimeout(() => console.log(""), 3000); // 占い感を出すために処理を遅延
    
        // 占いの実行
        const card = ft_shuffle(0, TAROT.length)

        const image1 = new AttachmentBuilder()
            .setName(TAROT[card[0]].イメージ)
            .setFile(`img/${TAROT[card[0]].イメージ}`)

        const image2 = new AttachmentBuilder()
            .setName(TAROT[card[1]].イメージ)
            .setFile(`img/${TAROT[card[1]].イメージ}`)

        const image3 = new AttachmentBuilder()
            .setName(TAROT[card[2]].イメージ)
            .setFile(`img/${TAROT[card[2]].イメージ}`)

        const prompt = `
            あなたはタロット占いの占い師です。
            今から以下の条件で${user_name}さんのタロット占いをしてもらいます。

            1. ${user_name}さんは「${question}」について、占い師であるあなたに占ってほしいと思っています。
            2. あなたは占い師として、占い師らしい言葉遣いや振る舞いが求められています。
            3. そのために使用するタロット占い方法は「スリーカード」です。スリーカードは3枚のカードから質問について占います。カードは質問の何かに対応しています。例えば「過去/現在/近未来」、「原因/結果/アドバイス」「YES/保留/NO」等です。これは質問に応じて当てはめて考えてください。
            4. 今デッキがシャッフルされ、引かれたカードは「${TAROT[card[0]].カード名}」と「${TAROT[card[1]].カード名}」と「${TAROT[card[2]].カード名}」でした。そのカードの意味はそれぞれ「${TAROT[card[0]].意味}」と「${TAROT[card[1]].意味}」と「${TAROT[card[2]].意味}」でした。カードが何を表しているかは質問内容から判断してください。
            5. 質問を引かれたカードの意味に基づいて解釈し、占い結果を語りかけるように出力してください。必要に応じて与えられたカードの意味だけではなくあなたが持っているタロットカードの知識を活用しても構いません。
            6. 回答内容は質問を深掘りし、最後に具体的なアドバイスを授けるように心がけてください。
            7. 全体の文章は挨拶を含めて300字以内に留めてください。あまりにも長い占いは読み手が疲れてしまうので、これは厳守でお願いします。

            以下に占い例を挙げますので、基本的にこの型に従って占いを行ってください。(カッコがついている箇所は、必要に応じて変更してください。カッコは付けないで出力してください。)

            「ようこそ、お越しくださいましたね、〇〇さん。

            「${question}」について占いをご希望とのこと。

            それでは、カードを引いてみましょう。

            ・・・

            はい、引かれました。「${TAROT[card[0]].カード名}」「${TAROT[card[1]].カード名}」「${TAROT[card[2]].カード名}」です。

            1枚目のカードは「${TAROT[card[0]].意味}」を意味します。

            これは、${question}の(カードに対応すると考えられる要素)と結びついています。

            (質問に応じて1枚目のカードを何かに当てはめて解釈し、占う)

            続いて、2枚目のカードは「${TAROT[card[1]].意味}」を意味します。

            これは、${question}の(カードに対応すると考えられる要素)と結びついています。

            (質問に応じて2枚目のカードを何かに当てはめて解釈し、占う)

            続いて、3枚目のカードは「${TAROT[card[2]].意味}」を意味します。

            これは、${question}の(カードに対応すると考えられる要素)と結びついています。

            (質問に応じて3枚目のカードを何かに当てはめて解釈し、占う)

            最後に、アドバイスです。

            (これまでの占い内容を考慮した具体的なアドバイスを進言する)

            では、良い一日をお過ごしください。」

            では、占い師GEMINIさん、よろしくお願いします🔮
        `;


        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        await initial_message.delete();
        await interaction.editReply({
            content : `# [スリーカード]\n質問：${question}\n${user_name}の占い結果🔮は...\n\n## [1枚目]\n**${TAROT[card[0]].カード名}**： \n➡︎「${TAROT[card[0]].意味}」\n\n## [2枚目]\n**${TAROT[card[1]].カード名}**： \n➡︎「${TAROT[card[1]].意味}」\n\n## [3枚目]\n**${TAROT[card[2]].カード名}**： \n➡︎「${TAROT[card[2]].意味}」\n\n## [解説]\n${text}`,
            files: [image1, image2, image3]
        });
    
        // ユーザーの最後の占い日を更新
        USER_LAST_FT_DATE_LIST.set(user_id, new Date(new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })));
        // ユーザーの当日の占い内容を記録
        USER_FT_CONTENT_LIST.get(user_id).push(question);
    },
};