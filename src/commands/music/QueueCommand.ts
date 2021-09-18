import { DefineCommand } from "../../utils/decorators/DefineCommand";
import { CommandContext } from "../../structures/CommandContext";
import { BaseCommand } from "../../structures/BaseCommand";
import { ButtonPagination } from "../../utils/ButtonPagination";
import { chunk } from "../../utils/chunk";
import { createEmbed } from "../../utils/createEmbed";

@DefineCommand({
    aliases: ["q"],
    description: "Show the current queue",
    name: "queue",
    slash: {
        name: "queue"
    },
    usage: "{prefix}queue"
})
export class QueueCommand extends BaseCommand {
    public async execute(ctx: CommandContext): Promise<any> {
        if (!ctx.guild?.queue) return ctx.reply({ embeds: [createEmbed("warn", "There is nothing playing.")] });

        const songs = ctx.guild.queue.songs.sortByIndex();
        const pages = await Promise.all(chunk([...songs.values()], 10).map(async (s, n) => {
            const names = await Promise.all(s.map((song, i) => `${(n * 10) + (i + 1)} - [${song.song.title}](${song.song.url})`));

            return names.join("\n");
        }));
        const embed = createEmbed("info", pages[0]);
        const msg = await ctx.reply({ embeds: [embed] });

        return (new ButtonPagination(msg, {
            author: ctx.author.id,
            edit: (i, e, p) => e.setDescription(p),
            embed,
            pages
        })).start();
    }
}
