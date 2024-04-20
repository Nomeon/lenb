import { PrismaClient } from '@prisma/client';
import machineData from '../src/lib/machines.json' assert { type: 'json' };

const prisma = new PrismaClient();

async function main() {
	console.log('Start seeding...');

	const hal = await prisma.hal.create({
		data: {
			afdeling: 'Frezen hal 1',
			machines: {
				create: [
					{
						naam: 'Nog te plannen',
						capaciteit: 1000000,
						items: {
							create: [
								{
									planpl: 'FRFEH',
									planpo: 'Frezen Fehlmann',
									bewerking: '2188',
									bemand: 100,
									uren: 2.5,
									aantal: 34,
									matnr: 'NUCVEE00255',
									omschrijving: 'Fill block',
									startdatum: null
								},
								{
									planpl: 'FRDMG9',
									planpo: 'Frezen DMG 60 EVO',
									bewerking: '2182',
									bemand: 10,
									uren: 7,
									aantal: 12,
									matnr: 'LARZEE00827',
									omschrijving: 'Segmenten Ventral blokken',
									startdatum: null
								}
							]
						}
					}
				]
			}
		}
	});

	console.log(`Created hal with id: ${hal.id}`);

	// Loop through additional machines data to create machines within the same "hal"
	for (const machine of machineData) {
		await prisma.machine.create({
			data: {
				halId: hal.id, // Associate the machine with the created "hal"
				naam: machine.naam,
				capaciteit: machine.capaciteit
			}
		});
		console.log(`Created machine with id: ${machine.id}`);
	}

	console.log('Seeding finished.');
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
