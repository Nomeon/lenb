<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { read, utils, writeFile } from 'xlsx';
	import * as Table from '$lib/components/ui/table';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import Board from '$lib/components/board.svelte';

	let fileInput: HTMLInputElement;
	let tableData: any;
	let board: any;

	const loadXLSX = async (e: any) => {
		const file = e.target.files[0];
		const fileContent = await file.arrayBuffer();
		const workbook = read(fileContent);
		const data = utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

		// Only keep rows where the "afdeling" column is not empty
		const filteredData = data.filter((row: any) => row.afdeling === 'Frezen hal 1');

		// Only keep the columns "Planpl", "PlanpO", "StartWk", "Uren", "ProdNr", "Matnr.", "Omschr"
		const columns = ['Planpl', 'PlanpO', 'StartWk', 'Uren', 'ProdNr', 'Matnr.', 'Omschr'];
		const filteredData2 = filteredData.map((row: any) => {
			const newRow: any = {};
			columns.forEach((column) => {
				newRow[column] = row[column];
			});
			return newRow;
		});

		// Filter on the current week in column "StartWk"
		const currentWeek = '16';
		const filteredData3 = filteredData2.filter((row: any) => row.StartWk.includes(currentWeek));

		tableData = filteredData3;

		// Add a column id to the tableData
		tableData = tableData.map((row: any, i: number) => {
			row.id = i;
			return row;
		});

		// Create a board object
		board = [
			{
				id: 1,
				name: 'Nog te plannen',
				capacity: 100000,
				dropDisabled: false,
				items: tableData
			},
			{
				id: 2,
				name: 'Machine 1',
				capacity: 10,
				dropDisabled: false,
				items: []
			},
			{
				id: 3,
				name: 'Machine 2',
				capacity: 20,
				dropDisabled: false,
				items: []
			},
			{
				id: 4,
				name: 'Machine 3',
				capacity: 6,
				dropDisabled: false,
				items: []
			},
			{
				id: 5,
				name: 'Machine 4',
				capacity: 10,
				dropDisabled: false,
				items: []
			}
		];
	};
</script>

<input
	class="hidden"
	type="file"
	bind:this={fileInput}
	accept=".xlsx"
	on:change={(e) => loadXLSX(e)}
/>
<Button
	on:click={() => {
		fileInput.click();
	}}>Import Excel</Button
>

{#if tableData}
	<Collapsible.Root>
		<Collapsible.Trigger>
			<Button>Show table</Button>
		</Collapsible.Trigger>
		<Collapsible.Content>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Planpl</Table.Head>
						<Table.Head>PlanpO</Table.Head>
						<Table.Head>StartWk</Table.Head>
						<Table.Head>Uren</Table.Head>
						<Table.Head>ProdNr</Table.Head>
						<Table.Head>Matnr.</Table.Head>
						<Table.Head>Omschr</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each tableData as row, i (i)}
						<Table.Row>
							<Table.Cell>{row.Planpl}</Table.Cell>
							<Table.Cell>{row.PlanpO}</Table.Cell>
							<Table.Cell>{row.StartWk}</Table.Cell>
							<Table.Cell>{row.Uren}</Table.Cell>
							<Table.Cell>{row.ProdNr}</Table.Cell>
							<Table.Cell>{row['Matnr.']}</Table.Cell>
							<Table.Cell>{row.Omschr}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Collapsible.Content>
	</Collapsible.Root>

	<Board columnItems={board} />
{/if}
