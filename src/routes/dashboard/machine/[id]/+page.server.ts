import prisma from "$lib/prisma";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = (async ({ params: { id } }) => {
    const machine = await prisma.machine.findUnique({
        where: { id: Number(id) },
        include: {
            items: true
        }
    });

    return { response: machine };

});