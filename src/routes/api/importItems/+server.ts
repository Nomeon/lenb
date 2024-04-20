import prisma from '$lib/prisma';

export async function POST({ request }): Promise<Response> {
	try {
		const body = await request.json();
        const items = await prisma.$transaction(
            body.items.map((item: never) => prisma.handeling.create({ data: item }))
        )
		return new Response(JSON.stringify(items), { status: 200 });
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 });
	}
}
