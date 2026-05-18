import { Bot, webhookCallback, InlineKeyboard } from "https://deno.land/x/grammy@v1.20.0/mod.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN")!;

const bot = new Bot(BOT_TOKEN);

// ========== 设置底部命令菜单 ==========
await bot.api.setMyCommands([
  { command: "start", description: "打开主菜单" },
]);

// ========== /start 命令：发送主菜单内联键盘 ==========
bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text("📺 浏览频道", "menu_channels").row()
    .text("📋 全部内容", "menu_list").row()
    .text("📦 已购内容", "menu_my").row()
    .text("💳 支付测试", "menu_pay_test").row()
    .text("❓ 帮助", "menu_help");

  await ctx.reply("🎛️ 欢迎来到主菜单，请选择功能：", {
    reply_markup: keyboard,
  });
});

// 各命令入口（占位）
bot.command("channels", async (ctx) => {
  await ctx.reply("📺 频道浏览功能开发中...");
});
bot.command("list", async (ctx) => {
  await ctx.reply("📋 内容列表功能开发中...");
});
bot.command("my", async (ctx) => {
  await ctx.reply("📦 已购内容功能开发中...");
});
bot.command("help", async (ctx) => {
  await ctx.reply("❓ 使用 /start 打开主菜单，或点击下方按钮。");
});

// ========== 内联键盘按钮回调 ==========
bot.callbackQuery(/^menu_/, async (ctx) => {
  const action = ctx.callbackQuery.data;

  // 处理支付测试按钮
  if (action === "menu_pay_test") {
    // 使用 createInvoiceLink 生成 Stars 支付链接（provider_token 为空字符串）
    const title = "支付测试内容";
    const description = "这是一个支付功能测试，你将花费 1 Star 来体验流程。";
    const payload = "test_payment_1";          // 自定义标识，支付成功后会传回
    const price = 1;                            // 价格，单位是 Stars
    const link = await ctx.api.createInvoiceLink(
      title,
      description,
      payload,
      "",                                       // provider_token 空 ＝ Stars
      "XTR",                                    // 货币代码
      [{ label: "价格", amount: price }]
    );
    await ctx.reply(`🛒 请点击下方链接支付 **${price} Star** 来完成测试：\n${link}`, {
      disable_web_page_preview: true,
    });
  } else {
    // 其他菜单按钮暂时提示开发中
    let text = "";
    if (action === "menu_channels") text = "📺 频道浏览功能开发中...";
    else if (action === "menu_list") text = "📋 内容列表功能开发中...";
    else if (action === "menu_my") text = "📦 已购内容功能开发中...";
    else if (action === "menu_help") text = "❓ 使用 /start 打开主菜单。";
    await ctx.reply(text);
  }
  await ctx.answerCallbackQuery();
});

// ========== 支付流程处理 ==========

// 1. 预支付检查（必须应答 true）
bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

// 2. 支付成功后发货
bot.on("message:successful_payment", async (ctx) => {
  const payment = ctx.message.successful_payment;
  const payload = payment.invoice_payload;          // 我们传入的 "test_payment_1"
  const totalAmount = payment.total_amount;         // 支付的 Stars 数量

  // 根据 payload 判断是哪个商品（这里简单演示，直接发送测试内容）
  if (payload === "test_payment_1") {
    await ctx.reply(
      `✅ 支付成功！你刚刚支付了 **${totalAmount} Star**。\n\n` +
      `这是你购买的测试内容：\n` +
      `“Hello！这是一条通过 Stars 支付解锁的独家消息。”\n\n` +
      `后续你可以将此处替换为从私密频道转发真实内容的逻辑。`
    );
  } else {
    await ctx.reply("❌ 未知的支付项目，请联系管理员。");
  }
});

// 兜底处理
bot.on("message:text", async (ctx) => {
  await ctx.reply("发送 /start 打开主菜单。");
});

// ========== 导出 fetch 处理器（Deno Deploy Webhook 模式） ==========
const handle = webhookCallback(bot, "std/http");
export default {
  fetch(req: Request) {
    return handle(req);
  },
};
