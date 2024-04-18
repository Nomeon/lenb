import prisma from '$lib/prisma';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (async () => {
    const machines = await prisma.machine.findMany({ 
        where: { 
            halId: 1
        },
        include: {
            items: true // Include handelingen associated with each machine
        }
    });

    return { response: machines };
});