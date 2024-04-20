import prisma from '$lib/prisma';

export async function DELETE({ request }): Promise<Response> {
	try {
		const body = await request.json();
		const { itemId } = body;

        console.log(itemId)

		await prisma.handeling.delete({
			where: {
				id: Number(itemId)
			}
		});

		return new Response('OK', { status: 200 });
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 });
	}
}
