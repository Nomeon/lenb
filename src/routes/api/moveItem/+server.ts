import prisma from '$lib/prisma';

export async function PATCH({ request }): Promise<Response> {
	try {
		const body = await request.json();
		const { cid, itemId } = body;

		await prisma.handeling.update({
			where: {
				id: Number(itemId)
			},
			data: {
				machineId: Number(cid),
				startdatum: null
			}
		});

		return new Response('OK', { status: 200 });
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 });
	}
}
