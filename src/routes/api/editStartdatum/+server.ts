import prisma from '$lib/prisma';

export async function PATCH({ request }): Promise<Response> {
	try {
		const body = await request.json();
		const { startdatum, itemId } = body;

		let newDate: Date | null;
		if (startdatum !== '') {
			newDate = new Date(startdatum);
		} else {
			newDate = null;
		}

		await prisma.handeling.update({
			where: {
				id: Number(itemId)
			},
			data: {
				startdatum: newDate
			}
		});

		return new Response('OK', { status: 200 });
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 });
	}
}
